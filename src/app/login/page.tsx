'use client'

import { useActionState, useState } from 'react'
import { loginAction, signUpAction, type AuthActionResult } from '@/app/actions/auth'
import { useLanguage } from '@/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react'

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
    if (msg.includes('E-posta veya şifre hatalı') || msg.includes('Invalid login credentials')) return t('auth_err_invalid')
    if (msg.includes('Lütfen önce e-posta adresinizi') || msg.includes('Email not confirmed')) return t('auth_err_unconfirmed')
    if (msg.includes('Şifre en az 6') || msg.includes('at least 6 characters')) return t('auth_err_password_len')
    if (msg.includes('zaten bir hesap mevcut') || msg.includes('User already registered')) return t('auth_err_already_registered')
    if (msg.includes('Kayıt işlemi başarısız') || msg.includes('Sign up failed')) return t('auth_err_signup_failed')
    if (msg.includes('Hesabınız başarıyla oluşturuldu') || msg.includes('created successfully')) return t('auth_success_signup')
    return msg
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-4 sm:p-6 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Floating Controls */}
      <header className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2 z-20">
        <LanguageToggle />
        <ThemeToggle />
      </header>

      <div className="w-full max-w-md pt-8 sm:pt-0">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/logo-light.png"
              alt="Lensofish Logo"
              className="h-16 sm:h-20 w-auto object-contain dark:hidden drop-shadow-sm"
            />
            <img
              src="/logo-dark.png"
              alt="Lensofish Logo"
              className="h-16 sm:h-20 w-auto object-contain hidden dark:block drop-shadow-md"
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login'
              ? t('auth_login_subtitle')
              : t('auth_signup_subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/40">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
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
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {t('auth_signup_tab')}
            </button>
          </div>

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
                <p className="text-xs text-slate-500 mt-1">
                  {t('auth_password_hint')}
                </p>
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
                  <span>
                    {mode === 'login' ? t('auth_logging_in') : t('auth_signing_up')}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' ? t('auth_login_btn') : t('auth_signup_btn')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer toggle note */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
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
    </div>
  )
}
