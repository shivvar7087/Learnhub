import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { semesterNames } from '../data/catalog'
import { useContent } from '../context/ContentContext'
import MaterialRow from '../components/MaterialRow'
import PreviewModal from '../components/PreviewModal'
import { Atom, CalendarDays, FileText, Search, SlidersHorizontal } from '../components/Icons'
import AdminQuickUpload from '../components/AdminQuickUpload'
import { useAuth } from '../context/AuthContext'
import { readUserData } from '../utils/userData'

const paperYears=['2023','2024','2025','2026']

export default function Papers(){
 const {materials,courses}=useContent()
 const {user}=useAuth()
 const [params]=useSearchParams()
 const [sem,setSem]=useState('All semesters'),[subject,setSubject]=useState('All subjects'),[year,setYear]=useState('All years'),[query,setQuery]=useState(()=>params.get('search')||''),[preview,setPreview]=useState(null),[onlyEnrolled,setOnlyEnrolled]=useState(false)
 const savedEnrollment=readUserData('learnhub-enrolled',user,[]),enrolled=Array.isArray(savedEnrollment)?savedEnrollment:[]
 useEffect(()=>setQuery(params.get('search')||''),[params])
 const papers=materials.filter(m=>m.type==='Question Paper').map(p=>({...p,paperYear:p.paperYear||p.title.match(/20\d{2}/)?.[0]||''}))
 const filtered=useMemo(()=>papers.filter(p=>{const course=courses.find(item=>item.name===p.course||item.code===p.code);return (subject==='All subjects'||p.course===subject)&&(year==='All years'||p.paperYear===year)&&(sem==='All semesters'||course?.semester===Number(sem.slice(-1)))&&(!onlyEnrolled||enrolled.includes(course?.id))&&(!query||`${p.title} ${p.course} ${p.code}`.toLowerCase().includes(query.toLowerCase()))}),[sem,subject,year,query,materials,courses,onlyEnrolled,enrolled.join('|')])
 return <div className="papers-page"><div className="page-heading-row"><div><div className="section-kicker">PRACTICE MAKES PROGRESS</div><h1>Previous year papers</h1><p>Past papers from AKTU to help you walk into exams with confidence.</p></div><div className="heading-actions"><div className="heading-stat"><FileText size={17}/><span><b>{papers.length}</b> papers</span></div><AdminQuickUpload defaultCourse={subject==='All subjects'?'':subject} defaultType="Question Paper" defaultYear={year==='All years'?'':year} label="Upload paper"/></div></div>
  <div className="quantum-page-shortcut"><span><Atom size={17}/> Quantum practice material is also available.</span><Link to="/quantum">Open Quantum pages <span>↗</span></Link></div>
  <div className="papers-banner"><div className="papers-banner-mark"><CalendarDays size={23}/></div><div><b>Know the pattern. Own the exam.</b><p>Practice with real AKTU papers, organized by semester and subject.</p></div><div className="paper-years" aria-label="Filter papers by year">{paperYears.map(y=><button type="button" key={y} className={year===y?'selected':''} aria-pressed={year===y} onClick={()=>setYear(year===y?'All years':y)}>{y}</button>)}</div></div>
  <div className="paper-filter-panel"><div><div className="section-kicker">FIND YOUR PAPER</div><div className="paper-selects"><select aria-label="Filter by semester" value={sem} onChange={e=>setSem(e.target.value)}><option>All semesters</option>{semesterNames.map(s=><option key={s}>{s}</option>)}</select><select aria-label="Filter by subject" value={subject} onChange={e=>setSubject(e.target.value)}><option>All subjects</option>{courses.map(c=><option key={c.id}>{c.name}</option>)}</select><select aria-label="Filter by year" value={year} onChange={e=>setYear(e.target.value)}><option>All years</option>{paperYears.slice().reverse().map(y=><option key={y}>{y}</option>)}</select><label className="filter-search"><Search size={16}/><input placeholder="Search papers..." value={query} onChange={e=>setQuery(e.target.value)}/></label><button type="button" className={`filter-toggle ${onlyEnrolled?'filter-on':''}`} aria-pressed={onlyEnrolled} onClick={()=>setOnlyEnrolled(value=>!value)}><SlidersHorizontal size={15}/> Enrolled</button></div></div></div>
  <div className="paper-results-head"><h2>Available question papers</h2><span>{filtered.length} results</span></div><div className="material-list material-list-full"><div className="material-list-head"><span>QUESTION PAPER</span><span>TYPE</span><span>ADDED</span><span>SIZE</span><span/></div>{filtered.length?filtered.map(m=><MaterialRow key={m.id} item={m} onView={setPreview}/>):<div className="empty-state"><Search size={24}/><h3>No papers match those filters</h3><p>Try selecting another semester, subject or year.</p></div>}</div><PreviewModal item={preview} onClose={()=>setPreview(null)}/>
 </div>
}
