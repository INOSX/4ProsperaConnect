import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // 🌙 Detectar preferência do sistema
  const getSystemPreference = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // 🎨 Carregar tema salvo ou usar preferência do sistema
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        return savedTheme
      }
      return getSystemPreference()
    }
    return 'light'
  }

  const [theme, setTheme] = useState(getInitialTheme)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 🎯 Toggle entre light e dark
  const toggleTheme = () => {
    setIsTransitioning(true)
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
    
    // Reset transition flag após animação
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // 💾 Salvar no localStorage e aplicar ao document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
      
      // Aplicar classe 'dark' para Tailwind
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      // Também manter data-theme para CSS variables
      document.documentElement.setAttribute('data-theme', theme)
      
      // Adicionar classe para transição suave
      if (isTransitioning) {
        document.documentElement.classList.add('theme-transitioning')
      } else {
        document.documentElement.classList.remove('theme-transitioning')
      }
    }
  }, [theme, isTransitioning])

  // 👂 Escutar mudanças na preferência do sistema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e) => {
        // Só aplicar se não houver tema salvo pelo usuário
        const savedTheme = localStorage.getItem('theme')
        if (!savedTheme) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isTransitioning
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext
