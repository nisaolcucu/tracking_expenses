'use client'

import { useState, useRef, useEffect } from 'react'
import { useCurrency, type CurrencyCode } from '@/context/CurrencyContext'
import { ChevronDown, Check, Coins } from 'lucide-react'

export default function CurrencyToggle() {
  const { currency, setCurrency, currencies } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const activeCurrency = currencies.find((c) => c.code === currency) || currencies[0]

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
        title="Para Birimi Değiştir / Change Currency"
        aria-label="Currency Selector"
      >
        <span className="font-bold text-indigo-600 dark:text-indigo-400">
          {activeCurrency.symbol}
        </span>
        <span className="text-[11px] font-medium tracking-tight">
          {activeCurrency.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            Para Birimi / Currency
          </div>
          {currencies.map((c) => {
            const isSelected = c.code === currency
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 font-bold text-center text-sm">
                    {c.symbol}
                  </span>
                  <span>{c.code}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
