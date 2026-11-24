import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpRight } from './Icons'

export default function HomeSearch(){
 const [query,setQuery]=useState('')
 const navigate=useNavigate()
 const submit=event=>{event.preventDefault();if(query.trim())navigate(`/courses?search=${encodeURIComponent(query.trim())}`)}
 return <form className="home-course-search" role="search" onSubmit={submit}><Search size={17}/><input aria-label="Search courses" placeholder="Search courses, subjects, or codes..." value={query} onChange={event=>setQuery(event.target.value)}/><button type="submit" className="button-primary">Find a course <ArrowUpRight size={14}/></button></form>
}
