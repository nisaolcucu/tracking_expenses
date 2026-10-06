'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { formatMonthYear } from '@/lib/formatters'

interface MonthSelectorProps {
  selectedMonth: string // YYYY-MM
}

export default function MonthSelector({ selectedMonth }: MonthSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleMonthChange = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map((n) => parseInt(n, 10))
    // JS Date month 0-indexed
    const newDate = new Date(year, month - 1 + offset, 1)
    const newYear = newDate.getFullYear()
    const newMonth = String(newDate.getMonth() + 1).padStart(2, '0')
    const newMonthStr = `${newYear}-${newMonth}`

    const params = new URLSearchParams(searchParams.toString())
    params.set('month', newMonthStr)
    router.push(`/?${params.toString()}`)
  }

  const handleResetToCurrent = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const currentMonthStr = `${year}-${month}`

    const params = new URLSearchParams(searchParams.toString())
    params.set('month', currentMonthStr)
    router.push(`/?${params.toString()}`)
  }

  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const isCurrentMonth = selectedMonth === currentMonthStr

  return (
    <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-lg">
      <button
        type="button"
        onClick={() => handleMonthChange(-1)}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
        title="Önceki Ay"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white font-medium text-sm sm:text-base capitalize">
          <CalendarIcon className="w-4 h-4 text-indigo-400" />
          <span>{formatMonthYear(selectedMonth)}</span>
        </div>

        {!isCurrentMonth && (
          <button
            type="button"
            onClick={handleResetToCurrent}
            className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
          >
            Bu Ay
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => handleMonthChange(1)}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
        title="Sonraki Ay"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
