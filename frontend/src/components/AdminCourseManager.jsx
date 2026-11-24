import { useState } from 'react'
import { Check, GraduationCap, Plus, Search, Trash2 } from './Icons'
import { useContent } from '../context/ContentContext'

const branches=['CSE','AI&DS','AI']
const empty={name:'',code:'',semester:'1',category:'Computer Science',description:'',branches:['CSE']}

export default function AdminCourseManager({onNotice}){
 const {courses,addCourse,deleteCourse,restoreSeedCourses}=useContent()
 const [form,setForm]=useState(empty),[error,setError]=useState(''),[query,setQuery]=useState('')
 const filteredCourses=courses.filter(course=>`${course.name} ${course.code} ${course.semester} ${course.branches?.join(' ')||''}`.toLowerCase().includes(query.toLowerCase()))
 const change=(key,value)=>setForm(current=>({...current,[key]:value}))
 const toggleBranch=name=>setForm(current=>({...current,branches:current.branches.includes(name)?current.branches.filter(item=>item!==name):[...current.branches,name]}))
 const submit=async event=>{
  event.preventDefault();setError('')
  if(form.name.trim().length<2||form.code.trim().length<2)return setError('Enter a subject name and code.')
  if(!form.branches.length)return setError('Choose at least one branch.')
  if(courses.some(item=>item.code.toLowerCase()===form.code.trim().toLowerCase()))return setError('That subject code is already in use.')
  try{await addCourse({...form,name:form.name.trim(),code:form.code.trim().toUpperCase(),semester:Number(form.semester),branches:form.branches,progress:0,lessons:0,units:0,teacher:'LearnHub Faculty',updated:'Just added',color:'blue',icon:'+'});setForm(empty);onNotice('Course added to the shared catalog')}
  catch(error){setError(error.message||'Course could not be saved.')}
 }
 const remove=async course=>{
  if(!window.confirm(`Remove ${course.name} from the course catalog?`))return
  try{await deleteCourse(course.id);onNotice('Course removed from the catalog')}
  catch(error){setError(error.message||'Course could not be removed.')}
 }
 const restore=async()=>{try{await restoreSeedCourses();onNotice('Sample course catalog restored')}catch(error){setError(error.message||'Could not reload the catalog.')}}

 return <div className="admin-course-manager">
  <section className="aside-card admin-form-card"><div className="section-kicker">COURSE CATALOG</div><h3>Add a course for students</h3><p>New courses appear in the selected branch and semester, and can receive files in the Files tab.</p>
   <form onSubmit={submit}>
    <label className="admin-label">SUBJECT NAME<input required value={form.name} onChange={event=>change('name',event.target.value)} placeholder="e.g. Artificial Intelligence"/></label>
    <label className="admin-label">SUBJECT CODE<input required value={form.code} onChange={event=>change('code',event.target.value)} placeholder="e.g. BAI401"/></label>
    <div className="admin-course-fields"><label className="admin-label">SEMESTER<select value={form.semester} onChange={event=>change('semester',event.target.value)}>{Array.from({length:8},(_,index)=><option key={index+1}>{index+1}</option>)}</select></label><label className="admin-label">CATEGORY<select value={form.category} onChange={event=>change('category',event.target.value)}>{['Computer Science','Mathematics','Applied Science','Electronics','Electrical','Academic Skills','Personal Development','Other'].map(item=><option key={item}>{item}</option>)}</select></label></div>
    <label className="admin-label">DESCRIPTION<textarea rows="3" value={form.description} onChange={event=>change('description',event.target.value)} placeholder="Briefly describe this subject"/></label>
    <div className="admin-label">AVAILABLE BRANCHES</div><div className="admin-branch-options">{branches.map(name=><label key={name}><input type="checkbox" checked={form.branches.includes(name)} onChange={()=>toggleBranch(name)}/>{name}</label>)}</div>
    {error&&<div className="auth-error">{error}</div>}<button className="button-primary"><Plus size={15}/> Add course</button>
   </form>
  </section>
  <section className="aside-card admin-items"><div className="section-title-row"><div><div className="section-kicker">STUDENT COURSE PAGES</div><h3>Courses in the catalog</h3></div><span className="count-badge">{courses.length}</span></div>
   <label className="filter-search admin-search"><Search size={15}/><input aria-label="Filter course catalog" placeholder="Search courses, codes, branches..." value={query} onChange={event=>setQuery(event.target.value)}/></label>
   <div className="admin-course-list">{filteredCourses.map(course=><div className="admin-course-row" key={course.id}><span className={`mini-course-icon ${course.color}`}>{course.icon||<GraduationCap size={15}/>}</span><span><b>{course.name}</b><small>{course.code} | Semester {course.semester} | {course.branches?.join(', ')||'Core branch course'}</small></span><button className="icon-button" title={`Remove ${course.name}`} aria-label={`Remove ${course.name}`} onClick={()=>remove(course)}><Trash2 size={15}/></button></div>)}{!filteredCourses.length&&<div className="admin-empty">No courses match that search.</div>}</div>
   {error&&<div className="auth-error">{error}</div>}<button className="admin-restore" onClick={restore}><span>↻</span> Restore sample courses</button>
  </section>
 </div>
}
