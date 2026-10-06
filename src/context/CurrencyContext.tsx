'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP'

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  name: string
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
]

interface CurrencyContextType {
  currency: CurrencyCode
  currencySymbol: string
  setCurrency: (code: CurrencyCode) => void
  currencies: CurrencyConfig[]
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('TRY')

  useEffect(() => {
    const stored = localStorage.getItem('app_currency') as CurrencyCode | null
    if (stored && ['TRY', 'USD', 'EUR', 'GBP'].includes(stored)) {
      setCurrencyState(stored)
    }
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code)
    localStorage.setItem('app_currency', code)
  }

  const currentConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0]

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol: currentConfig.symbol,
        setCurrency,
        currencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
