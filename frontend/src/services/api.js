const DEFAULT_API_URL=import.meta.env.DEV?'http://127.0.0.1:8001':'https://learnhub-lb6y.onrender.com'
export const API_BASE_URL=(import.meta.env.VITE_API_URL||DEFAULT_API_URL).replace(/\/$/,'')
export const ACCESS_TOKEN_KEY='learnhub-access-token'

export async function apiRequest(path,options={}){
 const headers=new Headers(options.headers||{})
 const token=localStorage.getItem(ACCESS_TOKEN_KEY)
 if(token)headers.set('Authorization',`Bearer ${token}`)
 let response
 try{
  response=await fetch(API_BASE_URL+path,{...options,headers})
 }catch(error){
  if(error instanceof TypeError){
   throw new Error('Cannot reach the LearnHub API at '+API_BASE_URL+'. Check that the backend is deployed and VITE_API_URL points to its Render URL.')
  }
  throw error
 }
 if(!response.ok){
  let detail=`Request failed (${response.status})`
  try{const body=await response.json();detail=body.detail||detail}catch{}
  const error=new Error(detail);error.status=response.status;throw error
 }
 return response.status===204?null:response.json()
}
