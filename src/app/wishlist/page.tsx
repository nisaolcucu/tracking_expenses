import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import { Receipt, LogOut, Heart, Plus, Sparkles, ArrowLeft, CreditCard, PiggyBank } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-pink-500/30 selection:text-pink-200">
      {/* Arka Plan Ambient Mesh Işıkları */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 right-1/4 w-[550px] h-[550px] bg-pink-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 right-1/3 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Üst Navigasyon Barı */}
      <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Fiş Takipçisi
                </h1>
              </div>
            </div>

            {/* Menü Sekmeleri */}
            <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/5">
              <a
                href="/"
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white font-medium text-xs transition-colors"
              >
                Harcamalar
              </a>
              <a
                href="/wishlist"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600 text-white font-medium text-xs shadow-sm shadow-pink-600/30 transition-all"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>İstek Listesi</span>
              </a>
              <a
                href="/subscriptions"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-medium text-xs transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Abonelikler</span>
              </a>
              <a
                href="/savings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 font-medium text-xs transition-colors"
              >
                <PiggyBank className="w-3.5 h-3.5 text-amber-400" />
                <span>Kumbara</span>
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-400">
              {user.email}
            </span>

            <form action={signOutAction}>
              <button
                type="submit"
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900/80 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <WishlistClient items={items} />
      </main>

      {/* Sağ Altta Yüzen AI Finans Danışmanı Balonu */}
      <ShouldIBuyModal />
    </div>
  )
}
