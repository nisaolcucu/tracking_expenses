'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SavingsGoalItem {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  currency: string
  target_date: string | null
  color: string
  created_at: string
}

export async function saveSavingsGoalAction(data: {
  title: string
  target_amount: number
  current_amount?: number
  currency?: string
  target_date?: string | null
  color?: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Oturum açmanız gerekiyor.' }
    }

    if (!data.title || data.title.trim() === '') {
      return { success: false, error: 'Hedef başlığı boş olamaz.' }
    }

    if (isNaN(data.target_amount) || data.target_amount <= 0) {
      return { success: false, error: 'Geçerli bir hedef tutar giriniz.' }
    }

    const currentAmount = data.current_amount || 0
    if (isNaN(currentAmount) || currentAmount < 0) {
      return { success: false, error: 'Mevcut birikim negatif olamaz.' }
    }

    const { data: inserted, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: user.id,
        title: data.title.trim(),
        target_amount: data.target_amount,
        current_amount: currentAmount,
        currency: data.currency || 'TRY',
        target_date: data.target_date || null,
        color: data.color || '#6366f1',
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving savings goal:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/savings')
    revalidatePath('/')
    return { success: true, data: inserted }
  } catch (err: any) {
    console.error('saveSavingsGoalAction exception:', err)
    return { success: false, error: err.message || 'Beklenmeyen hata.' }
  }
}

export async function addMoneyToSavingsAction(id: string, amountToAdd: number) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Oturum açmanız gerekiyor.' }
    }

    if (isNaN(amountToAdd) || amountToAdd === 0) {
      return { success: false, error: 'Geçerli bir tutar giriniz.' }
    }

    // Mevcut tutarı çek
    const { data: existing, error: fetchErr } = await supabase
      .from('savings_goals')
      .select('current_amount')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !existing) {
      return { success: false, error: 'Hedef bulunamadı.' }
    }

    const newAmount = Math.max(0, Number(existing.current_amount) + amountToAdd)

    const { error: updateErr } = await supabase
      .from('savings_goals')
      .update({ current_amount: newAmount })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    revalidatePath('/savings')
    revalidatePath('/')
    return { success: true, newAmount }
  } catch (err: any) {
    console.error('addMoneyToSavingsAction exception:', err)
    return { success: false, error: err.message || 'Beklenmeyen hata.' }
  }
}

export async function deleteSavingsGoalAction(id: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Oturum açmanız gerekiyor.' }
    }

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting savings goal:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/savings')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('deleteSavingsGoalAction exception:', err)
    return { success: false, error: err.message || 'Beklenmeyen hata.' }
  }
}
