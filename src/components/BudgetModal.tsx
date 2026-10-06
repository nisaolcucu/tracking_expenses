'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/receipt-normalizer'
import { saveBudgetAction } from '@/app/actions/budgets'
import { Target, X, Check, Loader2, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface BudgetModalProps {
  initialBudgets: Record<string, number>
}

export default function BudgetModal({ initialBudgets }: BudgetModalProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [budgets, setBudgets] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    EXPENSE_CATEGORIES.forEach((cat) => {
      map[cat] = initialBudgets[cat] ? initialBudgets[cat].toString() : ''
    })
    return map
  })

  const [savingCategory, setSavingCategory] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSave = (cat: ExpenseCategory) => {
    const val = parseFloat(budgets[cat])
    if (isNaN(val) || val < 0) return

    setSavingCategory(cat)
    setSavedSuccess(null)

    startTransition(async () => {
      const res = await saveBudgetAction(cat, val)
      if (res.success) {
        setSavedSuccess(cat)
        setTimeout(() => setSavedSuccess(null), 1500)
      }
      setSavingCategory(null)
    })
  }

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative cursor-default overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t('budget_modal_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('budget_modal_subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Limit Inputs (Scrollable) */}
        <div className="my-4 space-y-3 overflow-y-auto pr-1 flex-1">
          {EXPENSE_CATEGORIES.map((cat) => {
            const isThisSaving = isPending && savingCategory === cat
            const isThisSuccess = savedSuccess === cat
            const translatedCat =
              t(`cat_${cat}`) !== `cat_${cat}` ? t(`cat_${cat}`) : cat

            return (
              <div
                key={cat}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 gap-3"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 min-w-24">
                  {translatedCat}
                </span>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="relative max-w-[140px]">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={budgets[cat]}
                      onChange={(e) =>
                        setBudgets((prev) => ({
                          ...prev,
                          [cat]: e.target.value,
                        }))
                      }
                      className="w-full pl-3 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-[10px] text-slate-400 dark:text-slate-500 pointer-events-none">
                      ₺
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isThisSaving}
                    onClick={() => handleSave(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isThisSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isThisSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isThisSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('budget_saved')}</span>
                      </>
                    ) : (
                      <span>{t('save_btn')}</span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            AI budget alerts active
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 text-xs font-medium transition-all cursor-pointer shadow-sm"
      >
        <Target className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
        <span>{t('btn_budgets')}</span>
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  )
}

