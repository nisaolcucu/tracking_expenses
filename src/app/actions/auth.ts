'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AuthActionResult = {
  error?: string
  success?: string
}

export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Lütfen e-posta ve şifrenizi girin.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'E-posta veya şifre hatalı.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Lütfen önce e-posta adresinizi doğrulayın.' }
    }
    return { error: error.message || 'Giriş yapılırken bir hata oluştu.' }
  }

  redirect('/')
}

export async function signUpAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Lütfen e-posta ve şifrenizi girin.' }
  }

  if (password.length < 6) {
    return { error: 'Şifre en az 6 karakter olmalıdır.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('User already registered')) {
      return { error: 'Bu e-posta adresiyle zaten bir hesap mevcut.' }
    }
    return { error: error.message || 'Kayıt işlemi başarısız oldu.' }
  }

  // Eğer oturum doğrudan açıldıysa (email confirmation kapalıysa) ana sayfaya yönlendir
  if (data?.session) {
    redirect('/')
  }

  return {
    success:
      'Hesabınız başarıyla oluşturuldu! E-posta adresinize bir onay bağlantısı gönderilmiş olabilir. Giriş yapabilirsiniz.',
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
