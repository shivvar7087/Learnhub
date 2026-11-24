import { getUploadedFile } from './fileStore'
import { recordLearningActivity } from '../utils/learningActivity'
import { recordCourseResourceProgress } from '../utils/userData'
import { API_BASE_URL } from './api'

const esc = value => String(value).replace(/[^\x20-\x7E]/g, '?').replace(/[()\\]/g, c => `\\${c}`)

export function makePdf(title, lines=[]){
 const content=['BT','/F1 18 Tf','54 740 Td',`(${esc(title)}) Tj`,'/F1 11 Tf','0 -28 Td',...lines.flatMap(line=>[`(${esc(line)}) Tj`,'0 -18 Td']),'ET'].join('\n')
 const objects=[`<< /Type /Catalog /Pages 2 0 R >>`,`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,`<< /Length ${content.length} >>\nstream\n${content}\nendstream`]
 let pdf='%PDF-1.4\n',offsets=[0]
 objects.forEach((object,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${object}\nendobj\n`})
 const xref=pdf.length
 pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(value=>`${String(value).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
 return new Blob([pdf],{type:'application/pdf'})
}

export async function downloadMaterial(material,user,totalResources=1){
 let content=await getMaterialFile(material).catch(()=>null)
 if(!content)content=makePdf(material.title,[`${material.course} | ${material.code}`,`${material.type} | ${material.pages} pages`,'LearnHub study resource','','This sample document is ready for backend PDF integration.','Use the course page for related study materials.'])
 const url=URL.createObjectURL(content),anchor=document.createElement('a')
 anchor.href=url
 anchor.download=`${material.code}-${material.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.pdf`
 anchor.click()
 recordLearningActivity(new Date(),user)
 recordCourseResourceProgress(user,material.code,material.id,totalResources)
 setTimeout(()=>URL.revokeObjectURL(url),1000)
}

export async function getMaterialFile(material){
 if(material?.apiBacked&&material.uploaded){
  const response=await fetch(`${API_BASE_URL}/api/resources/${encodeURIComponent(material.id)}/file`)
  if(!response.ok)throw new Error('Could not load the PDF file.')
  return response.blob()
 }
 return material?.storageKey?getUploadedFile(material.storageKey):null
}
