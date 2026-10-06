'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SubscriptionItem {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  category: string
  billing_day: number
  is_active: boolean
  created_at: string
}

export async function saveSubscriptionAction(data: {
  name: string
  amount: number
  currency?: string
  category?: string
  billing_day: number
  is_active?: boolean
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Oturum açmanız gerekiyor.' }
    }

    if (!data.name || data.name.trim() === '') {
      return { success: false, error: 'Abonelik adı boş olamaz.' }
    }

    if (isNaN(data.amount) || data.amount < 0) {
      return { success: false, error: 'Geçerli bir tutar giriniz.' }
    }

    if (!data.billing_day || data.billing_day < 1 || data.billing_day > 31) {
      return { success: false, error: 'Ödeme günü 1 ile 31 arasında olmalıdır.' }
    }

    const { data: inserted, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        name: data.name.trim(),
        amount: data.amount,
        currency: data.currency || 'TRY',
        category: data.category || 'Eğlence',
        billing_day: data.billing_day,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving subscription:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/subscriptions')
    revalidatePath('/')
    return { success: true, data: inserted }
  } catch (err: any) {
    console.error('saveSubscriptionAction exception:', err)
    return { success: false, error: err.message || 'Beklenmeyen hata.' }
  }
}

export async function toggleSubscriptionAction(id: string, is_active: boolean) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Oturum açmanız gerekiyor.' }
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error toggling subscription:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/subscriptions')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('toggleSubscriptionAction exception:', err)
    return { success: false, error: err.message || 'Beklenmeyen hata.' }
  }
}

export async function deleteSubscriptionAction(id: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Oturum açmanız gerekiyor.' }
    }

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting subscription:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/subscriptions')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('deleteSubscriptionAction exception:', err)
    return { success: false, error: err.message || 'Beklenmeyen hata.' }
  }
}
