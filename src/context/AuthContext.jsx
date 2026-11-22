import { createContext, useContext, useEffect, useState } from 'react'
import { migrateLegacyUserData, moveUserData, readUserData } from '../utils/userData'
import { ACCESS_TOKEN_KEY, apiRequest } from '../services/api'

const AuthContext = createContext(null)
const STUDENTS_KEY = 'learnhub-students'

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

function initialStudents() {
  const stored = readJson(STUDENTS_KEY, [])
  return Array.isArray(stored) ? stored : []
}

function storeAccount(account) {
  localStorage.setItem('learnhub-user', JSON.stringify(account))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [students, setStudents] = useState(initialStudents)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (!token) { setAuthReady(true); return }
    apiRequest('/api/auth/me')
      .then(account => {
        migrateLegacyUserData(account)
        setUser(account)
        storeAccount(account)
      })
      .catch(error => {
        if (error.status === 401) {
          localStorage.removeItem(ACCESS_TOKEN_KEY)
          localStorage.removeItem('learnhub-user')
        }
      })
      .finally(() => setAuthReady(true))
  }, [])

  const saveStudent = student => {
    if (!student?.email || student.isAdmin) return
    const current = readJson(STUDENTS_KEY, students)
    const rows = Array.isArray(current) ? current : []
    const exists = rows.some(item => item.email === student.email)
    const next = exists
      ? rows.map(item => item.email === student.email ? { ...item, ...student } : item)
      : [...rows, { ...student, createdAt: new Date().toISOString() }]
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(next))
    setStudents(next)
  }

  const establishSession = response => {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token)
    const account = response.user
    migrateLegacyUserData(readJson('learnhub-user', null))
    setUser(account)
    storeAccount(account)
    saveStudent(account)
    return account
  }

  const login = async (email, password) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    })
    return establishSession(response)
  }

  const register = async (email, password, name) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim() }),
    })
    return establishSession(response)
  }

  const updateProfile = async updates => {
    if (!user) throw new Error('Sign in to update your profile.')
    const previous = user
    const account = await apiRequest('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updates.name,
        email: updates.email?.trim().toLowerCase() || user.email,
        phone: updates.phone ?? user.phone ?? '',
      }),
    })
    const oldProfile = readUserData('learnhub-profile', previous, {})
    moveUserData(previous, account)
    writeUserData('learnhub-profile', account, { ...oldProfile, ...updates, ...account })
    setUser(account)
    storeAccount(account)
    if (previous.email !== account.email) {
      const rows = readJson(STUDENTS_KEY, students)
      const next = (Array.isArray(rows) ? rows : []).filter(item => item.email !== previous.email && item.email !== account.email)
      if (!account.isAdmin) next.push({ ...account, createdAt: new Date().toISOString() })
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(next))
      setStudents(next)
    } else saveStudent(account)
    return account
  }

  const logout = () => {
    migrateLegacyUserData(user)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem('learnhub-user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, students, authReady, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
