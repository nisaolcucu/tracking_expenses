'use client'

import { useActionState, useState } from 'react'
import { loginAction, signUpAction, type AuthActionResult } from '@/app/actions/auth'
import { Receipt, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
            <Receipt className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Fiş Takipçisi
          </h1>
          <p className="text-sm text-slate-400">
            {mode === 'login'
              ? 'Harcamalarınızı ve fişlerinizi yapay zeka ile yönetin'
              : 'Yeni bir hesap oluşturup harcamalarınızı kaydetmeye başlayın'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 mb-6 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Kayıt Ol
            </button>
          </div>

          {/* Feedback Messages */}
          {activeState?.error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded-xl flex items-start gap-2.5">
              <span className="font-semibold text-rose-400 mt-0.5">•</span>
              <span>{activeState.error}</span>
            </div>
          )}

          {activeState?.success && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-xl flex items-start gap-2.5">
              <span className="font-semibold text-emerald-400 mt-0.5">✓</span>
              <span>{activeState.success}</span>
            </div>
          )}

          {/* Form */}
          <form action={currentAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ornek@eposta.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-slate-500 mt-1">En az 6 karakter olmalıdır</p>
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
                  <span>{mode === 'login' ? 'Giriş yapılıyor...' : 'Kaydediliyor...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer toggle note */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
                >
                  Kayıt Olun
                </button>
              </p>
            ) : (
              <p>
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
                >
                  Giriş Yapın
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
