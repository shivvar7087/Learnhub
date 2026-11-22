import { createContext, useContext, useState } from 'react'
import { migrateLegacyUserData, moveUserData, readUserData } from '../utils/userData'

const AuthContext=createContext(null)
const STUDENTS_KEY='learnhub-students'

function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function initialStudents(){
 const stored=readJson(STUDENTS_KEY,[])
 if(Array.isArray(stored)&&stored.length)return stored
 const user=readJson('learnhub-user',null)
 return user&&!user.isAdmin?[{name:user.name,email:user.email,createdAt:new Date().toISOString()}]:[]
}
function initialUser(){
 const user=readJson('learnhub-user',null)
 if(user)migrateLegacyUserData(user)
 return user
}

export function AuthProvider({children}){
 const [user,setUser]=useState(initialUser)
 const [students,setStudents]=useState(initialStudents)
 const saveStudent=student=>{
  if(!student?.email||student.isAdmin)return
  const stored=readJson(STUDENTS_KEY,students)
  const current=Array.isArray(stored)?stored:[]
  const existing=current.find(item=>item.email===student.email)
  const next=existing?current.map(item=>item.email===student.email?{...item,...student}:item):[...current,{...student,createdAt:new Date().toISOString()}]
  localStorage.setItem(STUDENTS_KEY,JSON.stringify(next));setStudents(next)
 }
 const login=(email,password)=>{
  if(!email.includes('@')||password.length<6)throw new Error('Enter a valid email and a password with at least 6 characters.')
  const normalizedEmail=email.trim().toLowerCase()
  if(normalizedEmail==='admin@learnhub.demo'&&password!=='LearnHubAdmin!')throw new Error('The demo admin password is incorrect.')
  migrateLegacyUserData(readJson('learnhub-user',null))
  const storedStudents=readJson(STUDENTS_KEY,[])
  const existing=Array.isArray(storedStudents)?storedStudents.find(student=>student.email===normalizedEmail):null
  const profile=readUserData('learnhub-profile',{email:normalizedEmail},null)
  const account={name:profile?.name||existing?.name||normalizedEmail.split('@')[0].split(/[._-]/).map(part=>part[0]?.toUpperCase()+part.slice(1)).join(' '),email:normalizedEmail,isAdmin:normalizedEmail==='admin@learnhub.demo'}
  setUser(account);localStorage.setItem('learnhub-user',JSON.stringify(account));saveStudent(account)
 }
 const register=(email,password,name)=>{
  if(!email.includes('@')||password.length<6||name.trim().length<2)throw new Error('Enter your name, a valid email and a password with at least 6 characters.')
  migrateLegacyUserData(readJson('learnhub-user',null))
  const account={name:name.trim(),email:email.trim().toLowerCase(),isAdmin:false}
  setUser(account);localStorage.setItem('learnhub-user',JSON.stringify(account));saveStudent(account)
 }
 const updateProfile=updates=>{
  const account={...user,...updates,email:updates.email?.trim().toLowerCase()||user.email}
  moveUserData(user,account)
  setUser(account);localStorage.setItem('learnhub-user',JSON.stringify(account))
  if(user?.email!==account.email){
   const current=readJson(STUDENTS_KEY,students),rows=Array.isArray(current)?current:[]
   const existing=rows.find(student=>student.email===user.email)
   const next=rows.filter(student=>student.email!==user.email&&student.email!==account.email)
   next.push({...existing,...account,isAdmin:false,createdAt:existing?.createdAt||new Date().toISOString()})
   localStorage.setItem(STUDENTS_KEY,JSON.stringify(next));setStudents(next)
  }else saveStudent(account)
 }
 const logout=()=>{migrateLegacyUserData(user);setUser(null);localStorage.removeItem('learnhub-user')}
 return <AuthContext.Provider value={{user,students,login,register,logout,updateProfile}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext)
