export const API_BASE_URL=(import.meta.env.VITE_API_URL||'http://127.0.0.1:8001').replace(/\/$/,'')
export const ACCESS_TOKEN_KEY='learnhub-access-token'

export async function apiRequest(path,options={}){
 const headers=new Headers(options.headers||{})
 const token=localStorage.getItem(ACCESS_TOKEN_KEY)
 if(token)headers.set('Authorization',`Bearer ${token}`)
 const response=await fetch(`${API_BASE_URL}${path}`,{...options,headers})
 if(!response.ok){
  let detail=`Request failed (${response.status})`
  try{const body=await response.json();detail=body.detail||detail}catch{}
  const error=new Error(detail);error.status=response.status;throw error
 }
 return response.status===204?null:response.json()
}
