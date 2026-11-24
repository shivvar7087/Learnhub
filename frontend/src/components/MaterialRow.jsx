import { useState } from 'react'
import { FileText, Download, Eye, Trash2 } from './Icons'
import { downloadMaterial } from '../services/documents'
import { recordLearningActivity } from '../utils/learningActivity'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { recordCourseResourceProgress } from '../utils/userData'

export default function MaterialRow({item,onView}){
 const {user}=useAuth(),{deleteMaterial,materials}=useContent()
 const [error,setError]=useState('')
 const remove=async()=>{
  if(!user?.isAdmin||!window.confirm(`Delete "${item.title}" from all LearnHub sections?`))return
  try{await deleteMaterial(item.id);setError('')}
  catch{setError('Could not delete this file.')}
 }
 return <div className="material-row"><div className="material-icon"><FileText size={19}/></div><div className="material-main"><b>{item.title}</b><span>{item.course} <i>·</i> {item.code}</span></div><span className={`type-pill ${item.type==='Question Paper'?'type-paper':''}`}>{item.type}</span><span className="material-date">{item.date}</span><span className="material-size">{item.size}</span><div className="material-actions"><button type="button" className="icon-button" title="Preview" aria-label={`Preview ${item.title}`} onClick={()=>{recordLearningActivity(new Date(),user);recordCourseResourceProgress(user,item.code,item.id,materials.filter(resource=>resource.code===item.code).length);onView(item)}}><Eye size={17}/></button><button type="button" className="icon-button" title="Download PDF" aria-label={`Download ${item.title}`} onClick={()=>downloadMaterial(item,user,materials.filter(resource=>resource.code===item.code).length)}><Download size={17}/></button>{user?.isAdmin&&<button type="button" className="icon-button material-delete" title="Delete file from all sections" aria-label={`Delete ${item.title}`} onClick={remove}><Trash2 size={16}/></button>}</div>{error&&<span className="material-delete-error" role="status">{error}</span>}</div>
}
