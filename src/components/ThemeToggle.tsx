'use client'

import { useTheme } from '@/context/ThemeProvider'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-800/50 border border-white/5" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm group"
      title={isDark ? 'Açık Moda Geç (Switch to Light)' : 'Koyu Moda Geç (Switch to Dark)'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  )
}
