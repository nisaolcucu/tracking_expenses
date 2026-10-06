'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import {
  saveWishlistItemAction,
  deleteWishlistItemAction,
  markWishlistPurchasedAction,
  type WishlistItem,
} from '@/app/actions/wishlist'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/receipt-normalizer'
import { formatCurrency } from '@/lib/formatters'
import ShouldIBuyModal from '@/components/ShouldIBuyModal'
import {
  Plus,
  Heart,
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Loader2,
  X,
  Tag,
  Clock,
  Check,
  ShoppingBag,
} from 'lucide-react'

interface WishlistClientProps {
  items: WishlistItem[]
}

const PRIORITY_BADGES = {
  Yüksek: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30',
  Orta: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
  Düşük: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30',
}

export default function WishlistClient({ items: initialItems }: WishlistClientProps) {
  const router = useRouter()
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-US' : 'tr-TR'
  const [items, setItems] = useState<WishlistItem[]>(initialItems)
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('pending')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('Giyim')
  const [priority, setPriority] = useState<'Yüksek' | 'Orta' | 'Düşük'>('Orta')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [isSaving, startSaving] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setPhoto(f)
      setPhotoPreview(URL.createObjectURL(f))
    }
  }

  const handleResetForm = () => {
    setTitle('')
    setPrice('')
    setCategory('Giyim')
    setPriority('Orta')
    setNotes('')
    setPhoto(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    setIsModalOpen(false)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    startSaving(async () => {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('priority', priority)
      if (notes) formData.append('notes', notes)
      if (photo) formData.append('image', photo)

      const res = await saveWishlistItemAction(formData)
      if (res.success) {
        handleResetForm()
        router.refresh()
      } else {
        alert(res.error || 'Kaydedilemedi.')
      }
    })
  }

  const handleDelete = (id: string, imagePath: string | null) => {
    if (confirm('Bu isteği listeden silmek istediğinize emin misiniz?')) {
      setActionId(id)
      startSaving(async () => {
        await deleteWishlistItemAction(id, imagePath)
        setItems((prev) => prev.filter((it) => it.id !== id))
        setActionId(null)
        router.refresh()
      })
    }
  }

  const handleMarkPurchased = (item: WishlistItem) => {
    setActionId(item.id)
    startSaving(async () => {
      await markWishlistPurchasedAction(item, true)
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_purchased: true } : it))
      )
      setActionId(null)
      router.refresh()
    })
  }

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return !item.is_purchased
    if (filter === 'purchased') return item.is_purchased
    return true
  })

  const getPriorityLabel = (pri: 'Yüksek' | 'Orta' | 'Düşük') => {
    if (pri === 'Yüksek') return t('priority_high')
    if (pri === 'Düşük') return t('priority_low')
    return t('priority_medium')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-pink-50/90 via-white to-pink-100/40 dark:from-pink-950/40 dark:via-slate-900/80 dark:to-slate-900/40 border border-pink-200/80 dark:border-pink-500/20 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-600 dark:text-pink-400 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('wishlist_banner_badge')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('wishlist_banner_title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mt-1">
            {t('wishlist_banner_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ShouldIBuyModal
            triggerButton={
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/30 rounded-2xl text-xs font-semibold shadow-sm dark:shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>{t('wishlist_quick_ai')}</span>
              </button>
            }
          />

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-pink-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('wishlist_add_btn')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('filter_pending')} ({items.filter((i) => !i.is_purchased).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('purchased')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === 'purchased'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('filter_purchased')} ({items.filter((i) => i.is_purchased).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('filter_all')} ({items.length})
          </button>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white/85 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            {t('wishlist_no_items')}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {t('wishlist_no_items_desc')}
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-medium cursor-pointer"
          >
            {t('first_wish_btn')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                item.is_purchased
                  ? 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-800/60 opacity-75'
                  : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-pink-500/40 dark:hover:border-slate-700 shadow-md'
              }`}
            >
              <div>
                {/* Photo or Placeholder */}
                {item.image_url ? (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4">
                    <ShoppingBag className="w-8 h-8 opacity-40" />
                  </div>
                )}

                {/* Priority & Category Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border ${
                      PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.Orta
                    }`}
                  >
                    {getPriorityLabel(item.priority)} {t('priority_suffix')}
                  </span>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {t(`cat_${item.category}`) || item.category}
                  </span>
                </div>

                {/* Title & Price */}
                <h3 className="font-bold text-slate-900 dark:text-white text-base truncate mb-1">
                  {item.title}
                </h3>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {formatCurrency(item.price, item.currency, locale)}
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                {!item.is_purchased ? (
                  <>
                    <ShouldIBuyModal
                      initialTitle={item.title}
                      initialPrice={item.price}
                      initialCategory={item.category}
                      triggerButton={
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 dark:bg-indigo-600/10 dark:hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          <span>{t('should_i_buy_btn')}</span>
                        </button>
                      }
                    />

                    <button
                      type="button"
                      disabled={actionId === item.id}
                      onClick={() => handleMarkPurchased(item)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
                      title={language === 'en' ? 'Mark as purchased and add to monthly expenses' : 'Satın alındı olarak işaretle ve bu ayki harcamalara ekle'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('mark_as_purchased')}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('purchased_badge')}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.image_path)}
                  className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 bg-slate-50 hover:bg-rose-50 dark:bg-slate-950/60 dark:hover:bg-rose-500/10 border border-slate-200 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-500/30 rounded-xl transition-colors cursor-pointer"
                  title={language === 'en' ? 'Delete' : 'Sil'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Wishlist Item Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('new_wish_modal_title')}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="my-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t('item_title_label')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'e.g. Winter Coat, Dyson Vacuum' : 'Örn: Zara Kaban, Dyson Süpürge'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t('estimated_price_label')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t('category_label')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {t(`cat_${cat}`) || cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t('priority_suffix')}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as 'Yüksek' | 'Orta' | 'Düşük')
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer"
                  >
                    <option value="Yüksek" className="bg-white dark:bg-slate-900">🔴 {t('priority_high')} ({language === 'en' ? 'Urgent' : 'Acil'})</option>
                    <option value="Orta" className="bg-white dark:bg-slate-900">🟡 {t('priority_medium')}</option>
                    <option value="Düşük" className="bg-white dark:bg-slate-900">🟢 {t('priority_low')} ({language === 'en' ? 'Optional' : 'Olsa da olur'})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t('photo_label')}
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                    <span>{photo ? t('change_photo') : t('choose_photo')}</span>
                  </button>
                </div>
              </div>

              {photoPreview && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t('notes_label')}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'en' ? 'Buy during holiday sales...' : 'İndirime girdiğinde alacağım...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  {t('cancel_btn')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-pink-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t('save_wish_btn')}</span>
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
