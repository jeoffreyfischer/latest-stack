import { useState, useEffect } from 'react'

const THEME_KEY = 'latest-stack-theme'

function loadTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(): ['light' | 'dark', (theme: 'light' | 'dark') => void] {
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  return [theme, setTheme]
}
