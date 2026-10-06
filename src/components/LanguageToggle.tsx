'use client'

import { useLanguage } from '@/context/LanguageContext'
import { Globe } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-xl bg-slate-800/50 border border-white/5" />
    )
  }

  const isTurkish = language === 'tr'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm group"
      title={isTurkish ? 'Switch to English' : 'Türkçe Dilini Seç'}
      aria-label="Toggle Language"
    >
      <Globe className="w-3.5 h-3.5 text-indigo-500 group-hover:rotate-45 transition-transform duration-300" />
      <span className="tracking-wide">
        {isTurkish ? 'TR' : 'EN'}
      </span>
    </button>
  )
}
