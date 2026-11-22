import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Search, SlidersHorizontal } from '../components/Icons'
import CourseCard from '../components/CourseCard'
import AdminQuickUpload from '../components/AdminQuickUpload'
import { branchSubjects, semesterNames } from '../data/catalog'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import { readUserData, getCourseProgress } from '../utils/userData'

const branches = Object.keys(branchSubjects)
const branchOptions=['All branches',...branches]

export default function Courses(){
 const {courses}=useContent()
 const {user}=useAuth()
 const [params]=useSearchParams()
 const [branch,setBranch]=useState('CSE')
 const [semester,setSemester]=useState('All courses')
 const [search,setSearch]=useState(()=>params.get('search')||'')
 const [sort,setSort]=useState('Semester order')
 const [onlyEnrolled,setOnlyEnrolled]=useState(()=>params.get('enrolled')==='true')
 useEffect(()=>{const next=params.get('search')||'';setSearch(next);if(next)setBranch('All branches')},[params])
 const savedEnrollment=readUserData('learnhub-enrolled',user,[])
 const enrolled=Array.isArray(savedEnrollment)?savedEnrollment:[]
 const branchCourses=courses.filter(c=>branch==='All branches'||(c.branches?c.branches.includes(branch):branchSubjects[branch]?.includes(c.id)))
 const filtered=useMemo(()=>branchCourses
  .filter(c=>semester==='All courses'||semester===`Semester ${c.semester}`)
  .filter(c=>!onlyEnrolled||enrolled.includes(c.id))
  .filter(c=>!search||`${c.name} ${c.code} ${c.category}`.toLowerCase().includes(search.toLowerCase()))
  .sort((a,b)=>sort==='A-Z'?a.name.localeCompare(b.name):a.semester-b.semester),[branchCourses,branch,semester,onlyEnrolled,search,sort])

 return <div className="catalog-page">
  <div className="page-heading-row"><div><div className="section-kicker">YOUR DEGREE, ORGANIZED</div><h1>Explore courses</h1><p>Choose your B.Tech branch, then browse subjects by semester.</p></div><div className="heading-actions"><AdminQuickUpload defaultType="PDF Notes"/><div className="heading-stat"><BookOpen size={17}/><span><b>{branchCourses.length}</b> subjects</span></div></div></div>
  <section className="branch-picker" aria-label="Choose your branch"><div><div className="section-kicker">YOUR BRANCH</div><span>Select a program to see its subjects</span></div><div className="branch-tabs">{branchOptions.map(name=><button key={name} className={branch===name?'selected':''} aria-pressed={branch===name} onClick={()=>{setBranch(name);setSemester('All courses')}}>{name==='All branches'?'All':name}</button>)}</div></section>
  <div className="filter-bar"><div className="semester-tabs"><button className={semester==='All courses'?'selected':''} onClick={()=>setSemester('All courses')}>All courses</button>{semesterNames.map((s,i)=><button key={s} className={semester===s?'selected':''} onClick={()=>setSemester(s)} aria-label={s}>{i+1}</button>)}</div><div className="filter-controls"><label className="filter-search"><Search size={16}/><input placeholder="Find a subject..." value={search} onChange={e=>setSearch(e.target.value)}/></label><select className="sort-select" value={sort} onChange={e=>setSort(e.target.value)}><option>Semester order</option><option value="A-Z">A-Z</option></select><button className={`filter-toggle ${onlyEnrolled?'filter-on':''}`} onClick={()=>setOnlyEnrolled(v=>!v)}><SlidersHorizontal size={16}/> Enrolled</button></div></div>
  <div className="catalog-result">{branch} <span>·</span> {semester==='All courses'?'All semesters':semester} <span>·</span> {filtered.length} subjects</div>
  {filtered.length?<div className="course-grid catalog-grid">{filtered.map(c=><CourseCard key={c.id} course={{...c,progress:getCourseProgress(user,c.code)}}/>)}</div>:<div className="empty-state"><Search size={26}/><h3>No subjects found</h3><p>Try another subject name or semester.</p><button className="text-link" onClick={()=>{setSearch('');setSemester('All courses');setOnlyEnrolled(false)}}>Clear filters</button></div>}
 </div>
}
