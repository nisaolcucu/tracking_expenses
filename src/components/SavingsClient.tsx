'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useLanguage } from '@/context/LanguageContext'
import {
  saveSavingsGoalAction,
  addMoneyToSavingsAction,
  deleteSavingsGoalAction,
  type SavingsGoalItem,
} from '@/app/actions/savings'
import {
  PiggyBank,
  Plus,
  Calendar,
  Trash2,
  Check,
  X,
  Loader2,
  Sparkles,
  TrendingUp,
  Target,
  Coins,
  ArrowUpRight,
} from 'lucide-react'

interface SavingsClientProps {
  initialGoals: SavingsGoalItem[]
}

const COLOR_OPTIONS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
]

export default function SavingsClient({ initialGoals }: SavingsClientProps) {
  const router = useRouter()
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-US' : 'tr-TR'
  const [goals, setGoals] = useState<SavingsGoalItem[]>(initialGoals)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Para Ekleme State (Hangi hedefe para atılıyor)
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoalItem | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [isDepositing, startDepositTransition] = useTransition()

  // Form State
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialAmount, setInitialAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [selectedColor, setSelectedColor] = useState('#6366f1')
  const [formError, setFormError] = useState<string | null>(null)

  // Silme Onay State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // İstatistikler
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0)
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0)
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const numTarget = parseFloat(targetAmount)
    const numInitial = initialAmount ? parseFloat(initialAmount) : 0

    if (!title.trim()) {
      setFormError('Lütfen hedef başlığını girin.')
      return
    }

    if (isNaN(numTarget) || numTarget <= 0) {
      setFormError('Geçerli bir hedef tutar girin.')
      return
    }

    startTransition(async () => {
      const res = await saveSavingsGoalAction({
        title: title.trim(),
        target_amount: numTarget,
        current_amount: numInitial,
        target_date: targetDate || null,
        color: selectedColor,
      })

      if (res.success && res.data) {
        setGoals((prev) => [res.data as SavingsGoalItem, ...prev])
        setIsModalOpen(false)
        setTitle('')
        setTargetAmount('')
        setInitialAmount('')
        setTargetDate('')
        router.refresh()
      } else {
        setFormError(res.error || 'Kaydedilemedi.')
      }
    })
  }

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositModalGoal) return

    const numAdd = parseFloat(depositAmount)
    if (isNaN(numAdd) || numAdd === 0) return

    startDepositTransition(async () => {
      const res = await addMoneyToSavingsAction(depositModalGoal.id, numAdd)
      if (res.success && typeof res.newAmount === 'number') {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === depositModalGoal.id
              ? { ...g, current_amount: res.newAmount! }
              : g
          )
        )
        setDepositModalGoal(null)
        setDepositAmount('')
        router.refresh()
      }
    })
  }

  const handleQuickAdd = (goal: SavingsGoalItem, amountToAdd: number) => {
    startDepositTransition(async () => {
      const res = await addMoneyToSavingsAction(goal.id, amountToAdd)
      if (res.success && typeof res.newAmount === 'number') {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goal.id ? { ...g, current_amount: res.newAmount! } : g
          )
        )
        router.refresh()
      }
    })
  }

  const handleDeleteGoal = (id: string) => {
    startTransition(async () => {
      const res = await deleteSavingsGoalAction(id)
      if (res.success) {
        setGoals((prev) => prev.filter((g) => g.id !== id))
        setConfirmDeleteId(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Üst İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Toplam Biriken Para */}
        <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-50/90 via-white to-indigo-100/40 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-slate-950/90 border border-indigo-200/80 dark:border-indigo-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
              {t('savings_saved_title')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalSaved, 'TRY', locale)}
          </div>
          <div className="mt-3 text-xs text-indigo-600/80 dark:text-indigo-200/70">
            {language === 'en' ? 'Total Target: ' : 'Toplam hedef: '}
            {formatCurrency(totalTarget, 'TRY', locale)}
          </div>
        </div>

        {/* Genel İlerleme */}
        <div className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('savings_success_title')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/25">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            %{overallPercentage}
          </div>
          <div className="mt-3 w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Hedef Sayısı */}
        <div className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('savings_goals_title')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center border border-amber-500/25">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {goals.length}{' '}
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {language === 'en' ? 'goals' : 'kumbara'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {goals.filter((g) => g.current_amount >= g.target_amount).length}{' '}
            {language === 'en' ? 'goals achieved!' : 'hedef tamamlandı!'}
          </div>
        </div>
      </div>

      {/* Hedefler Grid & Yeni Hedef Butonu */}
      <div className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/5">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
              {t('savings_list_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('savings_list_desc')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setTitle('')
              setTargetAmount('')
              setInitialAmount('')
              setTargetDate('')
              setIsModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('savings_add_btn')}</span>
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <PiggyBank className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {t('savings_no_goals')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {t('savings_no_goals_desc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const current = Number(goal.current_amount)
              const target = Number(goal.target_amount)
              const pct = target > 0 ? Math.round((current / target) * 100) : 0
              const isCompleted = current >= target
              const remaining = Math.max(0, target - current)

              return (
                <div
                  key={goal.id}
                  className="group relative p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5 hover:border-indigo-500/30 hover:bg-white dark:hover:bg-slate-950/80 transition-all duration-300 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    {/* Üst Kısım: Başlık, Durum, Silme */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                          style={{ backgroundColor: `${goal.color}25`, borderColor: `${goal.color}40`, borderWidth: 1 }}
                        >
                          <Coins className="w-5 h-5" style={{ color: goal.color }} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {goal.title}
                          </h4>
                          {goal.target_date && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              {t('target_date_prefix')} {formatDate(goal.target_date, locale)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Silme */}
                      {confirmDeleteId === goal.id ? (
                        <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1 bg-rose-600 text-white rounded-lg cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(goal.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 bg-white/80 dark:bg-slate-900/60 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                          title={language === 'en' ? 'Delete Goal' : 'Hedefi Sil'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Tutarlar & İlerleme */}
                    <div className="mt-4 mb-2 flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(current, goal.currency, locale)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        / {formatCurrency(target, goal.currency, locale)}
                      </span>
                    </div>

                    {/* İlerleme Çubuğu */}
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: isCompleted ? '#10b981' : goal.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold ${
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isCompleted
                          ? t('savings_reached')
                          : `${t('savings_remaining')}: ${formatCurrency(remaining, goal.currency, locale)}`}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">%{pct}</span>
                    </div>
                  </div>

                  {/* Alt Kısım: Hızlı Para Ekleme Butonları */}
                  <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(goal, 100)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 text-[11px] font-medium transition-all cursor-pointer shadow-sm"
                      >
                        +100 ₺
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(goal, 500)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 text-[11px] font-medium transition-all cursor-pointer shadow-sm"
                      >
                        +500 ₺
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(goal, 1000)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 text-[11px] font-medium transition-all cursor-pointer shadow-sm"
                      >
                        +1.000 ₺
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDepositModalGoal(goal)
                        setDepositAmount('')
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>{t('savings_quick_add')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Özel Tutar Kumbaraya Ekle Modal */}
      {depositModalGoal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setDepositModalGoal(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative cursor-default space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('deposit_to_piggy')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{depositModalGoal.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDepositModalGoal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('amount_to_add_label')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-medium cursor-pointer"
                >
                  {t('cancel_btn')}
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  {isDepositing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{t('add_deposit_btn')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni Hedef Ekle Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative cursor-default space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t('new_goal_modal_title')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('new_goal_modal_desc')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('goal_title_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('goal_title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('target_amount_label')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('initial_amount_label')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('target_date_label')}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('color_theme_label')}
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        selectedColor === c ? 'scale-125 ring-2 ring-indigo-500 dark:ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-medium cursor-pointer"
                >
                  {t('cancel_btn')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{t('create_goal_btn')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
