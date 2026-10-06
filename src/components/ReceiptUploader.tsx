'use client'

import { useState, useRef, useTransition } from 'react'
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  type ParsedReceiptData,
} from '@/lib/receipt-normalizer'
import { saveExpenseAction } from '@/app/actions/expenses'
import {
  Camera,
  UploadCloud,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Store,
  Tag,
  DollarSign,
  X,
  Sparkles,
} from 'lucide-react'

interface ReceiptUploaderProps {
  onSuccess?: () => void
}

export default function ReceiptUploader({ onSuccess }: ReceiptUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Kamera Modal Durumu
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Durumlar
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)

  // Form Değerleri
  const [store, setStore] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('TRY')
  const [category, setCategory] = useState<ExpenseCategory>('Market')
  const [purchasedAt, setPurchasedAt] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Kaydetme işlemi
  const [isSaving, startSaving] = useTransition()
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileCameraInputRef = useRef<HTMLInputElement>(null)

  // Canlı Kamerayı Başlat
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false,
      })
      setCameraStream(stream)
      setIsCameraOpen(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (err) {
      console.warn('Webcam açılamadı, alternatif dosya kamerasına geçiliyor:', err)
      // Kamera izni verilmezse veya webcam yoksa yerel dosya kamerasına yönlendir
      mobileCameraInputRef.current?.click()
    }
  }

  // Canlı Kamerayı Kapat
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setIsCameraOpen(false)
  }

  // Fotoğrafı Çek ve Fiş Olarak Yükle
  const capturePhoto = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const capturedFile = new File([blob], `fis-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            })
            stopCamera()
            handleFileSelect(capturedFile)
          }
        },
        'image/jpeg',
        0.92
      )
    }
  }

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    setParseError(null)
    setSaveMessage(null)
    setConfidence(null)

    // Yapay zeka ile okuma API'sini çağır
    setIsParsing(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            'Fiş okunamadı. Lütfen alanları manuel olarak doldurun.'
        )
      }

      const data: ParsedReceiptData = result.data

      if (data.store) setStore(data.store)
      if (data.amount !== null) setAmount(data.amount.toString())
      if (data.currency) setCurrency(data.currency)
      if (data.category) setCategory(data.category)
      if (data.purchased_at) setPurchasedAt(data.purchased_at)
      if (typeof data.confidence === 'number') setConfidence(data.confidence)
    } catch (err: any) {
      console.error(err)
      setParseError(
        err.message ||
          'Yapay zeka okuma sırasında bir sorun oluştu. Bilgileri elle doldurabilirsiniz.'
      )
    } finally {
      setIsParsing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleReset = () => {
    stopCamera()
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setStore('')
    setAmount('')
    setCategory('Market')
    setPurchasedAt(new Date().toISOString().split('T')[0])
    setConfidence(null)
    setParseError(null)
    setSaveMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveMessage(null)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setSaveMessage({
        type: 'error',
        text: 'Lütfen geçerli bir harcama tutarı girin.',
      })
      return
    }

    startSaving(async () => {
      const formData = new FormData()
      if (file) formData.append('image', file)
      formData.append('store', store)
      formData.append('amount', amount)
      formData.append('currency', currency)
      formData.append('category', category)
      formData.append('purchased_at', purchasedAt)

      const res = await saveExpenseAction(formData)

      if (res.error) {
        setSaveMessage({ type: 'error', text: res.error })
      } else {
        setSaveMessage({
          type: 'success',
          text: 'Fiş ve harcama başarıyla kaydedildi!',
        })
        setTimeout(() => {
          handleReset()
          if (onSuccess) onSuccess()
        }, 1200)
      }
    })
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Yeni Fiş Ekle</h3>
            <p className="text-xs text-slate-400">
              Yapay zeka ile tara veya elle gir
            </p>
          </div>
        </div>

        {file && (
          <button
            type="button"
            onClick={handleReset}
            className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
            title="Formu Temizle"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Canlı Kamera Modalı */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between p-4 border-b border-slate-800">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                Fişi Hizalayın ve Çekin
              </span>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport with guides */}
            <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Vizör Kılavuz Çizgileri */}
              <div className="absolute inset-6 border-2 border-dashed border-indigo-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] font-medium bg-slate-950/80 px-2.5 py-1 rounded-full text-indigo-300">
                  Fişi bu karenin içine yerleştirin
                </span>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="w-full p-4 flex items-center justify-center gap-4 bg-slate-950/80">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-2xl shadow-lg shadow-indigo-600/40 cursor-pointer active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Fotoğrafı Çek</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone if no file */}
      {!file && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Kamera Butonu (Canlı Webcam veya Mobil Kamera) */}
          <button
            type="button"
            onClick={startCamera}
            className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-white">Fotoğraf Çek</span>
            <span className="text-xs text-slate-400 mt-0.5">
              Kamerayı açarak fişi canlı tara
            </span>
          </button>

          {/* Dosya Seç Butonu */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-750 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-white">Görsel Yükle</span>
            <span className="text-xs text-slate-400 mt-0.5">
              Galeriden veya bilgisayardan seç
            </span>
          </button>
        </div>
      )}

      {/* Selected File & Preview State */}
      {file && (
        <div className="mb-6 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center gap-4">
          {previewUrl && (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0">
              <img
                src={previewUrl}
                alt="Fiş Önizleme"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {file.name}
            </p>
            <p className="text-[11px] text-slate-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>

            {isParsing && (
              <div className="flex items-center gap-2 mt-2 text-indigo-400 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Fiş okunuyor... (GPT-4o-mini)</span>
              </div>
            )}

            {!isParsing && confidence !== null && (
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                    confidence >= 0.6
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  Güven Skoru: %{Math.round(confidence * 100)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Low Confidence Warning (< 0.6) */}
      {!isParsing && confidence !== null && confidence < 0.6 && (
        <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <span>
            <strong>Lütfen değerleri kontrol et:</strong> Fiş görseli tam net
            okunamamış olabilir. Alanları doğrulayıp eksik yerleri düzeltiniz.
          </span>
        </div>
      )}

      {/* Parse Error Notification (Manual fallback) */}
      {parseError && (
        <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Otomatik okuma tamamlanamadı:</span>{' '}
            {parseError}
            <p className="mt-1 text-slate-400">
              Fiş bilgilerini aşağıdaki forma elle girerek kaydetmeye devam
              edebilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* Save Result Notification */}
      {saveMessage && (
        <div
          className={`mb-5 p-3.5 text-xs rounded-xl flex items-start gap-2.5 ${
            saveMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Editable Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Store Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Mağaza / İşletme Adı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Store className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="Örn: Migros, Shell, Kafe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Amount & Currency */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Toplam Tutar (KDV Dahil) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-16 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                {currency}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Kategori *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchased Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Harcama Tarihi *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={purchasedAt}
                onChange={(e) => setPurchasedAt(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving || isParsing}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Harcamayı Kaydet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
