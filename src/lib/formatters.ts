/**
 * Para birimini yerel dilde (varsayılan: tr-TR) biçimlendirir.
 * Örn: 1250.5 -> "₺1.250,50" (TR) veya "₺1,250.50" (EN)
 */
export function formatCurrency(amount: number, currency = 'TRY', locale = 'tr-TR'): string {
  const resolvedLocale = locale === 'en' ? 'en-US' : locale || 'tr-TR'
  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency: currency === 'TL' ? 'TRY' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

/**
 * Tarihi yerel dilde kullanıcı dostu biçimlendirir.
 * Örn: "2026-10-06" -> "6 Ekim 2026" veya "October 6, 2026"
 */
export function formatDate(dateString: string, locale = 'tr-TR'): string {
  if (!dateString) return ''
  const resolvedLocale = locale === 'en' ? 'en-US' : locale || 'tr-TR'
  try {
    const parts = dateString.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const d = new Date(year, month, day)
      return new Intl.DateTimeFormat(resolvedLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d)
    }
    const d = new Date(dateString)
    return new Intl.DateTimeFormat(resolvedLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateString
  }
}

/**
 * YYYY-MM string'ini "Ekim 2026" veya "October 2026" gibi metne çevirir.
 */
export function formatMonthYear(yearMonth: string, locale = 'tr-TR'): string {
  const resolvedLocale = locale === 'en' ? 'en-US' : locale || 'tr-TR'
  try {
    const [year, month] = yearMonth.split('-').map((n) => parseInt(n, 10))
    const d = new Date(year, month - 1, 1)
    return new Intl.DateTimeFormat(resolvedLocale, {
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return yearMonth
  }
}

