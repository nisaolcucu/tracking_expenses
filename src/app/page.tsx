import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import { Receipt, LogOut, Heart, Target, Sparkles, CreditCard, PiggyBank } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ReceiptUploader from '@/components/ReceiptUploader'
import MonthSelector from '@/components/MonthSelector'
import DashboardHeader from '@/components/DashboardHeader'
import SummaryCards from '@/components/SummaryCards'
import CategoryChart from '@/components/CategoryChart'
import ExpenseList, { type ExpenseItem } from '@/components/ExpenseList'
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200">
      {/* Arka Plan Ambient Mesh Işıkları */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[550px] h-[550px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 left-1/4 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Üst Navigasyon Barı */}
      <Navbar currentPath="/" initialBudgets={budgets} />

      {/* Ana Gösterge Paneli */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Ay Seçici */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <DashboardHeader />
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
