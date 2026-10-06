import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import { Receipt, LogOut } from 'lucide-react'
import ReceiptUploader from '@/components/ReceiptUploader'
import MonthSelector from '@/components/MonthSelector'
import SummaryCards from '@/components/SummaryCards'
import CategoryChart from '@/components/CategoryChart'
import ExpenseList, { type ExpenseItem } from '@/components/ExpenseList'
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

  // 3. Seçili aya ait harcamaları veritabanından çekme
  const { data: rawExpenses, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('purchased_at', startDate)
    .lte('purchased_at', endDate)
    .order('purchased_at', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
  }

  // 4. Görseller için 1 saatlik imzalı URL oluşturma
  const expenses: ExpenseItem[] = await Promise.all(
    (rawExpenses || []).map(async (item) => {
      let image_url: string | null = null
      if (item.image_path) {
        const { data: signedData } = await supabase.storage
          .from('receipts')
          .createSignedUrl(item.image_path, 3600) // 1 saat = 3600 sn
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Üst Navigasyon Barı */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/5">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">
                Fiş Takipçisi
              </h1>
              <p className="text-xs text-slate-400">Yapay Zeka Destekli Bütçe</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-400">Hesap</span>
              <span className="text-xs font-medium text-slate-200">
                {user.email}
              </span>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700/80 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Çıkış Yap</span>
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
            <MonthSelector selectedMonth={selectedMonth} />
          </div>
        </div>

        {/* Özet Kartları (Toplam Harcama, Fiş Sayısı, Lider Kategori) */}
        <SummaryCards
          totalAmount={totalAmount}
          expenseCount={expenseCount}
          topCategory={topCategory}
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
    </div>
  )
}
