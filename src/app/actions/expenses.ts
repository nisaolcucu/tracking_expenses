'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/receipt-normalizer'

export type SaveExpenseResult = {
  success?: boolean
  error?: string
}

export async function saveExpenseAction(
  formData: FormData
): Promise<SaveExpenseResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın.' }
  }

  const store = (formData.get('store') as string)?.trim() || null
  const amountStr = formData.get('amount') as string
  const currency = (formData.get('currency') as string)?.trim() || 'TRY'
  const category = (formData.get('category') as string)?.trim() as ExpenseCategory
  const purchasedAt = formData.get('purchased_at') as string
  const file = formData.get('image') as File | null

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    return { error: 'Lütfen geçerli bir harcama tutarı girin.' }
  }

  if (!EXPENSE_CATEGORIES.includes(category)) {
    return { error: 'Geçersiz kategori seçildi.' }
  }

  if (!purchasedAt) {
    return { error: 'Lütfen harcama tarihini belirtin.' }
  }

  let imagePath: string | null = null

  // Fiş görseli varsa Storage'a yükle
  if (file && file.size > 0 && file.name) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { error: 'Fiş görseli yüklenirken hata oluştu: ' + uploadError.message }
    }

    imagePath = fileName
  }

  // Veritabanına kaydet
  const { error: insertError } = await supabase.from('expenses').insert({
    user_id: user.id,
    store,
    amount,
    currency,
    category,
    purchased_at: purchasedAt,
    image_path: imagePath,
  })

  if (insertError) {
    console.error('Insert expense error:', insertError)
    // Eğer storage'a yüklenmişse geri temizleyebiliriz
    if (imagePath) {
      await supabase.storage.from('receipts').remove([imagePath])
    }
    return { error: 'Harcama kaydedilemedi: ' + insertError.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteExpenseAction(
  expenseId: string,
  imagePath?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Oturum açmanız gerekiyor.' }
    }

    // 1. Veritabanından kaydı sil
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete expense DB error:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // 2. Storage'dan fotoğrafı sil
    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from('receipts')
        .remove([imagePath])
      if (storageError) {
        console.warn('Storage file remove error:', storageError)
      }
    }

    revalidatePath('/')
    revalidatePath('/[month]', 'page')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected delete error:', err)
    return { success: false, error: err?.message || 'Silme işlemi sırasında hata oluştu.' }
  }
}
