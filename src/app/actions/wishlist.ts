'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/receipt-normalizer'

export type WishlistItem = {
  id: string
  user_id: string
  title: string
  price: number
  currency: string
  category: ExpenseCategory
  image_path: string | null
  image_url?: string | null
  priority: 'Yüksek' | 'Orta' | 'Düşük'
  is_purchased: boolean
  notes: string | null
  created_at: string
}

export async function saveWishlistItemAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Oturum açmanız gerekiyor.' }
  }

  const title = (formData.get('title') as string)?.trim()
  const priceStr = formData.get('price') as string
  const category = (formData.get('category') as string)?.trim() as ExpenseCategory
  const priority = (formData.get('priority') as string)?.trim() as 'Yüksek' | 'Orta' | 'Düşük'
  const notes = (formData.get('notes') as string)?.trim() || null
  const file = formData.get('image') as File | null

  if (!title) {
    return { success: false, error: 'Lütfen ürün veya istek adını girin.' }
  }

  const price = parseFloat(priceStr)
  if (isNaN(price) || price < 0) {
    return { success: false, error: 'Lütfen geçerli bir fiyat girin.' }
  }

  if (!EXPENSE_CATEGORIES.includes(category)) {
    return { success: false, error: 'Geçersiz kategori.' }
  }

  let imagePath: string | null = null

  if (file && file.size > 0 && file.name) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${user.id}/wishlist-${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
      })

    if (!uploadError) {
      imagePath = fileName
    }
  }

  const { error: insertError } = await supabase.from('wishlist').insert({
    user_id: user.id,
    title,
    price,
    currency: 'TRY',
    category,
    image_path: imagePath,
    priority: priority || 'Orta',
    is_purchased: false,
    notes,
  })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath('/wishlist')
  return { success: true }
}

export async function deleteWishlistItemAction(
  id: string,
  imagePath?: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Oturum açmanız gerekiyor.' }
  }

  const { error: deleteError } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  if (imagePath) {
    await supabase.storage.from('receipts').remove([imagePath])
  }

  revalidatePath('/wishlist')
  return { success: true }
}

export async function markWishlistPurchasedAction(
  item: WishlistItem,
  addToExpenses = true
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Oturum açmanız gerekiyor.' }
  }

  // İstek listesinde satın alındı olarak işaretle
  const { error: updateError } = await supabase
    .from('wishlist')
    .update({ is_purchased: true })
    .eq('id', item.id)
    .eq('user_id', user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Otomatik olarak harcamalara da ekle
  if (addToExpenses) {
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('expenses').insert({
      user_id: user.id,
      store: item.title,
      amount: item.price,
      currency: item.currency || 'TRY',
      category: item.category,
      purchased_at: today,
      image_path: item.image_path,
    })
  }

  revalidatePath('/wishlist')
  revalidatePath('/')
  return { success: true }
}
