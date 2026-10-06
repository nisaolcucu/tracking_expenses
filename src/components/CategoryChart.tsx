'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/formatters'
import { BarChart3 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface CategoryChartProps {
  data: {
    category: string
    amount: number
  }[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Market: '#6366f1', // Indigo
  'Yeme-İçme': '#f97316', // Orange
  Ulaşım: '#06b6d4', // Cyan
  Fatura: '#eab308', // Yellow
  Sağlık: '#10b981', // Emerald
  Giyim: '#ec4899', // Pink
  Eğlence: '#a855f7', // Purple
  Diğer: '#64748b', // Slate
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { t, language } = useLanguage()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredData = data
    .filter((item) => item.amount > 0)
    .map((item) => ({
      ...item,
      translatedCategory:
        t(`cat_${item.category}`) !== `cat_${item.category}`
          ? t(`cat_${item.category}`)
          : item.category,
    }))

  if (!isMounted) {
    return (
      <div className="bg-white/85 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl h-72 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="bg-white/85 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl h-72 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 flex items-center justify-center mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('no_chart_data')}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {t('no_chart_data_desc')}
        </p>
      </div>
    )
  }

  return (
    <div className="relative z-10 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shadow-md shadow-indigo-500/10">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
            {t('chart_title')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('chart_subtitle')}
          </p>
        </div>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
          >
            <XAxis
              dataKey="translatedCategory"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₺${val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xl">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.translatedCategory}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {formatCurrency(item.amount, 'TRY', language)}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {filteredData.map((entry) => (
                <Cell
                  key={`cell-${entry.category}`}
                  fill={CATEGORY_COLORS[entry.category] || '#6366f1'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

