const DB_NAME='learnhub-uploaded-files'
const STORE='pdfs'

function openDatabase(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,1)
  request.onupgradeneeded=()=>request.result.createObjectStore(STORE)
  request.onsuccess=()=>resolve(request.result)
  request.onerror=()=>reject(request.error)
 })
}

export async function saveUploadedFile(id,file){
 const db=await openDatabase()
 return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(file,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})
}
export async function getUploadedFile(id){
 const db=await openDatabase()
 return new Promise((resolve,reject)=>{const request=db.transaction(STORE,'readonly').objectStore(STORE).get(id);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error)})
}
export async function removeUploadedFile(id){
 const db=await openDatabase()
 return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})
}
