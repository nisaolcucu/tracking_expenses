export const EXPENSE_CATEGORIES = [
  'Market',
  'Yeme-İçme',
  'Ulaşım',
  'Fatura',
  'Sağlık',
  'Giyim',
  'Eğlence',
  'Diğer',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export interface ParsedReceiptData {
  store: string | null
  amount: number | null
  currency: string
  purchased_at: string | null // YYYY-MM-DD
  category: ExpenseCategory
  confidence: number // 0.0 - 1.0
}

/**
 * Türk fişlerindeki ve farklı sayısal formatlardaki tutarları normalize eder.
 * Örn: "1.234,50" -> 1234.50 | "123,45 TL" -> 123.45 | 45.5 -> 45.50
 */
export function normalizeAmount(value: unknown): number | null {
  if (value === null || value === undefined) return null

  if (typeof value === 'number') {
    if (isNaN(value) || value < 0) return null
    return Math.round(value * 100) / 100
  }

  if (typeof value === 'string') {
    let clean = value.trim()
    // Para birimi sembollerini ve gereksiz karakterleri temizle
    clean = clean.replace(/[^\d.,]/g, '')
    if (!clean) return null

    // "1.234,50" formatı: Nokta binlik, virgül ondalık
    if (clean.includes('.') && clean.includes(',')) {
      if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.')
      } else {
        // "1,234.50" formatı
        clean = clean.replace(/,/g, '')
      }
    } else if (clean.includes(',')) {
      // Sadece virgül var: "123,45" -> "123.45"
      clean = clean.replace(',', '.')
    }

    const num = parseFloat(clean)
    if (isNaN(num) || num < 0) return null
    return Math.round(num * 100) / 100
  }

  return null
}

/**
 * Tarih alanını YYYY-MM-DD formatına dönüştürür ve doğrular.
 * Örn: "24.03.2024", "2024-03-24", "24/03/2024"
 */
export function normalizeDate(value: unknown): string | null {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()

  // YYYY-MM-DD kontrolü
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10)
    const month = String(parseInt(isoMatch[2], 10)).padStart(2, '0')
    const day = String(parseInt(isoMatch[3], 10)).padStart(2, '0')
    const dateObj = new Date(`${year}-${month}-${day}`)
    if (!isNaN(dateObj.getTime())) {
      return `${year}-${month}-${day}`
    }
  }

  // DD.MM.YYYY veya DD/MM/YYYY kontrolü
  const trMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (trMatch) {
    const day = String(parseInt(trMatch[1], 10)).padStart(2, '0')
    const month = String(parseInt(trMatch[2], 10)).padStart(2, '0')
    const year = parseInt(trMatch[3], 10)
    const dateObj = new Date(`${year}-${month}-${day}`)
    if (!isNaN(dateObj.getTime())) {
      return `${year}-${month}-${day}`
    }
  }

  return null
}

/**
 * Kategoriyi geçerli 8 kategoriden birine eşler, bulamazsa "Diğer" döner.
 */
export function normalizeCategory(value: unknown): ExpenseCategory {
  if (!value || typeof value !== 'string') return 'Diğer'

  const normalized = value.trim().toLowerCase()

  const mapping: Record<string, ExpenseCategory> = {
    market: 'Market',
    bakkal: 'Market',
    süpermarket: 'Market',
    supermarket: 'Market',
    gıda: 'Market',
    'yeme-içme': 'Yeme-İçme',
    'yeme içme': 'Yeme-İçme',
    restoran: 'Yeme-İçme',
    kafe: 'Yeme-İçme',
    cafe: 'Yeme-İçme',
    yemek: 'Yeme-İçme',
    lokanta: 'Yeme-İçme',
    ulaşım: 'Ulaşım',
    ulasim: 'Ulaşım',
    benzin: 'Ulaşım',
    akaryakıt: 'Ulaşım',
    taksi: 'Ulaşım',
    otobüs: 'Ulaşım',
    fatura: 'Fatura',
    elektrik: 'Fatura',
    su: 'Fatura',
    doğalgaz: 'Fatura',
    internet: 'Fatura',
    sağlık: 'Sağlık',
    saglik: 'Sağlık',
    eczane: 'Sağlık',
    hastane: 'Sağlık',
    giyim: 'Giyim',
    tekstil: 'Giyim',
    ayakkabı: 'Giyim',
    mağaza: 'Giyim',
    eğlence: 'Eğlence',
    eglence: 'Eğlence',
    sinema: 'Eğlence',
    tiyatro: 'Eğlence',
    konser: 'Eğlence',
    diğer: 'Diğer',
    diger: 'Diğer',
  }

  // Birebir eşleşme
  for (const cat of EXPENSE_CATEGORIES) {
    if (cat.toLowerCase() === normalized) {
      return cat
    }
  }

  return mapping[normalized] || 'Diğer'
}

/**
 * Güven skorunu 0.0 ile 1.0 arasında sınırlar.
 */
export function normalizeConfidence(value: unknown): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return Math.max(0, Math.min(1, Math.round(value * 100) / 100))
  }
  return 0.5
}

/**
 * Modelden gelen ham JSON verisini doğrular ve temizler.
 */
export function normalizeReceiptData(raw: any): ParsedReceiptData {
  if (!raw || typeof raw !== 'object') {
    return {
      store: null,
      amount: null,
      currency: 'TRY',
      purchased_at: null,
      category: 'Diğer',
      confidence: 0,
    }
  }

  const store =
    typeof raw.store === 'string' && raw.store.trim().length > 0
      ? raw.store.trim()
      : null

  const currency =
    typeof raw.currency === 'string' && raw.currency.trim().length > 0
      ? raw.currency.trim().toUpperCase()
      : 'TRY'

  return {
    store,
    amount: normalizeAmount(raw.amount),
    currency: currency === 'TL' ? 'TRY' : currency,
    purchased_at: normalizeDate(raw.purchased_at),
    category: normalizeCategory(raw.category),
    confidence: normalizeConfidence(raw.confidence),
  }
}
