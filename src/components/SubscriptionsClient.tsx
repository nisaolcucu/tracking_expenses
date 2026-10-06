'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/formatters'
import {
  saveSubscriptionAction,
  toggleSubscriptionAction,
  deleteSubscriptionAction,
  type SubscriptionItem,
} from '@/app/actions/subscriptions'
import { EXPENSE_CATEGORIES } from '@/lib/receipt-normalizer'
import {
  CreditCard,
  Plus,
  Calendar,
  Trash2,
  Check,
  X,
  Loader2,
  Clock,
  Sparkles,
  TrendingDown,
  Tv,
  Music,
  Cloud,
  Film,
  Zap,
} from 'lucide-react'

interface SubscriptionsClientProps {
  initialSubscriptions: SubscriptionItem[]
}

const POPULAR_TEMPLATES = [
  { name: 'Netflix', amount: 299, category: 'Eğlence', day: 15, icon: <Film className="w-4 h-4 text-rose-400" /> },
  { name: 'Spotify', amount: 89, category: 'Eğlence', day: 1, icon: <Music className="w-4 h-4 text-emerald-400" /> },
  { name: 'YouTube Premium', amount: 79, category: 'Eğlence', day: 22, icon: <Tv className="w-4 h-4 text-red-400" /> },
  { name: 'iCloud+', amount: 39, category: 'Fatura', day: 5, icon: <Cloud className="w-4 h-4 text-sky-400" /> },
  { name: 'ChatGPT Plus', amount: 700, category: 'Diğer', day: 12, icon: <Sparkles className="w-4 h-4 text-teal-400" /> },
  { name: 'Amazon Prime', amount: 39, category: 'Eğlence', day: 18, icon: <Zap className="w-4 h-4 text-amber-400" /> },
]

