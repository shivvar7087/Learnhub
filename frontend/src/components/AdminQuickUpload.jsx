import { useState } from 'react'
import { Check, FileText, Upload, X } from './Icons'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'

const resourceTypes=['PDF Notes','Chapter Notes','Important Questions','Question Paper','Practice Set','Quick Revision']

export default function AdminQuickUpload({defaultCourse='',defaultType='PDF Notes',defaultYear='',label}){
 const {user}=useAuth()
 const {courses,addMaterial}=useContent()
 const [open,setOpen]=useState(false),[file,setFile]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
 const defaults=()=>({course:defaultCourse||courses[0]?.name||'',type:defaultType,paperYear:defaultYear,title:defaultCourse?`${defaultCourse}${defaultYear?` ${defaultYear}`:''} - ${defaultType}`:''})
 const [form,setForm]=useState(defaults)
 if(!user?.isAdmin)return null
 const update=(key,value)=>setForm(current=>({...current,[key]:value}))
 const selectCourse=value=>setForm(current=>({...current,course:value,title:current.title?`${value} - ${current.type}`:''}))
 const selectType=value=>setForm(current=>({...current,type:value,title:current.title?`${current.course} - ${value}`:'',paperYear:value==='Question Paper'?current.paperYear:''}))
 const chooseFile=event=>{
  const picked=event.target.files?.[0]||null
  setError('')
  if(picked&&(picked.type!=='application/pdf'&&!picked.name.toLowerCase().endsWith('.pdf'))){setFile(null);setError('Choose a PDF file.');return}
  if(picked&&picked.size>20*1024*1024){setFile(null);setError('The PDF must be 20 MB or smaller.');return}
  setFile(picked)
 }
 const startUpload=()=>{setForm(defaults());setFile(null);setError('');setOpen(true)}
 const submit=async event=>{
  event.preventDefault();setError('')
  if(!file)return setError('Choose a PDF file to upload.')
  if(!form.title.trim())return setError('Add a title for this file.')
  const course=courses.find(item=>item.name===form.course)
  setBusy(true)
  try{
   await addMaterial({title:form.title.trim(),course:form.course,code:course?.code||'AKTU',type:form.type,paperYear:form.type==='Question Paper'?(form.paperYear||form.title.match(/20\d{2}/)?.[0]||''):''},file)
   setOpen(false);setNotice('File uploaded and shared across LearnHub');setTimeout(()=>setNotice(''),3000)
  }catch(error){setError(error.message||'The file could not be uploaded.')}
  finally{setBusy(false)}
 }
 return <>
  <button type="button" className="button-primary quick-upload-trigger" onClick={startUpload}><Upload size={15}/>{label||'Upload file'}</button>
  {notice&&<div className="quick-upload-toast"><Check size={15}/>{notice}</div>}
  {open&&<div className="modal-backdrop quick-upload-backdrop" onMouseDown={event=>event.target===event.currentTarget&&!busy&&setOpen(false)}><section className="quick-upload-modal" role="dialog" aria-modal="true" aria-labelledby="quick-upload-title"><header><div className="preview-heading"><div className="material-icon"><FileText size={18}/></div><div><b id="quick-upload-title">Upload a shared file</b><span>The PDF will appear in matching student sections.</span></div></div><button type="button" className="icon-button" aria-label="Close upload dialog" onClick={()=>setOpen(false)} disabled={busy}><X size={19}/></button></header><form onSubmit={submit}><label className="admin-label">TITLE<input required value={form.title} onChange={event=>update('title',event.target.value)} placeholder="e.g. Chapter 2 revision notes"/></label><label className="admin-label">SUBJECT<select required value={form.course} onChange={event=>selectCourse(event.target.value)}>{courses.map(course=><option key={course.id} value={course.name}>{course.name} · {course.code}</option>)}</select></label><label className="admin-label">RESOURCE TYPE<select value={form.type} onChange={event=>selectType(event.target.value)}>{resourceTypes.map(type=><option key={type}>{type}</option>)}</select></label>{form.type==='Question Paper'&&<label className="admin-label">PAPER YEAR<select value={form.paperYear} onChange={event=>update('paperYear',event.target.value)}><option value="">Detect from title</option>{['2026','2025','2024','2023'].map(year=><option key={year}>{year}</option>)}</select></label>}<label className="admin-upload quick-upload-file"><Upload size={17}/><span>{file?file.name:'Choose a PDF file'}<small>PDF format · Maximum 20 MB</small></span><input type="file" accept="application/pdf,.pdf" onChange={chooseFile}/></label>{error&&<div className="auth-error">{error}</div>}<footer><button type="button" className="button-secondary" disabled={busy} onClick={()=>setOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={busy}>{busy?'Uploading…':<><Upload size={15}/> Upload and share</>}</button></footer></form></section></div>}
 </>
}
