import { createContext, useContext, useEffect, useState } from 'react'
import { courses as seedCourses, materials as seedMaterials } from '../data/catalog'
import { removeUploadedFile, saveUploadedFile } from '../services/fileStore'
import { apiRequest } from '../services/api'
import { useAuth } from './AuthContext'
import { readUserData, writeUserData } from '../utils/userData'

const ContentContext=createContext(null)
const UPLOADS_KEY='learnhub-uploaded-resources'
const HIDDEN_KEY='learnhub-hidden-resources'
const OVERRIDES_KEY='learnhub-resource-overrides'
const CUSTOM_COURSES_KEY='learnhub-custom-courses'
const HIDDEN_COURSES_KEY='learnhub-hidden-courses'
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
const iconMap={sum:'∑',command:'⌘',bolt:'ϟ',database:'◫',atom:'◉',square:'▣',wave:'∿',diamond:'◇'}
const normalizeCourse=course=>({...course,icon:iconMap[course.icon]||course.icon})

function initialResources(){
 const hidden=new Set(read(HIDDEN_KEY,[]))
 const overrides=read(OVERRIDES_KEY,{})
 const uploaded=read(UPLOADS_KEY,[])
 const uploadedIds=new Set(uploaded.map(item=>item.id))
 return [...seedMaterials.filter(item=>!hidden.has(item.id)&&!uploadedIds.has(item.id)).map(item=>({...item,...overrides[item.id]})),...uploaded]
}
function initialCourses(){
 const hidden=new Set(read(HIDDEN_COURSES_KEY,[]))
 const overrides=read('learnhub-course-overrides',{})
 const custom=read(CUSTOM_COURSES_KEY,[])
 const customIds=new Set(custom.map(course=>course.id))
 return [...seedCourses.filter(course=>!hidden.has(course.id)&&!customIds.has(course.id)).map(course=>({...course,...overrides[course.id]})),...custom]
}

