'use client'

import { useLanguage } from '@/context/LanguageContext'
import { signOutAction } from '@/app/actions/auth'
import BudgetModal from '@/components/BudgetModal'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import CurrencyToggle from '@/components/CurrencyToggle'
import { Receipt, Heart, CreditCard, PiggyBank, LogOut } from 'lucide-react'

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

  const navItems = [
    {
      href: '/',
      label: t('nav_expenses'),
      icon: null,
      isActive: currentPath === '/',
    },
    {
      href: '/wishlist',
      label: t('nav_wishlist'),
      icon: <Heart className="w-3.5 h-3.5 text-pink-500" />,
      isActive: currentPath === '/wishlist',
    },
    {
      href: '/subscriptions',
      label: t('nav_subscriptions'),
      icon: <CreditCard className="w-3.5 h-3.5 text-indigo-400" />,
      isActive: currentPath === '/subscriptions',
    },
    {
      href: '/savings',
      label: t('nav_savings'),
      icon: <PiggyBank className="w-3.5 h-3.5 text-amber-400" />,
      isActive: currentPath === '/savings',
    },
  ]

  return (
    <header className="border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Sol: Logo & Menü */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform border border-indigo-500/20">
              <img
                src="/logo.jpg"
                alt="Fisly Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Fisly
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                AI
              </span>
            </div>
          </a>

          {/* Menü Sekmeleri */}
          <nav className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
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

        {/* Sağ: Dil, Tema, Bütçe, Çıkış */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Bütçe Limitleri (Varsa) */}
          {initialBudgets && <BudgetModal initialBudgets={initialBudgets} />}

          {/* Dil Değiştirici (TR / EN) */}
          <LanguageToggle />

          {/* Para Birimi Değiştirici (TRY / USD / EUR / GBP) */}
          <CurrencyToggle />

          {/* Tema Değiştirici (Dark / Light) */}
          <ThemeToggle />

          {/* Kullanıcı / Çıkış */}
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
      </div>
    </header>
  )
}
