import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import Navbar from '@/components/Navbar'
import WishlistClient from '@/components/WishlistClient'
import ShouldIBuyModal from '@/components/ShouldIBuyModal'
import type { WishlistItem } from '@/app/actions/wishlist'

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // İstek listesini çek
  const { data: rawItems } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fotoğraflar için imzalı URL üret
  const items: WishlistItem[] = await Promise.all(
    (rawItems || []).map(async (item) => {
      let image_url: string | null = null
      if (item.image_path) {
        const { data: signedData } = await supabase.storage
          .from('receipts')
          .createSignedUrl(item.image_path, 3600)
        image_url = signedData?.signedUrl || null
      }
      return {
        ...item,
        price: Number(item.price),
        image_url,
      }
    })
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-pink-500/30 selection:text-pink-200 transition-colors duration-200">
      {/* Arka Plan Ambient Mesh Işıkları */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 right-1/4 w-[550px] h-[550px] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 right-1/3 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Üst Navigasyon Barı */}
      <Navbar currentPath="/wishlist" userEmail={user.email} />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <WishlistClient items={items} />
      </main>

      {/* Sağ Altta Yüzen AI Finans Danışmanı Balonu */}
      <ShouldIBuyModal />
    </div>
  )
}
