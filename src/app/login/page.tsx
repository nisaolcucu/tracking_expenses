'use client'

import { useActionState, useState } from 'react'
import { loginAction, signUpAction, type AuthActionResult } from '@/app/actions/auth'
import { useLanguage } from '@/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Camera,
  PieChart,
  PiggyBank,
  Sparkles,
  Code2,
  ExternalLink,
  Info,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react'

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const { t } = useLanguage()

  const [loginState, loginFormAction, isLoginPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(loginAction, null)

  const [signupState, signupFormAction, isSignupPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signUpAction, null)

  const isPending = mode === 'login' ? isLoginPending : isSignupPending
  const activeState = mode === 'login' ? loginState : signupState
  const currentAction = mode === 'login' ? loginFormAction : signupFormAction

  const translateFeedback = (msg?: string) => {
    if (!msg) return ''
    if (msg.includes('Lütfen e-posta ve şifrenizi')) return t('auth_err_required')
    if (msg.includes('E-posta veya şifre hatalı') || msg.includes('Invalid login credentials'))
      return t('auth_err_invalid')
    if (msg.includes('Lütfen önce e-posta adresinizi') || msg.includes('Email not confirmed'))
      return t('auth_err_unconfirmed')
    if (msg.includes('Şifre en az 6') || msg.includes('at least 6 characters'))
      return t('auth_err_password_len')
    if (msg.includes('zaten bir hesap mevcut') || msg.includes('User already registered'))
      return t('auth_err_already_registered')
    if (msg.includes('Kayıt işlemi başarısız') || msg.includes('Sign up failed'))
      return t('auth_err_signup_failed')
    if (msg.includes('Hesabınız başarıyla oluşturuldu') || msg.includes('created successfully'))
      return t('auth_success_signup')
    return msg
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-indigo-950/60 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Floating Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <img
            src="/logo-light.png"
            alt="Lensofish"
            className="h-8 sm:h-9 w-auto object-contain dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="Lensofish"
            className="h-8 sm:h-9 w-auto object-contain hidden dark:block"
          />
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Split Grid */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center flex-1">
        {/* Left Column: Showcase, Features & Developer Note */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('showcase_badge')}</span>
          </div>

          {/* Headline & Description */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              {t('showcase_headline')}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {t('showcase_desc')}
            </p>
          </div>

          {/* Feature Highlights Grid (2x2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Feat 1: Receipt OCR */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {t('showcase_feat1_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('showcase_feat1_desc')}
              </p>
            </div>

            {/* Feat 2: Budgets & Insights */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {t('showcase_feat2_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('showcase_feat2_desc')}
              </p>
            </div>

            {/* Feat 3: Subscriptions & Savings */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <PiggyBank className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {t('showcase_feat3_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('showcase_feat3_desc')}
              </p>
            </div>

            {/* Feat 4: AI Coach */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {t('showcase_feat4_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('showcase_feat4_desc')}
              </p>
            </div>
          </div>

          {/* Developer Portfolio Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 dark:border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white mt-0.5 shrink-0 shadow-md shadow-indigo-600/30">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('dev_note_title')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                    {t('dev_note_badge')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                  {t('dev_note_text')}
                </p>
              </div>
            </div>
            <a
              href="https://github.com/nisaolcucu/tracking_expenses"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer shadow-md shrink-0"
            >
              <GithubIcon className="w-4 h-4" />
              <span>{t('dev_github_btn')}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
            {/* Header with Centered Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-2">
                <img
                  src="/logo-light.png"
                  alt="Lensofish Logo"
                  className="h-12 sm:h-14 w-auto object-contain dark:hidden drop-shadow-sm"
                />
                <img
                  src="/logo-dark.png"
                  alt="Lensofish Logo"
                  className="h-12 sm:h-14 w-auto object-contain hidden dark:block drop-shadow-md"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'login' ? t('auth_login_subtitle') : t('auth_signup_subtitle')}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 mb-5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm font-medium">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <LogIn className="w-4 h-4" />
                {t('auth_login_tab')}
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {t('auth_signup_tab')}
              </button>
            </div>

            {/* Signup Closed Warning Notice */}
            {mode === 'signup' && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t('signup_closed_notice')}</span>
              </div>
            )}

            {/* Feedback Messages */}
            {activeState?.error && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-sm rounded-xl flex items-start gap-2.5">
                <span className="font-semibold text-rose-500 dark:text-rose-400 mt-0.5">•</span>
                <span>{translateFeedback(activeState.error)}</span>
              </div>
            )}

            {activeState?.success && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-sm rounded-xl flex items-start gap-2.5">
                <span className="font-semibold text-emerald-500 dark:text-emerald-400 mt-0.5">✓</span>
                <span>{translateFeedback(activeState.success)}</span>
              </div>
            )}

            {/* Form */}
            <form action={currentAction} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {t('auth_email_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t('auth_email_placeholder')}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {t('auth_password_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-slate-500 mt-1">{t('auth_password_hint')}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? t('auth_logging_in') : t('auth_signing_up')}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? t('auth_login_btn') : t('auth_signup_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer toggle note */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <p>
                  {t('auth_no_account')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
                  >
                    {t('auth_signup_link')}
                  </button>
                </p>
              ) : (
                <p>
                  {t('auth_have_account')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
                  >
                    {t('auth_signin_link')}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>© {new Date().getFullYear()} Lensofish (Len$ of Fish). All rights reserved.</p>
      </footer>
    </div>
  )
}
