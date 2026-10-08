'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { signOutAction } from '@/app/actions/auth'
import BudgetModal from '@/components/BudgetModal'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import CurrencyToggle from '@/components/CurrencyToggle'
import {
  Receipt,
  Heart,
  CreditCard,
  PiggyBank,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react'

interface NavbarProps {
  currentPath: '/' | '/wishlist' | '/subscriptions' | '/savings'
  initialBudgets?: Record<string, number>
  userEmail?: string
}

export default function Navbar({
  currentPath,
  initialBudgets,
  userEmail,
}: NavbarProps) {
  const { t } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Sayfa boyutu masaüstü genişliğine ulaştığında mobil menüyü otomatik kapat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Escape tuşu ile kapatma ve açıkken arka plan kaydırmayı kilitleme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const navItems = [
    {
      href: '/',
      label: t('nav_expenses'),
      icon: <Receipt className="w-4 h-4 text-indigo-500" />,
      isActive: currentPath === '/',
    },
    {
      href: '/wishlist',
      label: t('nav_wishlist'),
      icon: <Heart className="w-4 h-4 text-pink-500" />,
      isActive: currentPath === '/wishlist',
    },
    {
      href: '/subscriptions',
      label: t('nav_subscriptions'),
      icon: <CreditCard className="w-4 h-4 text-indigo-400" />,
      isActive: currentPath === '/subscriptions',
    },
    {
      href: '/savings',
      label: t('nav_savings'),
      icon: <PiggyBank className="w-4 h-4 text-amber-400" />,
      isActive: currentPath === '/savings',
    },
  ]

  return (
    <header className="border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Sol: Logo */}
        <div className="flex items-center gap-4 lg:gap-6">
          <a href="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/logo-light.png"
              alt="Lensofish"
              className="h-8 sm:h-9 w-auto dark:hidden object-contain group-hover:scale-105 transition-transform"
            />
            <img
              src="/logo-dark.png"
              alt="Lensofish"
              className="h-8 sm:h-9 w-auto hidden dark:block object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
              AI
            </span>
          </a>

          {/* Desktop Menü Sekmeleri (md ve üstü) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                  item.isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Desktop Sağ Kontroller (md ve üstü) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
          {initialBudgets && <BudgetModal initialBudgets={initialBudgets} />}
          <LanguageToggle />
          <CurrencyToggle />
          <ThemeToggle />
          <form action={signOutAction}>
            <button
              type="submit"
              className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-200/80 hover:bg-rose-500/10 dark:bg-slate-900/80 dark:hover:bg-rose-500/10 border border-slate-300 dark:border-white/5 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer shadow-sm"
              title={t('btn_signout')}
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Mobil Sağ: Tema + Hamburger Butonu (md altı) */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-indigo-500" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobil Açılır Menü / Drawer (md altı) */}
      {isMobileMenuOpen && (
        <>
          {/* Arka Plan Karartması */}
          <div
            className="fixed inset-0 top-16 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menü Paneli */}
          <div className="fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-2xl p-4 sm:p-5 space-y-4 z-50 md:hidden animate-in slide-in-from-top-2 duration-150">
            {/* Kullanıcı Bilgisi */}
            {userEmail && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t('menu_account')}
                  </p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
            )}

            {/* Navigasyon Linkleri */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 pb-1">
                {t('menu_navigation')}
              </p>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    item.isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={item.isActive ? 'text-white' : ''}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.isActive && (
                    <span className="text-[10px] font-bold uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
                      {t('menu_active')}
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* Tercihler & Araçlar */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                {t('menu_tools')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {initialBudgets && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Bütçe</span>
                    <BudgetModal initialBudgets={initialBudgets} />
                  </div>
                )}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Birim</span>
                  <CurrencyToggle />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Dil</span>
                  <LanguageToggle />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tema</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Çıkış Yap Butonu */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <form action={signOutAction} className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('btn_signout')}</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
