'use client'

import { useState } from 'react'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/receipt-normalizer'
import { formatCurrency } from '@/lib/formatters'
import {
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  MessageSquare,
  Bot,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'

interface ShouldIBuyModalProps {
  initialTitle?: string
  initialPrice?: number
  initialCategory?: ExpenseCategory
  triggerButton?: React.ReactNode
  isFloatingOnly?: boolean
}

export default function ShouldIBuyModal({
  initialTitle = '',
  initialPrice,
  initialCategory = 'Giyim',
  triggerButton,
}: ShouldIBuyModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [price, setPrice] = useState(initialPrice ? initialPrice.toString() : '')
  const [category, setCategory] = useState<ExpenseCategory>(initialCategory)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    decision: 'GÜVENLİ' | 'DÜŞÜNEREK AL' | 'ERTELE'
    reasoning: string
    advice: string
    categorySpent: number
    categoryLimit: number | null
    price: number
  } | null>(null)

  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Lütfen geçerli bir fiyat girin.')
      return
    }

    if (!title.trim()) {
      setError('Lütfen ürün veya istek adını girin.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/should-i-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          price: numPrice,
          category,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Analiz yapılamadı.')
      }

      setResult(data.data)
    } catch (err: any) {
      setError(err.message || 'Analiz sırasında bir sorun oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = () => {
    setTitle(initialTitle)
    setPrice(initialPrice ? initialPrice.toString() : '')
    setCategory(initialCategory)
    setResult(null)
    setError(null)
    setIsOpen(true)
  }

  const handleReset = () => {
    setTitle('')
    setPrice('')
    setCategory('Giyim')
    setResult(null)
    setError(null)
  }

  return (
    <>
      {/* Özel Buton (Örn: Wishlist Kartları İçin) */}
      {triggerButton ? (
        <div onClick={handleOpen}>{triggerButton}</div>
      ) : (
        /* Sağ Alt Köşede Sabit Yüzen Sohbet Balonu */
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-full shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group border border-white/20"
          title="Finans Asistanına Danış"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            Almalı mıyım? (AI)
          </span>
        </button>
      )}

      {/* Sağ Altta Açılan Sohbet Penceresi / Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 left-4 sm:left-auto z-50 sm:w-96 max-h-[82vh] flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Finans Koçu AI
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-slate-400">
                  Satın alma kararını bütçenle değerlendir
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Yeni Soru Sor"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (Scrollable) */}
          <div className="p-4 overflow-y-auto space-y-4 max-h-[calc(82vh-130px)]">
            {/* Karşılama Balonu */}
            {!result && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-300 leading-relaxed">
                  Merhaba! Almayı düşündüğün bir şey varsa söyle; bu ayki harcamalarına, kalan bütçene ve ayın gününe göre hemen analiz edeyim.
                </div>
              </div>
            )}

            {/* Analiz Formu */}
            {!result ? (
              <form onSubmit={handleAnalyze} className="space-y-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Ürün / İstek
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Zara Kaban, AirPods"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Kategori
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Bütçen taranıyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Almalı mıyım? Analiz Et</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Analiz Sonucu Kartı */
              <div className="space-y-3 animate-in fade-in duration-300">
                {/* Karar Rozeti */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    result.decision === 'GÜVENLİ'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : result.decision === 'DÜŞÜNEREK AL'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {result.decision === 'GÜVENLİ' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : result.decision === 'DÜŞÜNEREK AL' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  )}

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
                      AI Tavsiyesi
                    </span>
                    <h5 className="text-base font-extrabold">{result.decision}</h5>
                  </div>
                </div>

                {/* Gerekçe */}
                <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {result.reasoning}
                </div>

                {/* Akıllı Tavsiye */}
                {result.advice && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl text-xs text-indigo-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tavsiye:</strong> {result.advice}
                    </span>
                  </div>
                )}

                {/* Yeniden Sorma Butonu */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Başka Bir Ürün Sor</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
