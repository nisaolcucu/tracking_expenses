'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/receipt-normalizer'

export type BudgetRecord = {
  id: string
  category: ExpenseCategory
  monthly_limit: number
  currency: string
}

export async function saveBudgetAction(
  category: ExpenseCategory,
  limit: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Oturum açmanız gerekiyor.' }
  }

  if (!EXPENSE_CATEGORIES.includes(category)) {
    return { success: false, error: 'Geçersiz kategori.' }
  }

  if (limit < 0) {
    return { success: false, error: 'Limit negatif olamaz.' }
  }

  // Upsert (varsa güncelle, yoksa ekle)
  const { error } = await supabase.from('budgets').upsert(
    {
      user_id: user.id,
      category,
      monthly_limit: limit,
      currency: 'TRY',
    },
    { onConflict: 'user_id, category' }
  )

  if (error) {
    console.error('Save budget error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getBudgetsAction(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return {}

  const { data } = await supabase
    .from('budgets')
    .select('category, monthly_limit')
    .eq('user_id', user.id)

  const budgetMap: Record<string, number> = {}
  data?.forEach((b) => {
    budgetMap[b.category] = Number(b.monthly_limit)
  })

  return budgetMap
}
