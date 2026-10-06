import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import { Receipt, LogOut, Heart, Target, Sparkles, CreditCard, PiggyBank } from 'lucide-react'
import ReceiptUploader from '@/components/ReceiptUploader'
import MonthSelector from '@/components/MonthSelector'
import SummaryCards from '@/components/SummaryCards'
import CategoryChart from '@/components/CategoryChart'
import ExpenseList, { type ExpenseItem } from '@/components/ExpenseList'
import BudgetModal from '@/components/BudgetModal'
import BudgetProgress from '@/components/BudgetProgress'
import ShouldIBuyModal from '@/components/ShouldIBuyModal'
import { EXPENSE_CATEGORIES } from '@/lib/receipt-normalizer'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams

  // 1. Kullanıcı doğrulama
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Seçili ay hesabı (Varsayılan: şu anki ay YYYY-MM)
  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const selectedMonth = searchParams?.month || currentMonthStr

  const [yearStr, monthStr] = selectedMonth.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  // Ayın ilk ve son günü
  const lastDay = new Date(year, month, 0).getDate()
  const startDate = `${selectedMonth}-01`
  const endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`

  // 3. Harcamaları ve bütçe hedeflerini paralel çek
  const [expensesRes, budgetsRes] = await Promise.all([
    supabase
      .from('expenses')
      .select('*')
      .gte('purchased_at', startDate)
      .lte('purchased_at', endDate)
      .order('purchased_at', { ascending: false }),
    supabase
      .from('budgets')
      .select('category, monthly_limit')
      .eq('user_id', user.id),
  ])

  const rawExpenses = expensesRes.data || []
  const budgetList = budgetsRes.data || []

  const budgets: Record<string, number> = {}
  budgetList.forEach((b) => {
    budgets[b.category] = Number(b.monthly_limit)
  })

  // 4. Görseller için 1 saatlik imzalı URL oluşturma
  const expenses: ExpenseItem[] = await Promise.all(
    rawExpenses.map(async (item) => {
      let image_url: string | null = null
      if (item.image_path) {
        const { data: signedData } = await supabase.storage
          .from('receipts')
          .createSignedUrl(item.image_path, 3600)
        image_url = signedData?.signedUrl || null
      }
      return {
        ...item,
        amount: Number(item.amount),
        image_url,
      }
    })
  )

  // 5. İstatistik ve Grafik Verisi Hesaplama
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0)
  const expenseCount = expenses.length

  // Kategori bazlı toplamlar
  const categoryTotals: Record<string, number> = {}
  EXPENSE_CATEGORIES.forEach((cat) => {
    categoryTotals[cat] = 0
  })

  expenses.forEach((item) => {
    const cat = item.category || 'Diğer'
    categoryTotals[cat] = (categoryTotals[cat] || 0) + item.amount
  })

  const categoryData = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    amount: Math.round((categoryTotals[cat] || 0) * 100) / 100,
  }))

  // Günlük harcama toplamları (Takvim ısı haritası için)
  const dailyTotals: Record<string, number> = {}
  expenses.forEach((item) => {
    const dateKey = item.purchased_at
    dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + item.amount
  })

  // En çok harcanan kategori
  let topCategory: { category: string; amount: number } | null = null
  let maxCatAmount = 0
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt
      topCategory = { category: cat, amount: amt }
    }
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Arka Plan Ambient Mesh Işıkları */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 left-1/4 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Üst Navigasyon Barı */}
      <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Fiş Takipçisi
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI v2.0
                </span>
              </div>
            </div>

            {/* Menü Sekmeleri */}
            <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/5">
              <a
                href="/"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow-sm shadow-indigo-600/30 transition-all"
              >
                Harcamalar
              </a>
              <a
                href="/wishlist"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-pink-300 hover:bg-pink-500/10 font-medium text-xs transition-colors"
              >
                <Heart className="w-3.5 h-3.5 text-pink-400" />
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

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Canlı Takip Durum Hapı */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-medium shadow-[0_0_12px_rgba(16,185,129,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Canlı Takip Aktif</span>
            </div>

            {/* Bütçe Limitleri Modalı */}
            <BudgetModal initialBudgets={budgets} />

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

      {/* Ana Gösterge Paneli */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Ay Seçici */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Harcama Özeti
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Aylık fişlerinizi, harcama dağılımınızı ve bütçenizi inceleyin
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <MonthSelector
              selectedMonth={selectedMonth}
              dailyTotals={dailyTotals}
            />
          </div>
        </div>

        {/* Özet Kartları (Toplam Harcama, Fiş Sayısı, Lider Kategori) */}
        <SummaryCards
          totalAmount={totalAmount}
          expenseCount={expenseCount}
          topCategory={topCategory}
        />

        {/* Kategori Bütçe İlerleme Barları (Varsa) */}
        <BudgetProgress
          budgets={budgets}
          categoryTotals={categoryTotals}
        />

        {/* Grafik & Fiş Yükleme Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Yeni Fiş Ekleme Bileşeni */}
          <ReceiptUploader />

          {/* Kategori Bazında Çubuk Grafik */}
          <CategoryChart data={categoryData} />
        </div>

        {/* Harcama Listesi (Küçük resim, mağaza, kategori, tarih, tutar, silme) */}
        <ExpenseList expenses={expenses} />
      </main>

      {/* Sağ Altta Yüzen AI Finans Danışmanı Balonu */}
      <ShouldIBuyModal />
    </div>
  )
}
