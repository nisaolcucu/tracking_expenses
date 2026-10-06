'use client'

import { formatCurrency } from '@/lib/formatters'
import { Target, AlertTriangle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface BudgetProgressProps {
  budgets: Record<string, number>
  categoryTotals: Record<string, number>
}

export default function BudgetProgress({
  budgets,
  categoryTotals,
}: BudgetProgressProps) {
  const { t, language } = useLanguage()

  const categoriesWithLimits = Object.keys(budgets).filter(
    (cat) => budgets[cat] && budgets[cat] > 0
  )

  if (categoriesWithLimits.length === 0) {
    return null
  }

  return (
    <div className="relative z-10 rounded-3xl p-6 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-indigo-500/20 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
              {t('budget_progress_title')}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                {t('target_tracking')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('budget_progress_subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoriesWithLimits.map((cat) => {
          const limit = budgets[cat]
          const spent = categoryTotals[cat] || 0
          const percentage = Math.round((spent / limit) * 100)
          const isOver = spent > limit
          const isWarning = percentage >= 75 && !isOver

          const catName =
            t(`cat_${cat}`) !== `cat_${cat}` ? t(`cat_${cat}`) : cat

          return (
            <div
              key={cat}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                isOver
                  ? 'bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/5'
                  : isWarning
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200/80 dark:border-white/5 hover:border-indigo-500/20'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-900 dark:text-white font-medium">{catName}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isOver
                      ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  %{percentage}
                </span>
              </div>

              {/* İlerleme Çubuğu (Glow & Gradient) */}
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden mb-2.5 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOver
                      ? 'bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                      : isWarning
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(spent, 'TRY', language)}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  / {formatCurrency(limit, 'TRY', language)}
                </span>
              </div>

              {isOver && (
                <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-300 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                  <span>+{formatCurrency(spent - limit, 'TRY', language)} {t('over_limit_suffix')}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

