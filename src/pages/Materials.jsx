import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Atom, Download, FileText, Search, SlidersHorizontal } from '../components/Icons'
import { semesterNames } from '../data/catalog'
import { useContent } from '../context/ContentContext'
import MaterialRow from '../components/MaterialRow'
import PreviewModal from '../components/PreviewModal'
import AdminQuickUpload from '../components/AdminQuickUpload'
import { useAuth } from '../context/AuthContext'
import { readUserData } from '../utils/userData'

const types=['All resources','Quantum Pages','PDF Notes','Chapter Notes','Important Questions','Question Paper','Practice Set','Quick Revision']
const paperYears=['2023','2024','2025','2026']

export default function Materials(){
 const {materials,courses}=useContent()
 const {user}=useAuth()
 const [params]=useSearchParams()
 const initialSearch=params.get('search')||''
 const [query,setQuery]=useState(initialSearch),[type,setType]=useState(initialSearch.toLowerCase().includes('quantum')?'Quantum Pages':'All resources'),[preview,setPreview]=useState(null)
 const [semester,setSemester]=useState('All semesters'),[subject,setSubject]=useState('All subjects'),[year,setYear]=useState('All years'),[onlyEnrolled,setOnlyEnrolled]=useState(false)
 const savedEnrollment=readUserData('learnhub-enrolled',user,[]),enrolled=Array.isArray(savedEnrollment)?savedEnrollment:[]
 useEffect(()=>{const next=params.get('search')||'';setQuery(next);setType(next.toLowerCase().includes('quantum')?'Quantum Pages':'All resources')},[params])
 const filtered=useMemo(()=>materials.filter(item=>{
  const course=courses.find(entry=>entry.name===item.course||entry.code===item.code)
  const itemYear=item.paperYear||item.title.match(/20\d{2}/)?.[0]||''
  return (type==='All resources'||(type==='Quantum Pages'?item.title.toLowerCase().includes('quantum'):item.type===type))
   &&(subject==='All subjects'||item.course===subject)
   &&(semester==='All semesters'||course?.semester===Number(semester.slice(-1)))
   &&(!onlyEnrolled||enrolled.includes(course?.id))
   &&(year==='All years'||(item.type==='Question Paper'&&itemYear===year))
   &&(!query||`${item.title} ${item.course} ${item.code} ${item.type}`.toLowerCase().includes(query.toLowerCase()))
 }),[materials,courses,type,subject,semester,year,query,onlyEnrolled,enrolled.join('|')])
 const changeType=value=>{setType(value);if(value!=='Question Paper')setYear('All years')}
 const changeYear=value=>{setYear(value);if(value!=='All years')setType('Question Paper')}
 return <div className="materials-page">
  <div className="page-heading-row"><div><div className="section-kicker">YOUR STUDY TOOLKIT</div><h1>Study materials</h1><p>Good notes make all the difference. Find yours here.</p></div><div className="heading-actions"><div className="heading-stat"><FileText size={17}/><span><b>{materials.length}</b> resources</span></div><AdminQuickUpload defaultCourse={subject==='All subjects'?'':subject} defaultType={type!=='All resources'&&type!=='Quantum Pages'?type:'PDF Notes'} label={type==='Question Paper'?'Upload paper':'Upload resource'}/></div></div>
  <div className="material-feature"><div className="feature-icon"><FileText size={22}/></div><div><b>Exam season, meet your match.</b><p>Notes, question papers and practice sets, organized for you.</p></div><a href="#library" className="button-light">Browse library <span>↓</span></a></div>
  <div className="quantum-page-shortcut"><span><Atom size={17}/> Looking for Quantum materials?</span><Link to="/quantum">Open Quantum pages <span>↗</span></Link></div>
  <div className="library-toolbar" id="library"><div className="type-tabs">{types.map(resourceType=><button key={resourceType} className={type===resourceType?'selected':''} onClick={()=>changeType(resourceType)}>{resourceType}</button>)}</div></div>
  <div className="paper-filter-panel quantum-filter-panel materials-filter-panel"><div><div className="section-kicker">FIND STUDY MATERIALS</div><div className="paper-selects"><select aria-label="Filter materials by semester" value={semester} onChange={event=>setSemester(event.target.value)}><option>All semesters</option>{semesterNames.map(name=><option key={name}>{name}</option>)}</select><select aria-label="Filter materials by subject" value={subject} onChange={event=>setSubject(event.target.value)}><option>All subjects</option>{courses.map(course=><option key={course.id}>{course.name}</option>)}</select><select aria-label="Filter materials by year" value={year} onChange={event=>changeYear(event.target.value)}><option>All years</option>{paperYears.slice().reverse().map(paperYear=><option key={paperYear}>{paperYear}</option>)}</select><label className="filter-search"><Search size={16}/><input aria-label="Search study materials" placeholder={type==='Question Paper'?'Search papers...':'Search materials...'} value={query} onChange={event=>setQuery(event.target.value)}/></label><button type="button" className={`filter-toggle ${onlyEnrolled?'filter-on':''}`} aria-pressed={onlyEnrolled} onClick={()=>setOnlyEnrolled(value=>!value)}><SlidersHorizontal size={15}/> Enrolled</button></div></div></div>
  <div className="material-list material-list-full"><div className="material-list-head"><span>RESOURCE</span><span>TYPE</span><span>ADDED</span><span>SIZE</span><span/></div>{filtered.length?filtered.map(item=><MaterialRow key={item.id} item={item} onView={setPreview}/>):<div className="empty-state"><Search size={24}/><h3>No resources found</h3><p>Change your search or filters and try again.</p><button className="text-link" onClick={()=>{setType('All resources');setSemester('All semesters');setSubject('All subjects');setYear('All years');setQuery('');setOnlyEnrolled(false)}}>Clear filters</button></div>}</div>
  <div className="materials-foot"><span>Showing <b>{filtered.length}</b> of {materials.length} resources</span><span><Download size={14}/> Select a resource to preview or download</span></div><PreviewModal item={preview} onClose={()=>setPreview(null)}/>
 </div>
}
