import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import StudentLayout from './layouts/StudentLayout'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Materials from './pages/Materials'
import Papers from './pages/Papers'
import Profile from './pages/Profile'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Admin from './pages/Admin'
import Quantum from './pages/Quantum'
import { useAuth } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'

function AdminOnly(){const {user}=useAuth();return user?.isAdmin?<Admin/>:<Navigate to="/dashboard" replace/>}

export default function App(){return <ThemeProvider><AuthProvider><ContentProvider><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Auth/>}/><Route path="/signup" element={<Auth mode="signup"/>}/><Route path="/forgot-password" element={<Auth mode="forgot"/>}/><Route element={<StudentLayout/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/courses" element={<Courses/>}/><Route path="/courses/:id" element={<CourseDetail/>}/><Route path="/quantum" element={<Quantum/>}/><Route path="/materials" element={<Materials/>}/><Route path="/papers" element={<Papers/>}/><Route path="/profile" element={<Profile/>}/><Route path="/admin" element={<AdminOnly/>}/></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes></ContentProvider></AuthProvider></ThemeProvider>}
