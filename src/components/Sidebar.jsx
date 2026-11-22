import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Library, FileText, UserRound, GraduationCap, X, CircleHelp, Sun, Moon, Atom } from './Icons'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

 const links=[{label:'Overview',to:'/dashboard',icon:LayoutDashboard},{label:'My courses',to:'/courses',icon:BookOpen},{label:'Quantum',to:'/quantum',icon:Atom},{label:'Study materials',to:'/materials',icon:Library},{label:'Previous papers',to:'/papers',icon:FileText}]
export default function Sidebar({open,onClose}) {
 const {user,logout}=useAuth(), {dark,toggleTheme}=useTheme(), navigate=useNavigate(), loc=useLocation()
 return <>
  {open&&<button className="sidebar-scrim" aria-label="Close menu" onClick={onClose}/>}
  <aside className={`sidebar ${open?'sidebar-open':''}`}>
   <div className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>learn<span className="brand-accent">hub</span></span><button className="icon-button sidebar-close" onClick={onClose} aria-label="Close menu"><X size={20}/></button></div>
   <div className="workspace-pill"><span className="workspace-dot"/> AKTU · B.Tech <span className="pill-caret">⌄</span></div>
   <div className="nav-heading">LEARNING SPACE</div>
   <nav className="side-nav">{links.map(({label,to,icon:Icon})=><NavLink key={to} to={to} onClick={onClose} className={({isActive})=>`side-link ${isActive?'active':''}`}><Icon size={18}/><span>{label}</span>{to==='/courses'&&<span className="nav-count">4</span>}</NavLink>)}</nav>
   <div className="nav-heading nav-heading-lower">PERSONAL</div>
   <nav className="side-nav"><NavLink to="/profile" onClick={onClose} className={({isActive})=>`side-link ${isActive?'active':''}`}><UserRound size={18}/><span>My profile</span></NavLink>{user?.isAdmin&&<NavLink to="/admin" onClick={onClose} className={({isActive})=>`side-link ${isActive?'active':''}`}><GraduationCap size={18}/><span>Admin studio</span></NavLink>}<button className="side-link" onClick={toggleTheme}>{dark?<Sun size={18}/>:<Moon size={18}/>}<span>{dark?'Light appearance':'Dark appearance'}</span><span className="theme-indicator"/></button></nav>
   <div className="sidebar-spacer"/>
   <div className="sidebar-help"><CircleHelp size={19}/><div><b>Need a hand?</b><span>We're here to help</span></div><span className="help-arrow">↗</span></div>
   <button className="profile-mini" onClick={()=>navigate('/profile')}><span className="avatar avatar-blue">{user?.name?.[0]||'S'}</span><span className="profile-mini-info"><b>{user?.name||'Student account'}</b><small>{user?.email||'Sign in to sync progress'}</small></span><span className="profile-dots" onClick={e=>{e.stopPropagation();logout();navigate('/')}}>···</span></button>
  </aside>
 </>
}
