import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { normalizeReceiptData } from '@/lib/receipt-normalizer'

export async function POST(request: NextRequest) {
  try {
    // 1. Kullanıcı oturum kontrolü
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi yapmak için giriş yapmalısınız.' },
        { status: 401 }
      )
    }

    // 2. OpenAI API anahtarı kontrolü
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'OpenAI API anahtarı (.env.local içinde OPENAI_API_KEY) tanımlanmamış.',
        },
        { status: 500 }
      )
    }

    // 3. Görsel dosyasını form verisinden alma
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Lütfen bir fiş görseli seçin.' },
        { status: 400 }
      )
    }

    // Dosyayı base64 formatına çevirme
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = file.type || 'image/jpeg'
    const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`

    // 4. OpenAI GPT-4o-mini Vision çağrısı
    const openai = new OpenAI({ apiKey })

    const systemPrompt = `Sen fiş ve faturalardan veri çıkaran uzman bir yapay zeka asistanısın.
Kullanıcının yüklediği fiş görselini analiz et ve sonucu tam olarak istenen JSON şemasına uygun biçimde döndür.

KURALLAR:
1. "store": Fişin en üstündeki mağaza, market veya işletme adı (örn: "BİM", "Migros", "Starbucks", "Shell"). Okunamazsa null.
2. "amount": KDV DAHİL ÖDENEN GENEL TOPLAM tutardır (float sayı).
   - DİKKAT: "TOPKDV", "KDV TUTARI", "MATRAH", "NAKİT", "PARA ÜSTÜ" gibi ara tutarlarla genel toplamı karıştırma!
   - Fişteki "TOPLAM" veya "GENEL TOPLAM" tutarını al.
   - Sayısal float olarak döndür (örn: 123.45). Okunamazsa null.
3. "currency": Para birimi kodu. Türk Lirası için her zaman "TRY" döndür.
4. "purchased_at": Fiş üzerindeki ALIŞVERİŞ TARİHİ.
   - ÇOK ÖNEMLİ (TÜRKİYE TARİH KURALI): Türk fişlerinde gün daima aydan önce gelir: GG.AA.YYYY (veya GG/AA/YYYY).
   - Örnek: "06.10.2024" veya "06/10/2024" yazıyorsa bu 6 EKİM 2024'tür (ASLA 10 Haziran değildir!).
   - "TARİH:", "T:", "TARİH / SAAT", "DÜZENLENME TARİHİ" veya mali onay kısmındaki tarihi ara.
   - FİŞ NO, SAAT (14:30), Z NO, KASA NO veya TCKN/VKN gibi sayıları tarihle karıştırma.
   - Çıkarılan tarihi MUTLAKA "YYYY-MM-DD" formatında döndür (örn: "2024-10-06"). Fişte açık bir tarih göremiyorsan null yap.
5. "category": Yalnızca şu 8 kategoriden en uygun olanı seç:
   - "Market" (Bakkal, süpermarket, gıda)
   - "Yeme-İçme" (Restoran, kafe, yemek, lokanta)
   - "Ulaşım" (Akaryakıt, taksi, otobüs, otopark)
   - "Fatura" (Elektrik, su, doğalgaz, internet, telefon)
   - "Sağlık" (Eczane, hastane, klinik)
   - "Giyim" (Kıyafet, ayakkabı, tekstil)
   - "Eğlence" (Sinema, tiyatro, konser, hobi)
   - "Diğer" (Yukarıdakilere uymayan veya anlaşılamayan)
6. "confidence": Fişin okunabilirlik kalitesi ve çıkarılan verilerin kesinliği için 0.0 ile 1.0 arasında bir güven skoru.
7. ASLA DEĞER UYDURMA. Fişte açıkça görünmeyen veya okunamayan alanları null bırak.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Lütfen bu fişi incele ve JSON formatında çıkar: {"store": string|null, "amount": number|null, "currency": string, "purchased_at": string|null, "category": string, "confidence": number}',
            },
            {
              type: 'image_url',
              image_url: {
                url: base64Image,
                detail: 'high',
              },
            },
          ],
        },
      ],
      temperature: 0.1,
    })

    const rawResponseText = completion.choices[0]?.message?.content || '{}'
    const parsedJson = JSON.parse(rawResponseText)

    // 5. Veriyi doğrula ve normalize et
    const normalizedData = normalizeReceiptData(parsedJson)

    return NextResponse.json({
      success: true,
      data: normalizedData,
    })
  } catch (error: any) {
    console.error('Receipt parsing error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'Fiş analiz edilirken bir hata oluştu. Bilgileri elle doldurabilirsiniz.',
      },
      { status: 500 }
    )
  }
}
