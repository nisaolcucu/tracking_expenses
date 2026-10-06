import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import Navbar from '@/components/Navbar'
import SubscriptionsClient from '@/components/SubscriptionsClient'
import ShouldIBuyModal from '@/components/ShouldIBuyModal'
import type { SubscriptionItem } from '@/app/actions/subscriptions'

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Kullanıcının aboneliklerini çek
  const { data: rawSubscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('billing_day', { ascending: true })

  const subscriptions: SubscriptionItem[] = (rawSubscriptions || []).map((sub) => ({
    ...sub,
    amount: Number(sub.amount),
  }))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200">
      {/* Arka Plan Ambient Mesh Işıkları */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 right-1/4 w-[550px] h-[550px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 right-1/3 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Üst Navigasyon Barı */}
      <Navbar currentPath="/subscriptions" userEmail={user.email} />

      {/* Ana İçerik */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <SubscriptionsClient initialSubscriptions={subscriptions} />
      </main>

      {/* Sağ Altta Yüzen AI Finans Danışmanı Balonu */}
      <ShouldIBuyModal />
    </div>
  )
}
