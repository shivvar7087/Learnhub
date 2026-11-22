import { readUserData, writeUserData } from './userData'

const KEY='learnhub-learning-days'
const account=user=>user?.email?user:{email:'guest'}

function localDateKey(date){
 const year=date.getFullYear(),month=String(date.getMonth()+1).padStart(2,'0'),day=String(date.getDate()).padStart(2,'0')
 return `${year}-${month}-${day}`
}

function activityDays(user){
 const value=readUserData(KEY,account(user),[])
 return Array.isArray(value)?value:[]
}

export function recordLearningActivity(date=new Date(),user){
 const owner=account(user),days=activityDays(owner),today=localDateKey(date)
 if(!days.includes(today))days.push(today)
 writeUserData(KEY,owner,days.slice(-60))
}

export function getLearningStreak(date=new Date(),user){
 const recorded=new Set(activityDays(user)),cursor=new Date(date)
 if(!recorded.has(localDateKey(cursor)))cursor.setDate(cursor.getDate()-1)
 let streak=0
 while(recorded.has(localDateKey(cursor))){streak++;cursor.setDate(cursor.getDate()-1)}
 return streak
}

export function getWeeklyProgress(date=new Date(),user){
 const days=new Set(activityDays(user)),weekStart=new Date(date)
 weekStart.setHours(0,0,0,0)
 weekStart.setDate(weekStart.getDate()-((weekStart.getDay()+6)%7))
 let activeDays=0
 for(let offset=0;offset<7;offset++){
  const day=new Date(weekStart)
  day.setDate(weekStart.getDate()+offset)
  if(days.has(localDateKey(day)))activeDays++
 }
 return Math.round(activeDays/7*100)
}
