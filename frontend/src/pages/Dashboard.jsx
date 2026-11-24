import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import CourseCard from '../components/CourseCard'
import MaterialRow from '../components/MaterialRow'
import PreviewModal from '../components/PreviewModal'
import { useAuth } from '../context/AuthContext'
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, FileText, Play, Search, Sparkles } from '../components/Icons'
import { formatToday } from '../utils/formatDate'
import { getLearningStreak, getWeeklyProgress } from '../utils/learningActivity'
import { readUserData, getCourseProgress } from '../utils/userData'

export default function Dashboard(){
 const {user}=useAuth(),{materials,courses}=useContent()
 const [enrolled,setEnrolled]=useState(()=>readUserData('learnhub-enrolled',user,[])),[preview,setPreview]=useState(null),[filter,setFilter]=useState('')
 const first=courses.find(c=>enrolled.includes(c.id))||courses[0]||{id:''}, enrolledCourses=courses.filter(c=>enrolled.includes(c.id)).map(course=>({...course,progress:getCourseProgress(user,course.code)}))
 const filteredCourses=enrolledCourses.filter(c=>`${c.name} ${c.code} ${c.category}`.toLowerCase().includes(filter.toLowerCase()))
 const filteredMaterials=materials.filter(m=>`${m.title} ${m.course} ${m.code} ${m.type}`.toLowerCase().includes(filter.toLowerCase()))
 const pct=Math.round(enrolledCourses.reduce((a,c)=>a+c.progress,0)/Math.max(1,enrolledCourses.length))
 const streak=getLearningStreak(new Date(),user),weeklyProgress=getWeeklyProgress(new Date(),user)
 const greeting=user?.name?.split(' ')[0]||'there',today=formatToday()
 return <div className="dashboard-page"><section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> {today}</div><h1>Good morning, {greeting}<span className="wave">✳</span></h1><p className="welcome-sub">A little progress each day adds up to big results.</p></div><Link to={`/courses/${first.id}`} className="button-primary continue-button"><Play size={16} fill="currentColor"/> Continue learning</Link></section>
 <div className="quantum-page-shortcut"><span><Sparkles size={17}/> Explore focused Quantum study material.</span><Link to="/quantum">Open Quantum pages <span>↗</span></Link></div>
 <section className="hero-panel"><div className="hero-content"><span className="hero-tag"><Sparkles size={13}/> YOUR LEARNING, IN FOCUS</span><h2>Make this semester<br/>your <em>strongest</em> yet.</h2><p>Everything you need to stay ahead, all in one place.</p><Link to="/courses" className="hero-link">Explore your courses <ArrowUpRight size={16}/></Link></div><div className="hero-illustration"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-books"><span/><span/><span/></div><div className="hero-note note-one">∑ &nbsp; y = mx + c</div><div className="hero-note note-two">{pct}% &nbsp; semester progress</div><div className="hero-star star-one">✳</div><div className="hero-star star-two">✦</div><div className="hero-orb"/></div></section>
 <section className="stats-grid"><Stat to="/courses?enrolled=true" icon={BookOpen} label="Enrolled courses" value={String(enrolledCourses.length).padStart(2,'0')} foot="Across your semester" tone="blue"/><Stat to="/courses" icon={CalendarDays} label="Learning streak" value={`${streak} ${streak===1?'day':'days'}`} foot={streak?'You are on a roll!':'Open a course to start'} tone="amber"/><Stat to="/materials" icon={FileText} label="Study materials" value={materials.length} foot="Ready when you are" tone="violet"/><Stat to="/courses?enrolled=true" icon={Clock3} label="Weekly progress" value={`${weeklyProgress}%`} foot="Study days logged this week" tone="green"/></section>
 <label className="filter-search dashboard-search"><Search size={16}/><input aria-label="Filter dashboard courses and resources" placeholder="Filter your courses and study materials..." value={filter} onChange={e=>setFilter(e.target.value)}/></label>
 <section className="section-block"><div className="section-title-row"><div><div className="section-kicker">PICK UP WHERE YOU LEFT OFF</div><h2>Your courses <span className="count-badge">{filteredCourses.length}</span></h2></div><Link to="/courses" className="text-link">All courses <ArrowUpRight size={15}/></Link></div><div className="course-grid">{filteredCourses.slice(0,3).map(c=><CourseCard key={c.id} course={c}/>)}</div>{!filteredCourses.length&&<div className="dashboard-filter-empty">No enrolled courses match “{filter}”.</div>}</section>
 <section className="section-block recent-section"><div className="section-title-row"><div><div className="section-kicker">FRESH OFF THE PRESS</div><h2>Recently added</h2></div><Link to="/materials" className="text-link">Browse library <ArrowUpRight size={15}/></Link></div><div className="material-list">{filteredMaterials.slice(0,4).map(m=><MaterialRow key={m.id} item={m} onView={setPreview}/>)}</div>{!filteredMaterials.length&&<div className="dashboard-filter-empty">No study materials match “{filter}”.</div>}</section>
 <PreviewModal item={preview} onClose={()=>setPreview(null)}/></div>
}
function Stat({to,icon:Icon,label,value,foot,tone}){return <Link className="stat-card" to={to}><span className={`stat-icon ${tone}`}><Icon size={18}/></span><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></Link>}
