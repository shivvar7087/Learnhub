import { useEffect, useState } from 'react'
import { X, Download, FileText } from './Icons'
import { downloadMaterial, getMaterialFile } from '../services/documents'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'

export default function PreviewModal({item,onClose}){
 const {user}=useAuth(),{materials}=useContent()
 const [fileUrl,setFileUrl]=useState('')
 useEffect(()=>{
  let active=true,url=''
  if(item?.uploaded&&(item?.storageKey||item?.apiBacked))getMaterialFile(item).then(file=>{if(file&&active){url=URL.createObjectURL(file);setFileUrl(url)}}).catch(()=>{})
  return()=>{active=false;if(url)URL.revokeObjectURL(url);setFileUrl('')}
 },[item])
 if(!item)return null
 return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="preview-modal"><header><div className="preview-heading"><div className="material-icon"><FileText size={19}/></div><div><b>{item.title}</b><span>{item.course} | {item.pages} pages</span></div></div><button className="icon-button" onClick={onClose} aria-label="Close preview"><X size={20}/></button></header>{fileUrl?<iframe className="uploaded-pdf-preview" src={fileUrl} title={`Preview: ${item.title}`}/>:<div className="preview-page"><span className="preview-brand">learn<span>hub</span></span><div className="preview-file-icon"><FileText size={36}/></div><h2>{item.title}</h2><p>{item.course} | {item.code}</p><div className="preview-rule"/><p className="preview-copy">Your sample study resource is ready. Download the PDF to keep it handy for your next study session.</p><span className="preview-pages">{item.type} | {item.pages} pages | {item.size}</span></div>}<footer><button className="button-secondary" onClick={onClose}>Close preview</button><button className="button-primary" onClick={()=>downloadMaterial(item,user,materials.filter(resource=>resource.code===item.code).length)}><Download size={16}/> Download PDF</button></footer></section></div>
}
