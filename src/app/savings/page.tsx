import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import Navbar from '@/components/Navbar'
import SavingsClient from '@/components/SavingsClient'
import ShouldIBuyModal from '@/components/ShouldIBuyModal'
import type { SavingsGoalItem } from '@/app/actions/savings'

export const dynamic = 'force-dynamic'

export default async function SavingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Birikim hedeflerini çek
  const { data: rawGoals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const goals: SavingsGoalItem[] = (rawGoals || []).map((g) => ({
    ...g,
    target_amount: Number(g.target_amount),
    current_amount: Number(g.current_amount),
  }))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-200">
      {/* Arka Plan Ambient Mesh Işıkları */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 right-1/4 w-[550px] h-[550px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 right-1/3 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Üst Navigasyon Barı */}
      <Navbar currentPath="/savings" userEmail={user.email} />

      {/* Ana İçerik */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <SavingsClient initialGoals={goals} />
      </main>

      {/* Sağ Altta Yüzen AI Finans Danışmanı Balonu */}
      <ShouldIBuyModal />
    </div>
  )
}
