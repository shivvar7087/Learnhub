import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, FileText, ArrowUpRight, Atom, Sparkles, Search, SlidersHorizontal } from '../components/Icons'
import { semesterNames } from '../data/catalog'
import MaterialRow from '../components/MaterialRow'
import PreviewModal from '../components/PreviewModal'
import { useContent } from '../context/ContentContext'
import AdminQuickUpload from '../components/AdminQuickUpload'
import { useAuth } from '../context/AuthContext'
import { readUserData } from '../utils/userData'

const paperYears=['2023','2024','2025','2026']

export default function Quantum(){
 const [tab,setTab]=useState('notes'),[preview,setPreview]=useState(null)
 const [searchParams,setSearchParams]=useSearchParams()
 const [semester,setSemester]=useState('All semesters'),[year,setYear]=useState('All years'),[query,setQuery]=useState(''),[onlyEnrolled,setOnlyEnrolled]=useState(false)
 const {materials,courses}=useContent()
 const {user}=useAuth()
 const savedEnrollment=readUserData('learnhub-enrolled',user,[]),enrolled=Array.isArray(savedEnrollment)?savedEnrollment:[]
 const subjectId=searchParams.get('subject')||'All subjects'
 const selectedCourse=courses.find(course=>course.id===subjectId)
 const filteredResources=useMemo(()=>materials.filter(item=>{
  const course=courses.find(entry=>entry.name===item.course||entry.code===item.code)
  const matchesSubject=subjectId==='All subjects'||course?.id===subjectId
  const matchesSemester=semester==='All semesters'||course?.semester===Number(semester.slice(-1))
  const matchesEnrollment=!onlyEnrolled||enrolled.includes(course?.id)
  const paperYear=item.paperYear||item.title.match(/20\d{2}/)?.[0]||''
  const matchesYear=tab!=='papers'||year==='All years'||paperYear===year
  const matchesQuery=!query||`${item.title} ${item.course} ${item.code} ${item.type}`.toLowerCase().includes(query.toLowerCase())
  return matchesSubject&&matchesSemester&&matchesEnrollment&&matchesYear&&matchesQuery
 }),[materials,courses,subjectId,semester,year,query,tab,onlyEnrolled,enrolled.join('|')])
 const notes=filteredResources.filter(item=>['PDF Notes','Chapter Notes'].includes(item.type))
 const questions=filteredResources.filter(item=>item.type==='Important Questions')
 const papers=filteredResources.filter(item=>['Question Paper','Practice Set'].includes(item.type))
 const visible=tab==='notes'?notes:tab==='questions'?questions:papers
 const changeSubject=event=>{const value=event.target.value;setSearchParams(value==='All subjects'?{}:{subject:value})}
 return <div className="quantum-page">
  <div className="page-heading-row"><div><div className="section-kicker">LEARNING SPACE | SUBJECT PAGES</div><h1>Quantum study pages</h1><p>Browse notes, important questions, and practice papers across every subject.</p></div><div className="heading-actions"><AdminQuickUpload defaultCourse={selectedCourse?.name||''} defaultType={tab==='papers'?'Question Paper':tab==='questions'?'Important Questions':'PDF Notes'} label={tab==='papers'?'Upload paper':'Upload resource'}/>{selectedCourse&&<Link to={`/courses/${selectedCourse.id}`} className="button-secondary"><BookOpen size={15}/> Open course</Link>}</div></div>
  <section className="quantum-hero"><div className="quantum-hero-icon"><Atom size={28}/></div><div className="quantum-hero-copy"><span>ONE STUDY SPACE, EVERY SUBJECT</span><h2>{selectedCourse?selectedCourse.name:'All subjects'}</h2><p>Filter by semester, subject, or year to find the resource you need.</p><div className="quantum-links"><Link to="/materials">All study materials <ArrowUpRight size={15}/></Link><Link to="/papers">Previous year papers <ArrowUpRight size={15}/></Link></div></div><div className="quantum-orbit orbit-a"/><div className="quantum-orbit orbit-b"/><span className="quantum-symbol">ψ</span></section>
  <section className="quantum-content"><div className="section-title-row"><div><div className="section-kicker">LEARN AT YOUR PACE</div><h2>Resources across subjects</h2></div><span className="count-badge">{visible.length} results</span></div>
   <div className="resource-tabs" role="tablist" aria-label="Quantum page resources"><button role="tab" aria-selected={tab==='notes'} className={tab==='notes'?'selected':''} onClick={()=>setTab('notes')}><FileText size={16}/> Study notes <span>{notes.length}</span></button><button role="tab" aria-selected={tab==='questions'} className={tab==='questions'?'selected':''} onClick={()=>setTab('questions')}><Sparkles size={16}/> Important questions <span>{questions.length}</span></button><button role="tab" aria-selected={tab==='papers'} className={tab==='papers'?'selected':''} onClick={()=>setTab('papers')}><BookOpen size={16}/> Practice papers <span>{papers.length}</span></button></div>
   <div className="paper-filter-panel quantum-filter-panel"><div><div className="section-kicker">{tab==='papers'?'FIND YOUR PAPER':'FILTER STUDY RESOURCES'}</div><div className="paper-selects"><select aria-label="Filter by semester" value={semester} onChange={event=>setSemester(event.target.value)}><option>All semesters</option>{semesterNames.map(name=><option key={name}>{name}</option>)}</select><select aria-label="Filter by subject" value={selectedCourse?.id||'All subjects'} onChange={changeSubject}><option value="All subjects">All subjects</option>{courses.map(course=><option key={course.id} value={course.id}>{course.name}</option>)}</select>{tab==='papers'&&<select aria-label="Filter papers by year" value={year} onChange={event=>setYear(event.target.value)}><option>All years</option>{paperYears.slice().reverse().map(paperYear=><option key={paperYear}>{paperYear}</option>)}</select>}<label className="filter-search"><Search size={16}/><input aria-label="Search Quantum resources" placeholder={tab==='papers'?'Search papers...':'Search resources...'} value={query} onChange={event=>setQuery(event.target.value)}/></label><button type="button" className={`filter-toggle ${onlyEnrolled?'filter-on':''}`} aria-pressed={onlyEnrolled} onClick={()=>setOnlyEnrolled(value=>!value)}><SlidersHorizontal size={15}/> Enrolled</button></div></div></div>
   <div className="material-list material-list-full">{visible.length?visible.map(item=><MaterialRow key={item.id} item={item} onView={setPreview}/>):<div className="empty-state"><FileText size={24}/><h3>No matching {tab==='notes'?'notes':tab==='questions'?'important questions':'papers'}</h3><p>Try changing the semester, subject, year, enrollment filter, or search term.</p><button className="text-link" onClick={()=>{setSemester('All semesters');setYear('All years');setQuery('');setOnlyEnrolled(false);if(subjectId!=='All subjects')setSearchParams({})}}>Clear filters</button></div>}</div>
   <div className="resource-tip"><Sparkles size={16}/><span>{selectedCourse?<>Showing resources for <b>{selectedCourse.name}</b>. Choose another subject above to switch.</>:'Showing resources across all subjects. Choose a subject above to narrow the list.'}</span></div>
   <div className="quantum-next"><div><b>{selectedCourse?'Need the full course outline?':'Want to explore a course?'}</b><span>{selectedCourse?'Open the selected subject to see its course details and enrollment.':'Choose a subject filter or browse the course catalog.'}</span></div><Link className="button-primary" to={selectedCourse?`/courses/${selectedCourse.id}`:'/courses'}>{selectedCourse?'View course':'Browse courses'} <ArrowUpRight size={15}/></Link></div>
  </section>
  <PreviewModal item={preview} onClose={()=>setPreview(null)}/>
 </div>
}
