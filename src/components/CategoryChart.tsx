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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredData = data.filter((item) => item.amount > 0)

  if (!isMounted) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl h-72 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl h-72 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-300">
          Bu ay henüz grafik oluşturacak harcama verisi yok
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Yeni bir fiş eklediğinizde kategori dağılımı burada belirecektir.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm sm:text-base">
            Kategori Bazında Harcamalar
          </h3>
          <p className="text-xs text-slate-400">
            Seçili aydaki toplam tutarın kategorilere göre dağılımı
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
              dataKey="category"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
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
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl">
                      <p className="text-xs font-semibold text-slate-400">
                        {item.category}
                      </p>
                      <p className="text-sm font-bold text-white mt-1">
                        {formatCurrency(item.amount)}
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
