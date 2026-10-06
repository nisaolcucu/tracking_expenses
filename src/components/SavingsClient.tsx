'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/formatters'
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
        <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950/90 border border-indigo-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Kumbarada Biriken
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formatCurrency(totalSaved)}
          </div>
          <div className="mt-3 text-xs text-indigo-200/70">
            Toplam hedef: {formatCurrency(totalTarget)}
          </div>
        </div>

        {/* Genel İlerleme */}
        <div className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Genel Başarı Oranı
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center border border-emerald-500/25">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            %{overallPercentage}
          </div>
          <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Hedef Sayısı */}
        <div className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aktif Hedefler
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center border border-amber-500/25">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {goals.length}{' '}
            <span className="text-sm font-medium text-slate-400">kumbara</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {goals.filter((g) => g.current_amount >= g.target_amount).length} hedef tamamlandı!
          </div>
        </div>
      </div>

      {/* Hedefler Grid & Yeni Hedef Butonu */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">
              Birikim Hedeflerim
            </h3>
            <p className="text-xs text-slate-400">
              Hayalleriniz için tasarruf hedefleri belirleyin ve kumbaranıza para ekleyin
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
            <span>Yeni Hedef Ekle</span>
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-400">
            <PiggyBank className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-white">
              Henüz Birikim Hedefiniz Yok
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tatil, yeni cihaz veya acil durum fonu için ilk kumbaranızı oluşturarak birikim yapmaya başlayın!
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
                  className="group relative p-5 rounded-3xl bg-slate-950/50 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-950/80 transition-all duration-300 flex flex-col justify-between shadow-lg"
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
                          <h4 className="font-bold text-white text-base">
                            {goal.title}
                          </h4>
                          {goal.target_date && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              Hedef: {formatDate(goal.target_date)}
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
                            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(goal.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 bg-slate-900/60 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Hedefi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Tutarlar & İlerleme */}
                    <div className="mt-4 mb-2 flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-white">
                        {formatCurrency(current, goal.currency)}
                      </span>
                      <span className="text-xs text-slate-400">
                        / {formatCurrency(target, goal.currency)}
                      </span>
                    </div>

                    {/* İlerleme Çubuğu */}
                    <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5 mb-2">
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
                          isCompleted ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {isCompleted ? '🎉 Hedefe Ulaşıldı!' : `Kalan: ${formatCurrency(remaining)}`}
                      </span>
                      <span className="font-bold text-white">%{pct}</span>
                    </div>
                  </div>

                  {/* Alt Kısım: Hızlı Para Ekleme Butonları */}
                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(goal, 100)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-[11px] font-medium transition-all cursor-pointer"
                      >
                        +100 ₺
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(goal, 500)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-[11px] font-medium transition-all cursor-pointer"
                      >
                        +500 ₺
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(goal, 1000)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-[11px] font-medium transition-all cursor-pointer"
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
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>Özel Ekle</span>
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setDepositModalGoal(null)}
        >
          <div
            className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative cursor-default space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Kumbaraya Ekle</h3>
                  <p className="text-xs text-slate-400">{depositModalGoal.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDepositModalGoal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Eklenecek Tutar (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  {isDepositing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Ekle</span>
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative cursor-default space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Yeni Birikim Hedefi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Geleceğiniz için birikim hedefi belirleyin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hedef Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Yaz Tatili Fonu, Yeni Bilgisayar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hedef Tutar (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Başlangıç Birikimi (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hedef Tarih (İsteğe Bağlı)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tema Rengi
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        selectedColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Hedefi Oluştur</span>
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
