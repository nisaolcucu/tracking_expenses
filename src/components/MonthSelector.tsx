'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Flame,
} from 'lucide-react'
import { formatMonthYear, formatCurrency } from '@/lib/formatters'
import { useLanguage } from '@/context/LanguageContext'
import { useCurrency } from '@/context/CurrencyContext'

interface MonthSelectorProps {
  selectedMonth: string // YYYY-MM
  dailyTotals?: Record<string, number> // 'YYYY-MM-DD' -> amount
}

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const DAYS_OF_WEEK_TR = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
const DAYS_OF_WEEK_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function MonthSelector({
  selectedMonth,
  dailyTotals = {},
}: MonthSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const { currency } = useCurrency()

  const [isOpen, setIsOpen] = useState(false)

  const monthNames = language === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_TR
  const daysOfWeek = language === 'en' ? DAYS_OF_WEEK_EN : DAYS_OF_WEEK_TR

  const [currentYear, currentMonthNum] = selectedMonth
    .split('-')
    .map((n) => parseInt(n, 10))

  const [modalYear, setModalYear] = useState<number>(currentYear)

  const navigateToMonth = (year: number, monthIndex: number) => {
    const formattedMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', formattedMonth)
    router.push(`/?${params.toString()}`)
  }

  const handleMonthOffset = (offset: number) => {
    const newDate = new Date(currentYear, currentMonthNum - 1 + offset, 1)
    const newYear = newDate.getFullYear()
    const newMonth = String(newDate.getMonth() + 1).padStart(2, '0')
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', `${newYear}-${newMonth}`)
    router.push(`/?${params.toString()}`)
  }

  const handleResetToCurrent = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', `${year}-${month}`)
    router.push(`/?${params.toString()}`)
  }

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const isCurrentMonth = selectedMonth === todayStr

  // Takvim günlerini hesaplama
  const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate()
  const firstDayOfWeek =
    (new Date(currentYear, currentMonthNum - 1, 1).getDay() + 6) % 7

  // Harcama seviyesine göre renk belirleme
  const getDayColor = (amount: number) => {
    if (!amount || amount === 0) {
      return 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
    }
    if (amount < 500) {
      return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
    }
    if (amount <= 2000) {
      return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
    }
    return 'bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/50 shadow-md shadow-rose-500/20 font-bold'
  }

  return (
    <>
      {/* Ana Çubuk Butonları */}
      <div className="flex items-center justify-between bg-white/85 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-lg">
        <button
          type="button"
          onClick={() => handleMonthOffset(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Önceki"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Tıklandığında Takvim Modalı Açılır */}
          <button
            type="button"
            onClick={() => {
              setModalYear(currentYear)
              setIsOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-slate-800 dark:text-white font-medium text-sm sm:text-base capitalize transition-all cursor-pointer group"
            title={t('calendar_title')}
          >
            <CalendarIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>{formatMonthYear(selectedMonth, language)}</span>
            <span className="text-[10px] bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-normal">
              {t('change_date')}
            </span>
          </button>

          {!isCurrentMonth && (
            <button
              type="button"
              onClick={handleResetToCurrent}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer font-medium"
            >
              {t('this_month')}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleMonthOffset(1)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Sonraki"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Gelişmiş Takvim & Isı Haritası Modalı */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('calendar_title')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('calendar_subtitle')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Yıl Seçici (Hızlı Geçiş) */}
            <div className="my-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalYear((y) => y - 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{modalYear}</span>
              <button
                type="button"
                onClick={() => setModalYear((y) => y + 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 12 Ay Hızlı Seçim Izgarası */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {monthNames.map((name, idx) => {
                const isSelected =
                  modalYear === currentYear && idx === currentMonthNum - 1

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => navigateToMonth(modalYear, idx)}
                    className={`py-2 px-1 text-xs rounded-xl font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-100 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800/80'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>

            {/* Seçili Ayın Harcama Yoğunluğu Takvimi (Heatmap) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {formatMonthYear(selectedMonth, language)} {t('daily_breakdown')}
                </span>
              </div>

              {/* Gün Başlıkları */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                {daysOfWeek.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Günler Izgarası */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Ay başlangıcındaki boşluklar */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9" />
                ))}

                {/* Ayın Günleri */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`
                  const dayAmount = dailyTotals[dateStr] || 0
                  const colorClass = getDayColor(dayAmount)

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={`h-9 rounded-xl flex flex-col items-center justify-center text-[11px] transition-transform hover:scale-105 cursor-default relative group ${colorClass}`}
                      title={
                        dayAmount > 0
                          ? `${dayNum} ${formatMonthYear(selectedMonth, language)}: ${formatCurrency(dayAmount, currency, language)}`
                          : `${dayNum} ${formatMonthYear(selectedMonth, language)}: ${t('no_data')}`
                      }
                    >
                      <span>{dayNum}</span>

                      {/* Küçük harcama göstergesi noktası */}
                      {dayAmount > 0 && (
                        <span className="w-1 h-1 rounded-full bg-current opacity-80 mt-0.5" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Renk Lejantı (Açıklama) ve Kapat Butonu */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-800 border border-slate-400 dark:border-slate-700" />
                    <span>0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>&lt;₺500</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>₺500-2K</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>&gt;₺2K</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-colors cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