export function ContentProvider({children}){
 const {user}=useAuth()
 const [materials,setMaterials]=useState(initialResources)
 const [courses,setCourses]=useState(initialCourses)
 const [apiConnected,setApiConnected]=useState(false)

 useEffect(()=>{
  let active=true
  Promise.all([apiRequest('/api/courses'),apiRequest('/api/resources')]).then(([courseData,resourceData])=>{
   if(!active)return
   setCourses(courseData.map(normalizeCourse))
   setMaterials(resourceData)
   setApiConnected(true)
  }).catch(()=>{if(active)setApiConnected(false)})
  return()=>{active=false}
 },[])

 const addMaterial=async(values,file)=>{
  if(apiConnected){
   const form=new FormData()
   form.append('title',values.title);form.append('course',values.course);form.append('code',values.code);form.append('type',values.type);form.append('paper_year',values.paperYear||'');form.append('file',file)
   const item=await apiRequest('/api/resources',{method:'POST',body:form})
   setMaterials(current=>[item,...current])
   return item
  }
  const id=`upload-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
  await saveUploadedFile(id,file)
  const item={...values,id,storageKey:id,uploaded:true,fileName:file.name,size:`${(file.size/1024/1024).toFixed(2)} MB`,date:'Just added',pages:1,icon:'file'}
  const next=[item,...materials]
  setMaterials(next)
  localStorage.setItem(UPLOADS_KEY,JSON.stringify(next.filter(x=>x.uploaded)))
  return item
 }

 const deleteMaterial=async id=>{
  const item=materials.find(x=>x.id===id)
  if(apiConnected)await apiRequest(`/api/resources/${encodeURIComponent(id)}`,{method:'DELETE'})
  const next=materials.filter(x=>x.id!==id)
  setMaterials(next)
  if(apiConnected){return}
  if(item?.uploaded){
   localStorage.setItem(UPLOADS_KEY,JSON.stringify(next.filter(x=>x.uploaded)))
   if(seedMaterials.some(seed=>seed.id===id)){const hidden=read(HIDDEN_KEY,[]);if(!hidden.includes(id))localStorage.setItem(HIDDEN_KEY,JSON.stringify([...hidden,id]))}
   await removeUploadedFile(item.storageKey)
  }else{
   const hidden=read(HIDDEN_KEY,[])
   if(!hidden.includes(id))localStorage.setItem(HIDDEN_KEY,JSON.stringify([...hidden,id]))
  }
 }

 const updateMaterial=async(id,values,file)=>{
  const existing=materials.find(item=>item.id===id)
  if(!existing)throw new Error('Resource no longer exists.')
  if(apiConnected){
   if(file){const body=new FormData();body.append('file',file);await apiRequest(`/api/resources/${encodeURIComponent(id)}/file`,{method:'PUT',body})}
   const body={title:values.title,course:values.course,code:values.code,type:values.type,paper_year:values.paperYear||''}
   const updated=await apiRequest(`/api/resources/${encodeURIComponent(id)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
   setMaterials(current=>current.map(item=>item.id===id?updated:item))
   return updated
  }
  if(file){
   const storageKey=existing.storageKey||id
   await saveUploadedFile(storageKey,file)
   values={...values,uploaded:true,storageKey,fileName:file.name,size:`${(file.size/1024/1024).toFixed(2)} MB`}
  }
  const updated={...existing,...values}
  const next=materials.map(item=>item.id===id?updated:item)
  setMaterials(next)
  if(existing.uploaded||file){localStorage.setItem(UPLOADS_KEY,JSON.stringify(next.filter(item=>item.uploaded)))}
  else{const overrides=read(OVERRIDES_KEY,{});localStorage.setItem(OVERRIDES_KEY,JSON.stringify({...overrides,[id]:values}))}
  return updated
 }

 const addCourse=async values=>{
  const id=`custom-${values.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}-${Date.now().toString(36)}`
  const course={id,lessons:0,units:0,progress:0,teacher:'LearnHub Faculty',updated:'Just added',popular:false,color:'blue',icon:'+',...values}
  if(apiConnected){const saved=normalizeCourse(await apiRequest('/api/courses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(course)}));setCourses(current=>[...current,saved]);return saved}
  const next=[...courses,course]
  setCourses(next)
  localStorage.setItem(CUSTOM_COURSES_KEY,JSON.stringify(next.filter(item=>item.id.startsWith('custom-'))))
  return course
 }

 const deleteCourse=async id=>{
  const removed=courses.find(course=>course.id===id)
  if(apiConnected)await apiRequest(`/api/courses/${encodeURIComponent(id)}`,{method:'DELETE'})
  const next=courses.filter(course=>course.id!==id)
  setCourses(next)
  if(removed)setMaterials(current=>current.filter(item=>item.course!==removed.name))
  const savedEnrollment=readUserData('learnhub-enrolled',user,[]),enrolled=Array.isArray(savedEnrollment)?savedEnrollment.filter(courseId=>courseId!==id):[]
  writeUserData('learnhub-enrolled',user,enrolled)
  if(apiConnected)return
  localStorage.setItem(CUSTOM_COURSES_KEY,JSON.stringify(next.filter(course=>course.id.startsWith('custom-'))))
  if(seedCourses.some(course=>course.id===id)){const hidden=read(HIDDEN_COURSES_KEY,[]);if(!hidden.includes(id))localStorage.setItem(HIDDEN_COURSES_KEY,JSON.stringify([...hidden,id]))}
 }

 const restoreSeedCourses=async()=>{if(apiConnected){const data=await apiRequest('/api/courses');setCourses(data.map(normalizeCourse));return}localStorage.removeItem(HIDDEN_COURSES_KEY);localStorage.removeItem('learnhub-course-overrides');setCourses([...seedCourses,...read(CUSTOM_COURSES_KEY,[])])}

 const restoreSeedMaterials=()=>{
  if(apiConnected){apiRequest('/api/resources').then(setMaterials).catch(()=>{});return}
  localStorage.removeItem(HIDDEN_KEY)
  localStorage.removeItem(OVERRIDES_KEY)
  const uploaded=read(UPLOADS_KEY,[])
  setMaterials([...seedMaterials,...uploaded])
 }

 return <ContentContext.Provider value={{materials,addMaterial,updateMaterial,deleteMaterial,restoreSeedMaterials,courses,addCourse,deleteCourse,restoreSeedCourses,apiConnected}}>{children}</ContentContext.Provider>
}
export const useContent=()=>useContext(ContentContext)
