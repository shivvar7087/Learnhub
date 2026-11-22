export const API_BASE_URL=(import.meta.env.VITE_API_URL||'http://127.0.0.1:8000').replace(/\/$/,'')

export async function apiRequest(path,options={}){
 const response=await fetch(`${API_BASE_URL}${path}`,options)
 if(!response.ok){
  let detail=`Request failed (${response.status})`
  try{const body=await response.json();detail=body.detail||detail}catch{}
  throw new Error(detail)
 }
 return response.status===204?null:response.json()
}
