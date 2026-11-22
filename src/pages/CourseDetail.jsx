import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Atom, BookOpen, Check, ChevronDown, Download, FileText, Search, Sparkles } from '../components/Icons'
import PreviewModal from '../components/PreviewModal'
import { downloadMaterial } from '../services/documents'
import { recordLearningActivity } from '../utils/learningActivity'
import AdminQuickUpload from '../components/AdminQuickUpload'
import { readUserData, writeUserData } from '../utils/userData'
import { recordCourseResourceProgress } from '../utils/userData'

export default function CourseDetail(){
 const {materials,courses}=useContent()
 const {user}=useAuth()
 const {id}=useParams(),navigate=useNavigate(),course=courses.find(c=>c.id===id)
 const [enrolled,setEnrolled]=useState(()=>{const value=readUserData('learnhub-enrolled',user,[]);return Array.isArray(value)?value:[]})
 const [section,setSection]=useState('notes'),[preview,setPreview]=useState(null),[resourceSearch,setResourceSearch]=useState('')
 useEffect(()=>{if(course)recordLearningActivity(new Date(),user)},[course?.id,user?.email])
 if(!course)return <div className="empty-state"><h2>Course not found</h2><Link to="/courses">Back to courses</Link></div>
 const active=enrolled.includes(course.id)
 const docs=materials.filter(m=>m.code===course.code)
 const notes=docs.filter(m=>['PDF Notes','Chapter Notes'].includes(m.type))
 const questions=docs.filter(m=>m.type==='Important Questions')
 const visible=section==='notes'?notes:questions
 const matchingResources=visible.filter(item=>`${item.title} ${item.course} ${item.code} ${item.type}`.toLowerCase().includes(resourceSearch.toLowerCase()))
 const openPreview=item=>{recordLearningActivity(new Date(),user);recordCourseResourceProgress(user,item.code,item.id,docs.length);setPreview(item)}
 const toggle=()=>{const next=active?enrolled.filter(x=>x!==course.id):[...enrolled,course.id];writeUserData('learnhub-enrolled',user,next);setEnrolled(next)}

 return <div className="detail-page">
  <Link className="back-link" to="/courses"><ArrowLeft size={16}/> All courses</Link>
  <section className={`detail-hero ${course.color}`}>
   <span className="detail-icon">{course.icon}</span>
   <div className="detail-hero-text"><div className="detail-meta">SEMESTER {course.semester} · {course.code} · {course.category.toUpperCase()}</div><h1>{course.name}</h1><p>{course.description}</p><div className="detail-byline"><span>{course.teacher}</span><span><BookOpen size={15}/> {course.lessons} lessons</span></div></div>
   <button className={active?'button-enrolled':'button-light'} onClick={toggle}>{active?<><Check size={16}/> Enrolled</>:<>+ Enroll in course</>}</button>
  </section>

  <section className="subject-resources">
   <div className="subject-resource-heading"><div><div className="section-kicker">YOUR SUBJECT RESOURCES</div><h2>What would you like to study?</h2><p>Choose a subject to see its notes and important questions.</p></div><div className="subject-resource-tools"><label className="subject-picker"><Search size={16}/><select aria-label="Choose a subject" value={course.id} onChange={e=>navigate(`/courses/${e.target.value}`)}>{courses.map(c=><option key={c.id} value={c.id}>{c.name} · {c.code}</option>)}</select><ChevronDown size={15}/></label><AdminQuickUpload defaultCourse={course.name} defaultType={section==='questions'?'Important Questions':'PDF Notes'}/></div></div>

   <div className="resource-tabs" role="tablist" aria-label="Resource type"><button role="tab" aria-selected={section==='notes'} className={section==='notes'?'selected':''} onClick={()=>setSection('notes')}><FileText size={16}/> Study notes <span>{notes.length}</span></button><button role="tab" aria-selected={section==='questions'} className={section==='questions'?'selected':''} onClick={()=>setSection('questions')}><Sparkles size={16}/> Important questions <span>{questions.length}</span></button></div>
   <label className="filter-search subject-resource-search"><Search size={15}/><input aria-label="Filter subject resources" placeholder={`Search ${course.name} resources...`} value={resourceSearch} onChange={e=>setResourceSearch(e.target.value)}/></label>

   <div className="subject-resource-list">{matchingResources.length?matchingResources.map(item=><div className="subject-resource-item" key={item.id}><div className="material-icon"><FileText size={19}/></div><div className="subject-resource-info"><b>{item.title}</b><span>{item.course} · {item.code} · {item.pages} pages</span></div><span className="type-pill">{item.type}</span><div className="subject-resource-actions"><button className="button-secondary" onClick={()=>openPreview(item)}>Preview</button><button className="button-primary" onClick={()=>downloadMaterial(item,user,docs.length)}><Download size={15}/> Download</button></div></div>):<div className="empty-state"><FileText size={25}/><h3>{resourceSearch?'No matching resources':section==='notes'?'No notes yet':'No important questions yet'}</h3><p>{resourceSearch?'Try a different title, subject code, or resource type.':'Choose another subject or check back after new resources are added.'}</p></div>}</div>
   <div className="resource-tip"><Sparkles size={16}/><span>Resources are filtered for <b>{course.name}</b>. Choose another subject above to switch your study material.</span></div>
   <Link className="quantum-course-link" to={`/quantum?subject=${encodeURIComponent(course.id)}`}><Atom size={16}/> Open this subject in Quantum pages <span>Notes, questions, and papers</span></Link>
  </section>
  <PreviewModal item={preview} onClose={()=>setPreview(null)}/>
 </div>
}
