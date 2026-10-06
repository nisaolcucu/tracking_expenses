import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor.' },
        { status: 401 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API anahtarı tanımlanmamış.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { title, price, category } = body

    if (!title || typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Geçerli ürün adı ve fiyatı giriniz.' },
        { status: 400 }
      )
    }

    // Bu ayki harcamaları topla
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const startOfMonth = `${year}-${month}-01`
    const endOfMonth = `${year}-${month}-${new Date(year, now.getMonth() + 1, 0).getDate()}`

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', user.id)
      .gte('purchased_at', startOfMonth)
      .lte('purchased_at', endOfMonth)

    let totalMonthSpent = 0
    let categorySpent = 0

    expenses?.forEach((exp) => {
      const amt = Number(exp.amount)
      totalMonthSpent += amt
      if (exp.category === category) {
        categorySpent += amt
      }
    })

    // Kullanıcının bütçe limitlerini çek
    const { data: budgetData } = await supabase
      .from('budgets')
      .select('monthly_limit')
      .eq('user_id', user.id)
      .eq('category', category)
      .single()

    const categoryLimit = budgetData ? Number(budgetData.monthly_limit) : null
    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    const remainingDays = daysInMonth - currentDay

    const newCategoryTotal = categorySpent + price
    const newMonthTotal = totalMonthSpent + price

    // OpenAI Çağrısı
    const openai = new OpenAI({ apiKey })

    const systemPrompt = `Sen kullanıcının bütçesini titizlikle koruyan, empatik, dürüst ve zeki bir Kişisel Finans Koçusun.
Kullanıcı bir ürünü satın alıp almaması gerektiğini sana danışıyor.

KULLANICININ ANLIK FİNANSAL TABLOSU:
- Danışılan Ürün: "${title}"
- Ürün Fiyatı: ₺${price.toFixed(2)}
- Kategori: ${category}
- Bu ay "${category}" kategorisinde şu ana kadar harcanan: ₺${categorySpent.toFixed(2)}
- Bu kategorideki aylık bütçe limiti: ${categoryLimit ? `₺${categoryLimit.toFixed(2)}` : 'Belirlenmemiş'}
- Bu ürünü alırsa kategorideki yeni toplam: ₺${newCategoryTotal.toFixed(2)}
- Bu ayki toplam genel harcaması: ₺${totalMonthSpent.toFixed(2)}
- Ayın ${currentDay}. günündeyiz, ay sonuna ${remainingDays} gün var.

KARAR KRİTERLERİ:
1. "decision": Mutlaka şu üçünden biri olmalı:
   - "GÜVENLİ" (Bütçe aşılmıyor, ayın gününe göre harcama dengeli)
   - "DÜŞÜNEREK AL" (Bütçenin sınırına geliniyor veya ay sonuna çok gün var)
   - "ERTELE" (Bütçe limiti aşılıyor veya ayın başındayken çok büyük bir harcama yapılıyor)
2. "reasoning": 2-3 cümlelik samimi ve sayısal verilere dayanan net analiz. (Örn: "Bu kabanı alırsan giyim bütçeni 850 TL aşacaksın...")
3. "advice": Kullanıcıya akıllı bir finansal tavsiye veya alternatif çözüm (Örn: "Önümüzdeki ayın 15'ine kadar erteleyebilirsin", "Farklı bir kategoriden kısabilirsin").

JSON Formatında döndür:
{
  "decision": "GÜVENLİ" | "DÜŞÜNEREK AL" | "ERTELE",
  "reasoning": string,
  "advice": string
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Lütfen bu harcamayı analiz et: ${title} (${price} TL, Kategori: ${category})`,
        },
      ],
      temperature: 0.2,
    })

    const parsedResult = JSON.parse(
      completion.choices[0]?.message?.content || '{}'
    )

    return NextResponse.json({
      success: true,
      data: {
        decision: parsedResult.decision || 'DÜŞÜNEREK AL',
        reasoning: parsedResult.reasoning || '',
        advice: parsedResult.advice || '',
        categorySpent,
        categoryLimit,
        price,
      },
    })
  } catch (error: any) {
    console.error('Should I buy error:', error)
    return NextResponse.json(
      { success: false, error: 'Analiz yapılırken hata oluştu.' },
      { status: 500 }
    )
  }
}
