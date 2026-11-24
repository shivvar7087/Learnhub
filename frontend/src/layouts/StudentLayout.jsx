import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Bell, ChevronRight, Menu, Moon, Search, Sun, UserRound, LogOut, BookOpen, Library, FileText, Atom, LayoutDashboard } from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useContent } from '../context/ContentContext'
import { readUserData } from '../utils/userData'

const titles = {
  '/dashboard': 'Overview', '/courses': 'My courses', '/materials': 'Study materials',
  '/papers': 'Previous year papers', '/profile': 'My profile', '/admin': 'Admin studio', '/quantum': 'Quantum',
}

export default function StudentLayout() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { dark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { courses, materials } = useContent()
  const profileDetails = readUserData('learnhub-profile', user, {})
  const profileFields = [user?.name, user?.email, profileDetails?.phone, profileDetails?.university, profileDetails?.branch, profileDetails?.semester]
  const profileCompletion = Math.round(profileFields.filter(value => String(value || '').trim()).length / profileFields.length * 100)
  const accountLinks = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My courses', path: '/courses', icon: BookOpen },
    { label: 'Study materials', path: '/materials', icon: Library },
    { label: 'Previous papers', path: '/papers', icon: FileText },
    { label: 'Quantum', path: '/quantum', icon: Atom },
    { label: 'My profile', path: '/profile', icon: UserRound },
  ]
  useEffect(() => {
    const closeOnOutside = event => {
      if (!accountMenuRef.current?.contains(event.target)) setShowAccountMenu(false)
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape') setShowAccountMenu(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])
  const title = titles[location.pathname] || 'Course details'
  const submitSearch = () => {
    const value = query.trim().toLowerCase()
    if (!value) return
    const matches = item => `${item.title || item.name} ${item.code || ''} ${item.course || item.category || ''}`.toLowerCase().includes(value)
    const hasCourse = courses.some(matches)
    const hasPaper = materials.some(item => item.type === 'Question Paper' && matches(item))
    const hasResource = materials.some(matches)
    const route = hasPaper && !hasCourse ? '/papers' : hasResource && !hasCourse ? '/materials' : hasCourse ? '/courses' : '/materials'
    navigate(`${route}?search=${encodeURIComponent(query.trim())}`)
  }

  return <div className="app-shell">
    <Sidebar open={open} onClose={() => setOpen(false)} />
    <div className="main-panel">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
        <div className="breadcrumbs"><span>Learning space</span><ChevronRight size={15} /><b>{title}</b></div>
        <div className="topbar-actions">
          <label className="top-search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search anything..." onKeyDown={e => e.key === 'Enter' && submitSearch()} /><kbd>Ctrl K</kbd></label>
          <button className="icon-button top-theme" aria-label="Toggle theme" onClick={toggleTheme}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
          <div className="notification-wrap"><button className="icon-button notification" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications(v => !v)}><Bell size={19} /><i /></button>{showNotifications && <div className="notification-popover"><b>You're all caught up</b><span>New study materials appear here when they are added to your courses.</span><button onClick={() => { setShowNotifications(false); navigate('/materials') }}>Browse study materials</button></div>}</div>
          <div className="account-menu-wrap" ref={accountMenuRef}>
            <button className="top-avatar" type="button" aria-label={`Open account menu for ${user?.name || 'student'}`} aria-haspopup="menu" aria-expanded={showAccountMenu} onClick={() => setShowAccountMenu(value => !value)}>{user?.name?.trim()?.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'S'}</button>
            {showAccountMenu && <div className="account-popover" role="menu">
              <div className="account-popover-user"><span className="avatar avatar-blue">{user?.name?.trim()?.[0]?.toUpperCase() || 'S'}</span><span><b>{user?.name || 'Student account'}</b><small>{user?.email || 'No email added'}</small>{profileDetails?.phone && <small>{profileDetails.phone}</small>}<small>{profileDetails?.branch || 'CSE'} · Semester {profileDetails?.semester || '1'}</small></span></div>
              <Link className="account-profile-progress" role="menuitem" to="/profile" onClick={() => setShowAccountMenu(false)}><span><b>Profile completion</b><strong>{profileCompletion}%</strong></span><i><span style={{ width: `${profileCompletion}%` }}/></i></Link>
              <nav className="account-quick-links" aria-label="Quick navigation">{accountLinks.map(({ label, path, icon: Icon }) => <Link role="menuitem" key={path} to={path} onClick={() => setShowAccountMenu(false)}><Icon size={15}/>{label}</Link>)}</nav>
              <button role="menuitem" onClick={() => { setShowAccountMenu(false); logout(); navigate('/') }}><LogOut size={16}/> Sign out</button>
            </div>}
          </div>
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="app-footer"><span>LearnHub | Built for your next big idea.</span><div><a href="mailto:support@learnhub.example">Help center</a><a href="mailto:support@learnhub.example">Contact</a></div></footer>
    </div>
  </div>
}
