'use client'

import { ThemeProvider } from '@/context/ThemeProvider'
import { LanguageProvider } from '@/context/LanguageContext'
import { CurrencyProvider } from '@/context/CurrencyContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>{children}</CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