export default function SubscriptionsClient({
  initialSubscriptions,
}: SubscriptionsClientProps) {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(initialSubscriptions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form State
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Eğlence')
  const [billingDay, setBillingDay] = useState('1')
  const [formError, setFormError] = useState<string | null>(null)

  // Silme Onay State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Bugünün günü (1-31)
  const todayDate = new Date().getDate()

  // İstatistikler
  const activeSubs = subscriptions.filter((s) => s.is_active)
  const totalMonthlyCost = activeSubs.reduce((sum, s) => sum + Number(s.amount), 0)

  // En yakın ödeme günü hesabı
  const getDaysUntilBilling = (day: number) => {
    if (day >= todayDate) {
      return day - todayDate
    }
    // Gelecek ay
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    return daysInMonth - todayDate + day
  }

  // Sıralama: En yakın ödeme gününe göre
  const sortedSubs = [...subscriptions].sort((a, b) => {
    return getDaysUntilBilling(a.billing_day) - getDaysUntilBilling(b.billing_day)
  })

  const nextUpcoming = sortedSubs.find((s) => s.is_active)

  // Hızlı şablon seçimi
  const applyTemplate = (tmpl: typeof POPULAR_TEMPLATES[0]) => {
    setName(tmpl.name)
    setAmount(tmpl.amount.toString())
    setCategory(tmpl.category)
    setBillingDay(tmpl.day.toString())
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const numAmount = parseFloat(amount)
    const numDay = parseInt(billingDay, 10)

    if (!name.trim()) {
      setFormError('Lütfen abonelik adını girin.')
      return
    }

    if (isNaN(numAmount) || numAmount < 0) {
      setFormError('Geçerli bir tutar girin.')
      return
    }

    if (isNaN(numDay) || numDay < 1 || numDay > 31) {
      setFormError('Ödeme günü 1 ile 31 arasında olmalıdır.')
      return
    }

    startTransition(async () => {
      const res = await saveSubscriptionAction({
        name: name.trim(),
        amount: numAmount,
        category,
        billing_day: numDay,
      })

      if (res.success && res.data) {
        setSubscriptions((prev) => [...prev, res.data as SubscriptionItem])
        setIsModalOpen(false)
        setName('')
        setAmount('')
        router.refresh()
      } else {
        setFormError(res.error || 'Kaydedilemedi.')
      }
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleSubscriptionAction(id, !currentStatus)
      if (res.success) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_active: !currentStatus } : s))
        )
        router.refresh()
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteSubscriptionAction(id)
      if (res.success) {
        setSubscriptions((prev) => prev.filter((s) => s.id !== id))
        setConfirmDeleteId(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Üst İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Toplam Aylık Gider */}
        <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950/90 border border-indigo-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Aylık Sabit Abonelikler
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formatCurrency(totalMonthlyCost)}
          </div>
          <div className="mt-3 text-xs text-indigo-200/70">
            {activeSubs.length} aktif abonelik toplamı
          </div>
        </div>

        {/* Aktif Servis Sayısı */}
        <div className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aktif Servisler
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center border border-purple-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {activeSubs.length}{' '}
            <span className="text-sm font-medium text-slate-400">hizmet</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {subscriptions.length - activeSubs.length > 0
              ? `${subscriptions.length - activeSubs.length} adet pasif abonelik var`
              : 'Tüm servisler aktif durumda'}
          </div>
        </div>

        {/* En Yakın Ödeme */}
        <div className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              En Yakın Ödeme
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center border border-amber-500/25">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
            {nextUpcoming ? nextUpcoming.name : 'Yok'}
          </div>
          <div className="mt-3 text-xs text-amber-300/90 font-medium">
            {nextUpcoming ? (
              getDaysUntilBilling(nextUpcoming.billing_day) === 0
                ? 'Bugün ödeme günü!'
                : `${getDaysUntilBilling(nextUpcoming.billing_day)} gün sonra (${nextUpcoming.billing_day}. gün)`
            ) : (
              'Aktif abonelik bulunmuyor'
            )}
          </div>
        </div>
      </div>

      {/* Hızlı Ekleme Şablonları */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 tracking-wide">
            Hızlı Şablonlar
          </span>
          <span className="text-[11px] text-slate-500">
            Tek tıkla formu doldurun
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {POPULAR_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-white/5 hover:border-indigo-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                {tmpl.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {tmpl.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  ₺{tmpl.amount}/ay
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Abonelik Listesi ve Ekle Butonu */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">
              Sabit Gider Listesi
            </h3>
            <p className="text-xs text-slate-400">
              Tekrarlanan aboneliklerinizi yönetin ve ödeme günlerini takip edin
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setName('')
              setAmount('')
              setIsModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Abonelik Ekle</span>
          </button>
        </div>

        {sortedSubs.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              Kayıtlı abonelik bulunmuyor
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Yukarıdaki şablonlardan veya &quot;Abonelik Ekle&quot; butonundan ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedSubs.map((sub) => {
              const daysLeft = getDaysUntilBilling(sub.billing_day)
              const isDueSoon = daysLeft <= 3 && sub.is_active

              return (
                <div
                  key={sub.id}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                    sub.is_active
                      ? 'bg-slate-950/50 border-white/5 hover:border-indigo-500/30 hover:bg-slate-950/80'
                      : 'bg-slate-950/30 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-base">
                          {sub.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {sub.category}
                        </span>
                        {isDueSoon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {daysLeft === 0 ? 'Bugün!' : `${daysLeft} gün kaldı`}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Her ayın {sub.billing_day}. günü
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-white">
                        {formatCurrency(sub.amount, sub.currency)}
                        <span className="text-xs font-normal text-slate-400">/ay</span>
                      </div>
                    </div>

                    {/* Aktif/Pasif Butonu */}
                    <button
                      type="button"
                      onClick={() => handleToggle(sub.id, sub.is_active)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        sub.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {sub.is_active ? 'Aktif' : 'Durduruldu'}
                    </button>

                    {/* Silme */}
                    {confirmDeleteId === sub.id ? (
                      <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(sub.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 bg-slate-900/80 hover:bg-rose-500/10 border border-white/5 rounded-xl transition-all cursor-pointer"
                        title="Aboneliği Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Yeni Abonelik Modal'ı */}
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
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Yeni Abonelik Ekle
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aylık yinelenen ödeme detayları
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

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Abonelik / Hizmet Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Netflix, Kira, Spotify"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aylık Tutar (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ayın Günü (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billingDay}
                    onChange={(e) => setBillingDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                    <span>Kaydet</span>
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
