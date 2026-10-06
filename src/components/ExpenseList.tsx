'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { deleteExpenseAction } from '@/app/actions/expenses'
import {
  Trash2,
  Calendar,
  Receipt,
  Eye,
  X,
  Loader2,
  ShoppingBag,
  Coffee,
  Car,
  FileText,
  HeartPulse,
  Shirt,
  Sparkles,
  HelpCircle,
  Check,
  Search,
  Download,
  ArrowUpDown,
} from 'lucide-react'

export interface ExpenseItem {
  id: string
  user_id: string
  store: string | null
  amount: number
  currency: string
  category: string
  purchased_at: string
  image_path: string | null
  image_url: string | null // 1 saatlik imzalı URL
  created_at: string
}

interface ExpenseListProps {
  expenses: ExpenseItem[]
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Market: <ShoppingBag className="w-3.5 h-3.5" />,
  'Yeme-İçme': <Coffee className="w-3.5 h-3.5" />,
  Ulaşım: <Car className="w-3.5 h-3.5" />,
  Fatura: <FileText className="w-3.5 h-3.5" />,
  Sağlık: <HeartPulse className="w-3.5 h-3.5" />,
  Giyim: <Shirt className="w-3.5 h-3.5" />,
  Eğlence: <Sparkles className="w-3.5 h-3.5" />,
  Diğer: <HelpCircle className="w-3.5 h-3.5" />,
}

const CATEGORY_BADGES: Record<string, string> = {
  Market: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Yeme-İçme': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Ulaşım: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Fatura: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Sağlık: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Giyim: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Eğlence: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Diğer: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const router = useRouter()
  const [items, setItems] = useState<ExpenseItem[]>(expenses)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'date-desc' | 'amount-desc' | 'amount-asc'>('date-desc')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, startDeleting] = useTransition()

  // Props güncellendiğinde yerel listeyi güncelle
  useEffect(() => {
    setItems(expenses)
  }, [expenses])

  const executeDelete = (id: string, imagePath: string | null) => {
    setDeletingId(id)
    setConfirmDeleteId(null)

    startDeleting(async () => {
      const res = await deleteExpenseAction(id, imagePath)
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== id))
        router.refresh()
      } else {
        alert(res.error || 'Silme işlemi gerçekleştirilemedi.')
      }
      setDeletingId(null)
    })
  }

  // Filtreleme ve Sıralama
  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        !searchQuery ||
        (item.store && item.store.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'amount-desc') return b.amount - a.amount
      if (sortBy === 'amount-asc') return a.amount - b.amount
      return new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
    })

  // CSV Dışa Aktarma
  const handleExportCSV = () => {
    if (filteredItems.length === 0) return

    const headers = ['İşletme / Mağaza', 'Kategori', 'Tarih', 'Tutar', 'Para Birimi']
    const rows = filteredItems.map((item) => [
      `"${(item.store || 'Bilinmiyor').replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.purchased_at,
      item.amount.toFixed(2),
      item.currency,
    ])

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `harcamalar-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (items.length === 0) {
    return (
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-white mb-1">
          Henüz Fiş Eklenmedi
        </h4>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Bu ay için onaylanan bir harcama bulunmuyor. Yukarıdan ilk fişinizi yükleyerek başlayabilirsiniz.
        </p>
      </div>
    )
  }

  const uniqueCategories = Array.from(new Set(items.map((i) => i.category)))

  return (
    <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
      {/* Başlık ve Kontroller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
            Harcama Detayları
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredItems.length} / {items.length} Fiş
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Seçili aya ait harcamalarınızı arayın, filtreleyin ve dışa aktarın
          </p>
        </div>

        {/* CSV Dışa Aktarma Butonu */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all cursor-pointer shadow-sm hover:border-slate-600"
          title="Filtrelenmiş harcamaları CSV / Excel dosyası olarak indir"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Excel / CSV İndir</span>
        </button>
      </div>

      {/* Arama, Kategori Filtreleme ve Sıralama Barı */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Arama Girişi */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İşletme veya mağaza ara (örn: Migros)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sıralama Seçici */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="date-desc">En Yeni Tarih</option>
              <option value="amount-desc">En Yüksek Tutar</option>
              <option value="amount-asc">En Düşük Tutar</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Kategori Filtre Hapları */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-950/50 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
          }`}
        >
          Tümü ({items.length})
        </button>
        {uniqueCategories.map((cat) => {
          const count = items.filter((i) => i.category === cat).length
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/50 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {CATEGORY_ICONS[cat]}
              <span>{cat}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Expense Items */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
          Arama kriterlerinize uygun harcama kaydı bulunamadı.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((expense) => {
            const isItemDeleting = isDeleting && deletingId === expense.id
            const isConfirming = confirmDeleteId === expense.id

            return (
              <div
                key={expense.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-950/80 transition-all duration-200 gap-4"
              >
                {/* Sol Taraf: Görsel Önizleme ve Bilgiler */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Fiş Thumbnail */}
                  {expense.image_url ? (
                    <button
                      type="button"
                      onClick={() => setSelectedImage(expense.image_url)}
                      className="relative group/thumb w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 cursor-pointer"
                      title="Fişi Büyüt"
                    >
                      <img
                        src={expense.image_url}
                        alt="Fiş"
                        className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                      <Receipt className="w-6 h-6" />
                    </div>
                  )}

                  {/* Başlık, Kategori, Tarih */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm sm:text-base truncate group-hover:text-indigo-200 transition-colors">
                        {expense.store || 'İşletme Belirtilmemiş'}
                      </h4>

                      {/* Kategori Rozeti */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border ${
                          CATEGORY_BADGES[expense.category] ||
                          CATEGORY_BADGES['Diğer']
                        }`}
                      >
                        {CATEGORY_ICONS[expense.category] ||
                          CATEGORY_ICONS['Diğer']}
                        <span>{expense.category}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(expense.purchased_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf: Tutar ve Sil Butonu */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                  <div className="text-right">
                    <div className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                      {formatCurrency(expense.amount, expense.currency)}
                    </div>
                  </div>

                  {/* Silme Onay Butonları */}
                  {isConfirming ? (
                    <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl">
                      <span className="text-[11px] text-rose-300 font-medium px-1.5">
                        Silinsin mi?
                      </span>
                      <button
                        type="button"
                        onClick={() => executeDelete(expense.id, expense.image_path)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
                        title="Onayla ve Sil"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Vazgeç"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isItemDeleting}
                      onClick={() => setConfirmDeleteId(expense.id)}
                      className="p-2.5 text-slate-500 hover:text-rose-400 bg-slate-900/80 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      title="Harcamayı Sil"
                    >
                      {isItemDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Büyütülmüş Fiş Görsel Modalı */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Fiş Tam Görünüm"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
