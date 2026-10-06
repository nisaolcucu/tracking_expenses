import { formatCurrency } from '@/lib/formatters'
import { Wallet, ReceiptText, TrendingUp } from 'lucide-react'

interface SummaryCardsProps {
  totalAmount: number
  expenseCount: number
  topCategory: { category: string; amount: number } | null
}

export default function SummaryCards({
  totalAmount,
  expenseCount,
  topCategory,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Toplam Harcama Kartı */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-900/80 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Aylık Toplam Harcama
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {formatCurrency(totalAmount)}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Seçili aydaki onaylanan tüm harcamalar
        </p>
      </div>

      {/* Fiş Sayısı Kartı */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Kaydedilen Fiş
          </span>
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <ReceiptText className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {expenseCount} <span className="text-sm font-normal text-slate-400">adet</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {expenseCount > 0
            ? `Fiş başına ort. ${formatCurrency(totalAmount / expenseCount)}`
            : 'Henüz harcama yok'}
        </p>
      </div>

      {/* En Çok Harcanan Kategori */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Lider Kategori
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
          {topCategory ? topCategory.category : '-'}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {topCategory
            ? `${formatCurrency(topCategory.amount)} harcandı`
            : 'Veri bulunmuyor'}
        </p>
      </div>
    </div>
  )
}
