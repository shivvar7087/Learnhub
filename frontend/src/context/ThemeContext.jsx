import { createContext, useContext, useEffect, useState } from 'react'
import { usePersistedState } from '../hooks/usePersistedState'
const ThemeContext = createContext(null)
export function ThemeProvider({ children }) {
  const [dark, setDark] = usePersistedState('learnhub-theme', false)
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  return <ThemeContext.Provider value={{dark, toggleTheme:()=>setDark(v=>!v)}}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)
