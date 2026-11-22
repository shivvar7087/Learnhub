import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Check, FileText, GraduationCap, Pencil, Plus, RotateCcw, Search, Trash2, Upload, UserRound, X } from '../components/Icons'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import AdminCourseManager from '../components/AdminCourseManager'

const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
const emptyForm={title:'',course:'',type:'PDF Notes',paperYear:''}

export default function Admin(){
 const {materials,addMaterial,updateMaterial,deleteMaterial,restoreSeedMaterials,courses,addCourse,deleteCourse,restoreSeedCourses,apiConnected}=useContent()
 const {students}=useAuth()
 const [params]=useSearchParams()
 const initialCourse=courses.find(course=>course.name===params.get('course')||course.id===params.get('course'))?.name||courses[0]?.name||''
 const initialType=params.get('type')||'PDF Notes',initialYear=params.get('paperYear')||''
 const initialTitle=params.get('title')||`${initialCourse}${initialYear?` ${initialYear}`:''} - ${initialType}`
 const [tab,setTab]=useState(()=>params.get('tab')||'Files'),[form,setForm]=useState(()=>({...emptyForm,title:initialTitle,course:initialCourse,type:initialType,paperYear:initialYear}))
 const [file,setFile]=useState(null),[query,setQuery]=useState(''),[toast,setToast]=useState(''),[error,setError]=useState(''),[editingId,setEditingId]=useState(null)
 const [lesson,setLesson]=useState(''),[lessons,setLessons]=useState(()=>load('learnhub-admin-lessons',[])),[lessonQuery,setLessonQuery]=useState(''),[studentQuery,setStudentQuery]=useState('')
 const filteredLessons=lessons.filter(name=>name.toLowerCase().includes(lessonQuery.toLowerCase()))
 const filteredStudents=students.filter(student=>`${student.name} ${student.email}`.toLowerCase().includes(studentQuery.toLowerCase()))
 const flash=message=>{setToast(message);setTimeout(()=>setToast(''),2200)}
 const docs=useMemo(()=>materials.filter(item=>!query||`${item.title} ${item.course} ${item.code} ${item.type}`.toLowerCase().includes(query.toLowerCase())),[materials,query])
 const updateField=(key,value)=>setForm(current=>({...current,[key]:value}))
 const clearEditor=()=>{setEditingId(null);setForm({...emptyForm,course:courses[0]?.name||''});setFile(null);setError('')}
 const edit=item=>{setEditingId(item.id);setForm({title:item.title,course:item.course,type:item.type,paperYear:item.paperYear||item.title.match(/20\d{2}/)?.[0]||''});setFile(null);setError('');window.scrollTo({top:0,behavior:'smooth'})}
 const pickFile=e=>{const selected=e.target.files?.[0]||null;setError('');if(selected&&(selected.type!=='application/pdf'&&!selected.name.toLowerCase().endsWith('.pdf'))){setFile(null);setError('Choose a PDF file.');return}if(selected&&selected.size>20*1024*1024){setFile(null);setError('The PDF must be 20 MB or smaller.');return}setFile(selected)}
 const saveFile=async e=>{
  e.preventDefault();const formElement=e.currentTarget;setError('')
  if(!editingId&&!file){setError('Choose a PDF file to upload.');return}
  if(!form.title.trim()){setError('Add a title for this file.');return}
  try{
   const course=courses.find(item=>item.name===form.course)
   const values={title:form.title.trim(),course:form.course,code:course?.code||'AKTU',type:form.type,paperYear:form.type==='Question Paper'?(form.paperYear||form.title.match(/20\d{2}/)?.[0]||''):''}
   if(editingId){await updateMaterial(editingId,values,file);flash('Resource updated across LearnHub')}
   else{await addMaterial(values,file);flash('PDF uploaded to the shared library')}
   clearEditor();formElement.reset()
  }catch{setError('The PDF or resource could not be saved. Try again.')}
 }
 const addLesson=e=>{e.preventDefault();if(!lesson.trim())return;const next=[lesson.trim(),...lessons];setLessons(next);localStorage.setItem('learnhub-admin-lessons',JSON.stringify(next));setLesson('');flash('Lesson added to the course')}
 const remove=async item=>{if(!window.confirm(`Delete "${item.title}" from LearnHub? It will be removed from every student page.`))return;try{await deleteMaterial(item.id);if(editingId===item.id)clearEditor();flash('File deleted from the shared library')}catch{flash('The file could not be removed from browser storage')}}

 return <div className="admin-page">
  <div className="page-heading-row"><div><div className="section-kicker">LEARNHUB | CONTENT STUDIO</div><h1>Admin dashboard</h1><p>Edit, upload, or remove resources across the student pages.</p></div><span className="admin-demo-pill">{apiConnected?'DATABASE CONNECTED':'LOCAL PREVIEW'}</span></div>
  <div className="admin-stats"><button type="button" aria-label="Open course catalog" onClick={()=>setTab('Courses')}><BookOpen/><span><b>{courses.length.toLocaleString('en-IN')}</b><small>Courses</small></span></button><button type="button" aria-label="Open shared files" onClick={()=>setTab('Files')}><FileText/><span><b>{materials.length.toLocaleString('en-IN')}</b><small>Shared files</small></span></button><button type="button" aria-label="Open student accounts" onClick={()=>setTab('Students')}><GraduationCap/><span><b>{students.length.toLocaleString('en-IN')}</b><small>Students</small></span></button></div>
  <div className="admin-tabs">{['Files','Courses','Lessons','Students'].map(name=><button className={tab===name?'selected':''} onClick={()=>setTab(name)} key={name}>{name}</button>)}</div>
  {tab==='Courses'&&<AdminCourseManager onNotice={flash}/>}
  {tab==='Files'&&<div className="admin-columns">
   <section className="aside-card admin-form-card"><div className="section-kicker">{editingId?'EDIT RESOURCE':'UPLOAD PDF'}</div><h3>{editingId?'Update shared resource':'Add to the shared library'}</h3><p>Changes appear on the matching course, materials, question papers, and Quantum pages.</p>
    <form onSubmit={saveFile}>
     <label className="admin-label">TITLE<input required value={form.title} onChange={e=>updateField('title',e.target.value)} placeholder="e.g. Unit 2 revision notes"/></label>
     <label className="admin-label">COURSE<select value={form.course} onChange={e=>updateField('course',e.target.value)}>{courses.map(c=><option key={c.id}>{c.name}</option>)}</select></label>
     <label className="admin-label">RESOURCE TYPE<select value={form.type} onChange={e=>updateField('type',e.target.value)}>{['PDF Notes','Chapter Notes','Important Questions','Question Paper','Practice Set','Quick Revision'].map(type=><option key={type}>{type}</option>)}</select></label>
     {form.type==='Question Paper'&&<label className="admin-label">PAPER YEAR<select value={form.paperYear} onChange={e=>updateField('paperYear',e.target.value)}><option value="">Detect from title</option>{['2026','2025','2024','2023'].map(year=><option key={year}>{year}</option>)}</select></label>}
     <label className="admin-upload"><Upload size={17}/><span>{file?file.name:editingId?'Choose replacement PDF (optional)':'Choose a PDF file'}<small>PDF format | Max 20 MB</small></span><input type="file" accept="application/pdf,.pdf" onChange={pickFile}/></label>
     {error&&<div className="auth-error">{error}</div>}
     <div className="admin-form-actions"><button className="button-primary" type="submit">{editingId?<Check size={15}/>:<Upload size={15}/>} {editingId?'Save changes':'Upload file'}</button>{editingId&&<button className="button-secondary" type="button" onClick={clearEditor}><X size={15}/> Cancel</button>}</div>
    </form>
   </section>
   <section className="aside-card admin-items"><div className="section-title-row"><div><div className="section-kicker">SHARED LIBRARY</div><h3>Manage every file</h3></div><span className="count-badge">{materials.length}</span></div>
    <label className="filter-search admin-search"><Search size={15}/><input placeholder="Search files, subjects, types..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <div className="admin-file-list">{docs.map(item=><div className="admin-item" key={item.id}><span className="material-icon"><FileText size={17}/></span><span><b>{item.title}</b><small>{item.course} | {item.code} | {item.type}{item.uploaded?' | Uploaded PDF':' | Sample resource'}</small></span><button className="icon-button" aria-label={`Edit ${item.title}`} title="Edit across all pages" onClick={()=>edit(item)}><Pencil size={15}/></button><button className="icon-button" aria-label={`Delete ${item.title}`} title="Delete from all pages" onClick={()=>remove(item)}><Trash2 size={15}/></button></div>)}{!docs.length&&<div className="admin-empty">No files match that search.</div>}</div>
    <button className="admin-restore" onClick={()=>{restoreSeedMaterials();flash('Sample library restored')}}><RotateCcw size={14}/> Restore sample files</button>
   </section>
  </div>}
  {tab==='Lessons'&&<section className="aside-card admin-form-card admin-lesson-card"><div className="section-kicker">COURSE BUILDER</div><h3>Add a lesson</h3><p>Add a lesson title to the LearnHub course outline.</p><form onSubmit={addLesson}><label className="admin-label">LESSON TITLE<input required value={lesson} onChange={e=>setLesson(e.target.value)} placeholder="e.g. Introduction to Fourier Series"/></label><label className="admin-label">COURSE<select>{courses.map(c=><option key={c.id}>{c.name}</option>)}</select></label><button className="button-primary"><Plus size={15}/> Add lesson</button></form><div className="admin-lesson-list">{lessons.map((name,index)=><div key={`${name}-${index}`}><BookOpen size={15}/>{name}<Check size={14}/></div>)}</div></section>}
  {tab==='Students'&&<section className="aside-card admin-items"><div className="section-title-row"><div><div className="section-kicker">STUDENT ACCOUNTS</div><h3>Registered students</h3></div><span className="count-badge">{students.length}</span></div><label className="filter-search admin-search"><Search size={15}/><input aria-label="Search student accounts" placeholder="Search students by name or email..." value={studentQuery} onChange={event=>setStudentQuery(event.target.value)}/></label>{filteredStudents.length?filteredStudents.map(student=><div className="admin-student" key={student.email}><span className="avatar avatar-blue">{student.name?.[0]||'S'}</span><span><b>{student.name||'Student'}</b><small>{student.email}</small></span><span className="student-detail">Student account</span><span className="student-status">Registered</span></div>):<div className="admin-empty">{studentQuery?'No student accounts match that search.':'No student accounts registered in this browser yet.'}</div>}</section>}
  {toast&&<div className="admin-toast"><Check size={16}/>{toast}</div>}
 </div>
}
