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

interface MonthSelectorProps {
  selectedMonth: string // YYYY-MM
  dailyTotals?: Record<string, number> // 'YYYY-MM-DD' -> amount
}

const MONTH_NAMES = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

const DAYS_OF_WEEK = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']

export default function MonthSelector({
  selectedMonth,
  dailyTotals = {},
}: MonthSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)

  const [currentYear, currentMonthNum] = selectedMonth
    .split('-')
    .map((n) => parseInt(n, 10))

  const [modalYear, setModalYear] = useState<number>(currentYear)

  const navigateToMonth = (year: number, monthIndex: number) => {
    const formattedMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', formattedMonth)
    router.push(`/?${params.toString()}`)
    // Modal kullanıcının günleri ve harita yoğunluğunu inceleyebilmesi için açık kalır
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
  // 1. günün haftanın hangi günü olduğu (Pazartesi=0, Pazar=6)
  const firstDayOfWeek =
    (new Date(currentYear, currentMonthNum - 1, 1).getDay() + 6) % 7

  // Harcama seviyesine göre renk belirleme
  const getDayColor = (amount: number) => {
    if (!amount || amount === 0) {
      return 'bg-slate-900/60 text-slate-500 border border-slate-800/80 hover:border-slate-700'
    }
    if (amount < 500) {
      // Düşük harcama: Yeşil
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
    }
    if (amount <= 2000) {
      // Orta harcama: Sarı
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
    }
    // Yüksek harcama: Kırmızı
    return 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-md shadow-rose-500/20 font-bold'
  }

  return (
    <>
      {/* Ana Çubuk Butonları */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-lg">
        <button
          type="button"
          onClick={() => handleMonthOffset(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Önceki Ay"
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 text-white font-medium text-sm sm:text-base capitalize transition-all cursor-pointer group"
            title="Takvim ve Yıl Seçiciyi Aç"
          >
            <CalendarIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>{formatMonthYear(selectedMonth)}</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-normal">
              Değiştir
            </span>
          </button>

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
          onClick={() => handleMonthOffset(1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Sonraki Ay"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Gelişmiş Takvim & Isı Haritası Modalı */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Tarih & Harcama Takvimi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Geçmiş yıllara atlayın ve harcama yoğunluğunu görün
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Yıl Seçici (Hızlı Geçiş) */}
            <div className="my-4 flex items-center justify-between bg-slate-950/70 p-2 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setModalYear((y) => y - 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-white">{modalYear}</span>
              <button
                type="button"
                onClick={() => setModalYear((y) => y + 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 12 Ay Hızlı Seçim Izgarası */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {MONTH_NAMES.map((name, idx) => {
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
                        : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>

            {/* Seçili Ayın Harcama Yoğunluğu Takvimi (Heatmap) */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  {formatMonthYear(selectedMonth)} Günlük Harcama Dağılımı
                </span>
              </div>

              {/* Gün Başlıkları (Pt, Sa, ...) */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-500 mb-1.5">
                {DAYS_OF_WEEK.map((day) => (
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
                          ? `${dayNum} ${formatMonthYear(selectedMonth)}: ${formatCurrency(dayAmount)}`
                          : `${dayNum} ${formatMonthYear(selectedMonth)}: Harcama yok`
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
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700" />
                    <span>Yok</span>
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
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
