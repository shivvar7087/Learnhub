const LEGACY_KEYS=['learnhub-enrolled','learnhub-profile','learnhub-learning-days']
const ACCOUNT_KEYS=[...LEGACY_KEYS,'learnhub-course-progress','learnhub-studied-resources']

export function userStorageKey(key,user){
 const email=user?.email?.trim().toLowerCase()
 return email?`${key}:${encodeURIComponent(email)}`:null
}

export function readUserData(key,user,fallback){
 const scoped=userStorageKey(key,user)
 if(!scoped)return fallback
 try{
  const value=localStorage.getItem(scoped)
  return value===null?fallback:JSON.parse(value)
 }catch{return fallback}
}

export function writeUserData(key,user,value){
 const scoped=userStorageKey(key,user)
 if(!scoped)return
 localStorage.setItem(scoped,JSON.stringify(value))
}

export function getCourseProgress(user,courseCode){
 const progress=readUserData('learnhub-course-progress',user,{})
 return Number(progress?.[courseCode])||0
}

export function recordCourseResourceProgress(user,courseCode,resourceId,totalResources){
 if(!courseCode||!resourceId)return getCourseProgress(user,courseCode)
 const studied=readUserData('learnhub-studied-resources',user,{})
 const courseItems=Array.isArray(studied[courseCode])?studied[courseCode]:[]
 if(!courseItems.includes(resourceId))courseItems.push(resourceId)
 studied[courseCode]=courseItems
 writeUserData('learnhub-studied-resources',user,studied)
 const progress=Math.min(100,Math.round(courseItems.length/Math.max(totalResources,1)*100))
 const progressByCourse=readUserData('learnhub-course-progress',user,{})
 progressByCourse[courseCode]=progress
 writeUserData('learnhub-course-progress',user,progressByCourse)
 return progress
}

export function moveUserData(oldUser,newUser){
 const oldEmail=oldUser?.email?.trim().toLowerCase(),newEmail=newUser?.email?.trim().toLowerCase()
 if(!oldEmail||!newEmail||oldEmail===newEmail)return
 for(const key of ACCOUNT_KEYS){
  const oldKey=userStorageKey(key,{email:oldEmail}),newKey=userStorageKey(key,{email:newEmail})
  const value=localStorage.getItem(oldKey)
  if(value===null)continue
  if(localStorage.getItem(newKey)===null)localStorage.setItem(newKey,value)
  localStorage.removeItem(oldKey)
 }
}

export function migrateLegacyUserData(user){
 if(!user?.email||user.isAdmin)return
 for(const key of LEGACY_KEYS){
  const scoped=userStorageKey(key,user)
  const legacy=localStorage.getItem(key)
  if(!scoped)continue
  if(localStorage.getItem(scoped)===null&&legacy!==null)localStorage.setItem(scoped,legacy)
  if(legacy!==null)localStorage.removeItem(key)
 }
}
