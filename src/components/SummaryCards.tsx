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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
      {/* Toplam Harcama Kartı */}
      <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950/90 border border-indigo-500/30 hover:border-indigo-500/50 shadow-xl hover:shadow-indigo-500/10">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-indigo-500/25" />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Aylık Toplam Harcama
          </span>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {formatCurrency(totalAmount)}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-200/70">
          <span>Seçili ay için onaylanan fişler</span>
        </div>
      </div>

      {/* Fiş Sayısı Kartı */}
      <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-slate-900/70 backdrop-blur-xl border border-white/10 hover:border-white/20 shadow-xl hover:shadow-purple-500/5">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-purple-500/20" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Kaydedilen Fiş
          </span>
          <div className="w-10 h-10 rounded-2xl bg-slate-800/80 text-purple-300 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
            <ReceiptText className="w-5 h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {expenseCount}{' '}
          <span className="text-sm font-medium text-slate-400">adet</span>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          {expenseCount > 0
            ? `Fiş başı ort. ${formatCurrency(totalAmount / expenseCount)}`
            : 'Henüz harcama yok'}
        </div>
      </div>

      {/* En Çok Harcanan Kategori */}
      <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-slate-900/70 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 shadow-xl hover:shadow-emerald-500/5">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-emerald-500/20" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Lider Kategori
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight truncate">
          {topCategory ? topCategory.category : '-'}
        </div>

        <div className="mt-3 text-xs text-emerald-400/80 font-medium">
          {topCategory
            ? `${formatCurrency(topCategory.amount)} harcandı`
            : 'Veri bulunmuyor'}
        </div>
      </div>
    </div>
  )
}
