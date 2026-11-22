import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { UserRound, Mail, GraduationCap, LogOut, Check, Save, Search, Smartphone, BookOpen, CalendarDays } from '../components/Icons'
import { readUserData, writeUserData, getCourseProgress } from '../utils/userData'
import { getLearningStreak, getWeeklyProgress } from '../utils/learningActivity'

const profileDefaults=user=>({name:user?.name||'',email:user?.email||'',phone:'',university:'Dr. A.P.J. Abdul Kalam Technical University',branch:'CSE',semester:'1'})

export default function Profile(){
 const {user,logout,updateProfile}=useAuth(),{courses}=useContent(),navigate=useNavigate()
 const [saved,setSaved]=useState(false),[error,setError]=useState(''),[courseSearch,setCourseSearch]=useState('')
 const [details,setDetails]=useState(()=>({...profileDefaults(user),...readUserData('learnhub-profile',user,{})}))
 const savedEnrollment=readUserData('learnhub-enrolled',user,[]),enrolled=Array.isArray(savedEnrollment)?savedEnrollment:[]
 const enrolledCourses=courses.filter(course=>enrolled.includes(course.id))
 const filteredCourses=enrolledCourses.filter(course=>`${course.name} ${course.code} ${course.category}`.toLowerCase().includes(courseSearch.toLowerCase()))
 const streak=getLearningStreak(new Date(),user),weeklyProgress=getWeeklyProgress(new Date(),user)
 const completionFields=[details.name,details.email,details.phone,details.university,details.branch,details.semester]
 const completion=Math.round(completionFields.filter(value=>String(value||'').trim()).length/completionFields.length*100)
 const set=(key,value)=>{setDetails(current=>({...current,[key]:value}));setSaved(false);setError('')}
 const save=()=>{
  const digits=(details.phone||'').replace(/\D/g,'')
  if(details.name.trim().length<2)return setError('Enter your full name.')
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()))return setError('Enter a valid email address.')
  if(digits&&digits.length!==10&&!(digits.length===12&&digits.startsWith('91')))return setError('Enter a valid 10-digit mobile number, with or without +91.')
  const updated={...details,name:details.name.trim(),email:details.email.trim().toLowerCase(),phone:details.phone.trim()}
  writeUserData('learnhub-profile',user,updated)
  updateProfile({name:updated.name,email:updated.email,phone:updated.phone})
  setDetails(updated);setSaved(true);setError('')
  setTimeout(()=>setSaved(false),2200)
 }
 const signout=()=>{logout();navigate('/')}
 return <div className="profile-page">
  <div className="page-heading-row"><div><div className="section-kicker">YOUR LEARNING PROFILE</div><h1>My profile</h1><p>Manage your contact details, academic information, and learning progress.</p></div></div>
  <div className="profile-layout">
   <section className="profile-card"><div className="profile-cover"/><div className="profile-main"><span className="profile-large-avatar">{details.name?.[0]||'S'}</span><div className="profile-id"><h2>{details.name||'Student account'}</h2><span>{details.email||'Not signed in'}</span></div><span className="student-pill"><GraduationCap size={14}/> Student</span></div>
    <div className="profile-completion"><div><span>PROFILE COMPLETION</span><b>{completion}%</b></div><div className="profile-completion-track"><i style={{width:`${completion}%`}}/></div><small>Add your contact and academic details to complete your profile.</small></div>
    <div className="profile-fields"><h3>Personal details</h3>
     <label><span>FULL NAME</span><div><UserRound size={17}/><input value={details.name} onChange={event=>set('name',event.target.value)} placeholder="Your name" autoComplete="name"/></div></label>
     <label><span>EMAIL ADDRESS</span><div><Mail size={17}/><input type="email" value={details.email} onChange={event=>set('email',event.target.value)} placeholder="student@university.edu" autoComplete="email"/></div></label>
     <label><span>MOBILE PHONE</span><div><Smartphone size={17}/><input type="tel" inputMode="tel" maxLength={18} value={details.phone||''} onChange={event=>set('phone',event.target.value)} placeholder="+91 98765 43210" autoComplete="tel"/></div></label>
     <h3 className="profile-section-label">Academic details</h3>
     <label><span>UNIVERSITY</span><div><GraduationCap size={17}/><input value={details.university||''} onChange={event=>set('university',event.target.value)} placeholder="Your university"/></div></label>
     <div className="profile-academic-fields"><label><span>BRANCH</span><div><BookOpen size={16}/><select value={details.branch||'CSE'} onChange={event=>set('branch',event.target.value)}>{['CSE','AI&DS','AI','ECE','EE','ME','CE','Other'].map(branch=><option key={branch}>{branch}</option>)}</select></div></label><label><span>SEMESTER</span><div><CalendarDays size={16}/><select value={details.semester||'1'} onChange={event=>set('semester',event.target.value)}>{Array.from({length:8},(_,index)=><option key={index+1} value={String(index+1)}>Semester {index+1}</option>)}</select></div></label></div>
     {error&&<div className="auth-error" role="alert">{error}</div>}
     <div className="profile-buttons"><button className="button-primary" onClick={save}>{saved?<><Check size={16}/> Saved</>:<><Save size={16}/> Save changes</>}</button><button className="button-secondary" onClick={signout}><LogOut size={16}/> Sign out</button></div>
     <div className="profile-note">Your profile details are saved separately for this account on this device.</div>
    </div>
   </section>
   <aside className="profile-aside">
    <div className="aside-card profile-summary"><div className="section-kicker">YOUR LEARNING SNAPSHOT</div><div className="summary-big">{enrolled.length}<small>enrolled courses</small></div><div className="profile-learning-stats"><div><span>Learning streak</span><b>{streak} {streak===1?'day':'days'}</b></div><div><span>This week's activity</span><b>{weeklyProgress}%</b></div></div><Link className="aside-browse" to="/courses">Explore courses <span>↗</span></Link></div>
    <div className="aside-card"><div className="section-title-row"><h3>Enrolled courses</h3><span className="count-badge">{enrolledCourses.length}</span></div><label className="filter-search profile-course-search"><Search size={15}/><input aria-label="Filter enrolled courses" placeholder="Search enrolled courses..." value={courseSearch} onChange={event=>setCourseSearch(event.target.value)}/></label><div className="profile-course-list">{filteredCourses.map(course=><Link key={course.id} to={`/courses/${course.id}`}><span className={`mini-course-icon ${course.color}`}>{course.icon}</span><span><b>{course.name}</b><small>{course.code}</small></span><span className="mini-progress">{getCourseProgress(user,course.code)}%</span></Link>)}{!filteredCourses.length&&<div className="profile-filter-empty">{courseSearch?'No enrolled courses match that filter.':'You have not enrolled in a course yet.'}</div>}</div></div>
   </aside>
  </div>
 </div>
}
