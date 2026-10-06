import { describe, it, expect } from 'vitest'
import {
  normalizeAmount,
  normalizeDate,
  normalizeCategory,
  normalizeConfidence,
  normalizeReceiptData,
} from '@/lib/receipt-normalizer'

describe('Receipt Normalizer Tests', () => {
  describe('normalizeAmount (Tutar Normalizasyonu)', () => {
    it('virgüllü Türk para formatlarını (1.234,50) doğru sayıya çevirmelidir', () => {
      expect(normalizeAmount('1.234,50')).toBe(1234.5)
      expect(normalizeAmount('123,45 TL')).toBe(123.45)
      expect(normalizeAmount('45,90')).toBe(45.9)
      expect(normalizeAmount('₺ 850,25')).toBe(850.25)
    })

    it('standart noktalı sayıları ve float değerleri doğru işlemelidir', () => {
      expect(normalizeAmount('1234.50')).toBe(1234.5)
      expect(normalizeAmount(99.99)).toBe(99.99)
      expect(normalizeAmount('1,234.50')).toBe(1234.5)
    })

    it('geçersiz, negatif veya boş tutarlarda null dönmelidir', () => {
      expect(normalizeAmount(null)).toBeNull()
      expect(normalizeAmount(undefined)).toBeNull()
      expect(normalizeAmount('')).toBeNull()
      expect(normalizeAmount('geçersiz')).toBeNull()
      expect(normalizeAmount(-50)).toBeNull()
    })
  })

  describe('normalizeDate (Tarih Normalizasyonu)', () => {
    it('DD.MM.YYYY ve DD/MM/YYYY Türk tarih formatlarını YYYY-MM-DD formatına çevirmelidir', () => {
      expect(normalizeDate('06.10.2026')).toBe('2026-10-06')
      expect(normalizeDate('6.10.2026')).toBe('2026-10-06')
      expect(normalizeDate('24/03/2024')).toBe('2024-03-24')
    })

    it('zaten YYYY-MM-DD olan ISO formatını korumalıdır', () => {
      expect(normalizeDate('2026-10-06')).toBe('2026-10-06')
    })

    it('geçersiz veya boş tarihlerde null dönmelidir', () => {
      expect(normalizeDate(null)).toBeNull()
      expect(normalizeDate('')).toBeNull()
      expect(normalizeDate('geçersiz-tarih')).toBeNull()
    })
  })

  describe('normalizeCategory (Kategori Normalizasyonu)', () => {
    it('geçerli 8 kategoriden birini doğrudan eşlemelidir', () => {
      expect(normalizeCategory('Market')).toBe('Market')
      expect(normalizeCategory('Yeme-İçme')).toBe('Yeme-İçme')
      expect(normalizeCategory('Ulaşım')).toBe('Ulaşım')
      expect(normalizeCategory('Fatura')).toBe('Fatura')
      expect(normalizeCategory('Sağlık')).toBe('Sağlık')
      expect(normalizeCategory('Giyim')).toBe('Giyim')
      expect(normalizeCategory('Eğlence')).toBe('Eğlence')
      expect(normalizeCategory('Diğer')).toBe('Diğer')
    })

    it('küçük harf veya yakın terimleri doğru kategoriye eşlemelidir', () => {
      expect(normalizeCategory('bakkal')).toBe('Market')
      expect(normalizeCategory('restoran')).toBe('Yeme-İçme')
      expect(normalizeCategory('benzin')).toBe('Ulaşım')
      expect(normalizeCategory('eczane')).toBe('Sağlık')
      expect(normalizeCategory('elektrik')).toBe('Fatura')
      expect(normalizeCategory('ayakkabı')).toBe('Giyim')
      expect(normalizeCategory('sinema')).toBe('Eğlence')
    })

    it('geçersiz, bilinmeyen veya boş kategorilerde "Diğer" dönmelidir', () => {
      expect(normalizeCategory('Uzay Macerası')).toBe('Diğer')
      expect(normalizeCategory('')).toBe('Diğer')
      expect(normalizeCategory(null)).toBe('Diğer')
      expect(normalizeCategory(1234)).toBe('Diğer')
    })
  })

  describe('normalizeConfidence (Güven Skoru Normalizasyonu)', () => {
    it('güven skorunu 0 ile 1 arasında sınırlamalıdır', () => {
      expect(normalizeConfidence(0.85)).toBe(0.85)
      expect(normalizeConfidence(1.5)).toBe(1.0)
      expect(normalizeConfidence(-0.4)).toBe(0.0)
      expect(normalizeConfidence(null)).toBe(0.5)
    })
  })

  describe('normalizeReceiptData (Bütünleşik Fiş Yanıtı Testleri)', () => {
    it('1. Geçerli Yanıt: Tüm alanları eksiksiz normalize etmelidir', () => {
      const raw = {
        store: 'Migros Ticaret A.Ş.',
        amount: '1.450,75 TL',
        currency: 'TRY',
        purchased_at: '06.10.2026',
        category: 'Market',
        confidence: 0.95,
      }

      const result = normalizeReceiptData(raw)

      expect(result).toEqual({
        store: 'Migros Ticaret A.Ş.',
        amount: 1450.75,
        currency: 'TRY',
        purchased_at: '2026-10-06',
        category: 'Market',
        confidence: 0.95,
      })
    })

    it('2. Eksik Alanlı Yanıt: Okunamayan alanlarda null dönmeli ve değer uydurmamalıdır', () => {
      const raw = {
        store: '',
        amount: null,
        currency: null,
        purchased_at: undefined,
        category: null,
        confidence: 0.3,
      }

      const result = normalizeReceiptData(raw)

      expect(result.store).toBeNull()
      expect(result.amount).toBeNull()
      expect(result.currency).toBe('TRY')
      expect(result.purchased_at).toBeNull()
      expect(result.category).toBe('Diğer')
      expect(result.confidence).toBe(0.3)
    })

    it('3. Geçersiz Kategori: Bilinmeyen kategoriyi "Diğer" olarak düzeltmelidir', () => {
      const raw = {
        store: 'Bilinmeyen Dükkan',
        amount: 250,
        currency: 'TRY',
        purchased_at: '2026-10-06',
        category: 'RastgeleKategori123',
        confidence: 0.7,
      }

      const result = normalizeReceiptData(raw)
      expect(result.category).toBe('Diğer')
    })

    it('4. Virgüllü Tutar ve TL Sembolü: Doğru ondalık sayıya çevirmelidir', () => {
      const raw = {
        store: 'Kahve Dünyası',
        amount: '185,50',
        currency: 'TL',
        purchased_at: '2026-10-06',
        category: 'kafe',
        confidence: 0.9,
      }

      const result = normalizeReceiptData(raw)
      expect(result.amount).toBe(185.5)
      expect(result.currency).toBe('TRY')
      expect(result.category).toBe('Yeme-İçme')
    })
  })
})
