'use client'

import { useState, useTransition } from 'react'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { deleteExpenseAction } from '@/app/actions/expenses'
import {
  Trash2,
  Calendar,
  Store,
  Tag,
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, startDeleting] = useTransition()

  const handleDelete = (id: string, imagePath: string | null) => {
    if (confirm('Bu fişi silmek istediğinize emin misiniz?')) {
      setDeletingId(id)
      startDeleting(async () => {
        await deleteExpenseAction(id, imagePath)
        setDeletingId(null)
      })
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h4 className="text-base sm:text-lg font-semibold text-white mb-1">
          Henüz Fiş Yok
        </h4>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Bu ay için kaydedilmiş herhangi bir harcama veya fiş bulunmuyor.
          Yukarıdaki alandan yeni bir fiş ekleyebilirsiniz.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-white text-base">Harcama Listesi</h3>
          <p className="text-xs text-slate-400">
            Seçili aya ait harcama kayıtları ve fiş detayları
          </p>
        </div>
        <span className="text-xs font-medium text-slate-400 px-3 py-1 bg-slate-800/80 rounded-xl">
          {expenses.length} Kayıt
        </span>
      </div>

      {/* Expense Items */}
      <div className="space-y-3">
        {expenses.map((expense) => {
          const isItemDeleting = isDeleting && deletingId === expense.id

          return (
            <div
              key={expense.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all gap-4"
            >
              {/* Sol Taraf: Görsel Önizleme ve Bilgiler */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Fiş Thumbnail */}
                {expense.image_url ? (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(expense.image_url)}
                    className="relative group w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 cursor-pointer"
                    title="Fişi Büyüt"
                  >
                    <img
                      src={expense.image_url}
                      alt="Fiş"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
                    <h4 className="font-semibold text-white text-sm sm:text-base truncate">
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
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                <div className="text-right">
                  <div className="font-bold text-white text-base sm:text-lg">
                    {formatCurrency(expense.amount, expense.currency)}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isItemDeleting}
                  onClick={() => handleDelete(expense.id, expense.image_path)}
                  className="p-2.5 text-slate-500 hover:text-rose-400 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  title="Harcamayı Sil"
                >
                  {isItemDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

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
