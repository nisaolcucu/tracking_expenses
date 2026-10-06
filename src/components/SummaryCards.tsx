'use client'

import { formatCurrency } from '@/lib/formatters'
import { Wallet, ReceiptText, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCurrency } from '@/context/CurrencyContext'

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
  const { t, language } = useLanguage()
  const { currency } = useCurrency()

  const translatedTopCategory = topCategory
    ? t(`cat_${topCategory.category}`) !== `cat_${topCategory.category}`
      ? t(`cat_${topCategory.category}`)
      : topCategory.category
    : '-'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
      {/* Toplam Harcama Kartı (Vibrant Hero Card) */}
      <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-slate-950/90 border border-indigo-400/40 dark:border-indigo-500/30 shadow-xl shadow-indigo-600/10 hover:shadow-indigo-500/20 text-white">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-white/15 dark:group-hover:bg-indigo-500/25" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-100 dark:text-indigo-300/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 dark:bg-indigo-400 animate-pulse" />
            {t('total_spent')}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-white/15 dark:bg-indigo-500/20 text-white dark:text-indigo-300 flex items-center justify-center border border-white/20 dark:border-indigo-500/30 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {formatCurrency(totalAmount, currency, language)}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-100/80 dark:text-indigo-200/70">
          <span>{t('all_confirmed')}</span>
        </div>
      </div>

      {/* Fiş Sayısı Kartı */}
      <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl hover:shadow-purple-500/5">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-purple-500/20" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('recorded_receipts')}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-slate-800/80 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-500/20 group-hover:scale-110 transition-transform">
            <ReceiptText className="w-5 h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {expenseCount}{' '}
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t('receipt_count_suffix')}
          </span>
        </div>

        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {expenseCount > 0
            ? `${t('avg_per_receipt')} ${formatCurrency(totalAmount / expenseCount, currency, language)}`
            : t('no_expenses_yet')}
        </div>
      </div>

      {/* En Çok Harcanan Kategori */}
      <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/5">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-emerald-500/20" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('top_category')}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/25 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
          {translatedTopCategory}
        </div>

        <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          {topCategory
            ? `${formatCurrency(topCategory.amount, currency, language)}`
            : t('no_data')}
        </div>
      </div>
    </div>
  )
}

