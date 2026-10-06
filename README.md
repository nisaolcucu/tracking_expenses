# 🧾 Fiş Takipçisi (Receipt Tracker)

> **Fiş fotoğraflarınızı yapay zeka ile saniyeler içinde analiz edip kategorize eden, aylık bütçe ve harcama dinamiklerinizi görselleştiren modern harcama takip uygulaması.**

---

## 📸 Ekran Görüntüleri

<!-- Proje ekran görüntüleri veya GIF demosu için yer tutucu -->
<div align="center">
  <img src="https://via.placeholder.com/1200x675.png?text=Fis+Takipcisi+-+Dashboard+ve+Yapay+Zeka+Fis+Okuyucu" alt="Fiş Takipçisi Önizleme" width="100%" />
</div>

---

## ✨ Özellikler

- **🤖 GPT-4o-mini ile Akıllı Fiş Okuma:** Fiş fotoğrafından mağaza adını, KDV dahil genel toplamı, tarihi ve kategoriyi yapay zeka ile otomatik çıkarma.
- **💳 Sabit Abonelikler & Yinelenen Giderler Takibi:** Netflix, Spotify, iCloud, kira gibi her ay tekrarlanan ödemeleri yönetme, ödeme gününe kalan süreyi ve en yakın faturaları canlı takip etme.
- **🐷 Birikim Hedefleri & Dijital Kumbara:** Hayalleriniz (tatil, cihaz, acil fon) için hedef belirleme, tek tıkla kumbaraya para aktarma ve tamamlanma yüzdesini takip etme.
- **🛍️ Akıllı İstek Listesi (Wishlist):** Almayı hayal ettiğiniz ürünleri fotoğraflı/fotoğrafsız kaydetme ve tek tıkla ("Satın Aldım") harcamalara dönüştürme.
- **🤔 "Almalı mıyım?" Yüzen AI Finans Danışmanı:** Sağ alt köşedeki akıllı sohbet balonu ile kararsız kaldığınız bir alışverişi girdiğinizde, mevcut ayın limit ve harcamalarına göre 🟢 Güvenli, 🟡 Düşünerek Al veya 🔴 Ertele kararı sunma.
- **🔍 Anlık Arama, Filtreleme & Excel/CSV Dışa Aktarma:** Harcamalar listesinde mağaza adına göre anında arama, kategori filtre hapları ve tek tıkla Türkçe Excel uyumlu UTF-8 CSV indirme.
- **🎯 Kategori Bazlı Bütçe Limitleri & İlerleme Çubukları:** Her kategori için aylık harcama tavanı belirleme, limit aşımı ve yaklaşımı (%75, %100+) durumlarında görsel uyarılar.
- **🇹🇷 Türk Fişlerine Özel Ayrıştırma:** "TOPLAM", "TOPKDV", "MATRAH", "NAKİT" gibi karmaşık terimleri ayırt etme, `1.234,50` formatındaki virgüllü tutarları ve `GG.AA.YYYY` tarih formatını hatasız tespit etme.
- **📸 Canlı Kamera ve Dosya Desteği:** Mobilde doğrudan arka kamerayı, masaüstünde ise WebRTC destekli canlı web kamerasını açarak anlık çekim ve görsel yükleme imkanı.
- **📅 Tarih & Harcama Yoğunluğu Takvimi (Heatmap):** Geçmiş yıllara ve aylara tek tıkla atlama, seçili ayın günlerini harcama büyüklüğüne göre yeşil/sarı/kırmızı renklerle görselleştiren ısı haritası.
- **📊 Kategori Bazlı Çubuk Grafik:** Recharts ile oluşturulmuş, aylık harcamaları 8 temel kategoriye göre dağıtan dinamik çubuk grafik.
- **✨ Ultra Lüks Fintech Tasarım Dili:** Ambient mesh mor/çivit/zümrüt ışıklandırmaları, Geist modern tipografisi, cam kartlar (Glassmorphism) ve mikro animasyonlar.
- **🔒 Güvenli Veri & Depolama (RLS):** Her kullanıcının yalnızca kendi verilerini ve yüklediği fiş fotoğraflarını görebildiği PostgreSQL Row Level Security ve Private Storage Bucket mimarisi.

---

## 🛠️ Teknolojiler

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Stil & Tasarım:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Yapay Zeka (AI):** [OpenAI API](https://openai.com/) (`gpt-4o-mini` Vision + JSON Mode)
- **Veritabanı & Kimlik Doğrulama:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, `@supabase/ssr`)
- **Dosya Depolama:** [Supabase Storage](https://supabase.com/storage) (Private Bucket + RLS)
- **Grafik:** [Recharts](https://recharts.org/)
- **İkonlar:** [Lucide React](https://lucide.dev/)
- **Test:** [Vitest](https://vitest.dev/)
- **Dağıtım (Deploy):** [Vercel](https://vercel.com/)

---

## 🚀 Kurulum ve Yerel Çalıştırma

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin

```bash
git clone https://github.com/nisaolcucu/tracking_expenses.git
cd tracking_expenses
npm install
```

### 2. Supabase Projesini Ayarlayın

1. [Supabase](https://supabase.com/)'da yeni bir proje oluşturun.
2. Sol menüden **SQL Editor** sekmesini açın.
3. Projedeki [`supabase/schema.sql`](file:///Users/elifnisaolcucu/Desktop/tracking_expenses/supabase/schema.sql) dosyasının tüm içeriğini yapıştırıp **Run** butonuna basın. Bu komut:
   - `expenses` tablosunu ve RLS kurallarını oluşturur.
   - `receipts` adında private Storage bucket'ını ve klasör bazlı erişim politikalarını kurar.
4. *(İsteğe Bağlı)* Hızlı test için **Authentication -> Providers -> Email** altından **"Confirm email"** seçeneğini kapatabilirsiniz.

### 3. Ortam Değişkenlerini Tanımlayın

Proje kök dizininde `.env.local` dosyası oluşturun (`.env.example` referansıyla):

```env
# Supabase Dashboard -> Project Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://proje-id-niz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...anon-anahtariniz

# OpenAI Platform -> API Keys
OPENAI_API_KEY=sk-proj-...openai-anahtariniz
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak uygulamayı kullanmaya başlayabilirsiniz.

### 5. Birim Testlerini Çalıştırın

```bash
npm test
```

---

## 🧠 Yapay Zeka Nasıl Kullanıldı?

### Neden GPT-4o-mini?
- **Yüksek Vision Başarısı:** Termal fiş kağıtlarındaki silik yazıları, kırışıklıkları ve karmaşık mağaza logolarını yüksek doğrulukla okuyabilir.
- **JSON Mode Yeteneği:** Yanıtları garanti edilmiş JSON şeması ile üretir; regex ile metin ayıklama kırılganlığını ortadan kaldırır.
- **Hız ve Düşük Maliyet:** Fiş başına ortalama maliyeti $0.0015 (yaklaşık 5-10 kuruş) civarındadır; 100 fiş okutmak 1-2 sent tutar.

### Prompt Yapısı ve Ayrıştırma Kuralları
- **Türk Fişlerine Özgü Heuristics:**
  - `TOPLAM`, `GENEL TOPLAM` tutarları KDV (`TOPKDV`, `MATRAH`), `NAKİT` veya `PARA ÜSTÜ` ile karıştırılmaz.
  - Türk fişlerinde gün daima aydan önce gelir (`GG.AA.YYYY`). Model bu formatı Amerikan formatı (`AA.GG.YYYY`) ile karıştırmamak üzere eğitilmiştir.
  - Modelin uydurma (hallucination) yapması engellenir; okunamayan alanlar için açıkça `null` dönmesi istenir.
- **Normalizasyon Katmanı (`src/lib/receipt-normalizer.ts`):**
  - GPT yanıtı sunucuya ulaştığında ayrı bir doğrulama katmanından geçer: virgüllü formatlar (`1.234,50`) temizlenir, tarih doğrulanır ve kategori belirlenen 8 kategoriye zorlanır.
  - Güven skoru 0.6'nın altındaysa kullanıcıya sarı uyarı kartı gösterilir.

---

## 🛡️ Güvenlik Mimarisi

- **Row Level Security (RLS):** Veritabanı seviyesinde açık olan RLS sayesinde hiçbir kullanıcı başka bir kullanıcının harcama kayıtlarına erişemez, ekleyemez veya silemez (`auth.uid() = user_id`).
- **Özel (Private) Storage Bucket:** `receipts` bucket'ı dış dünyaya tamamen kapalıdır. Yalnızca oturum açmış kullanıcı kendi `user_id`'si ile başlayan klasöre dosya yükleyebilir ve silebilir.
- **1 Saatlik İmzalı URL'ler (Signed URLs):** Fiş görselleri genel URL üzerinden değil, Supabase tarafından anlık üretilen ve 3600 saniye sonra süresi dolan imzalı bağlantılar üzerinden güvenle gösterilir.
- **API Anahtarı Güvenliği:** `OPENAI_API_KEY` kesinlikle tarayıcıya iletilmez, yalnızca sunucu tarafında (`src/app/api/parse-receipt/route.ts`) gizli olarak çalışır.

---

## 🔮 v2 Geliştirme Fikirleri

- [ ] **Bütçe Aşım Uyarıları:** Kullanıcının belirlediği aylık harcama limitine yaklaşıldığında veya aşıldığında bildirim gösterme.
- [ ] **Çoklu Döviz Desteği:** Yurt dışı fişleri (EUR, USD, GBP) için otomatik TCMB kuruyla anlık TRY çevrimi.
- [ ] **CSV / Excel Dışa Aktarma:** Seçili ayın harcamalarını muhasebe veya raporlama amaçlı tek tıkla CSV formatında indirme.
- [ ] **Yapay Zeka Tasarruf Danışmanı:** Kullanıcının geçmiş harcama trendlerine bakarak hangi kategoride tasarruf edebileceğini öneren AI modülü.

---

## 📄 Lisans
Bu proje MIT lisansı altında geliştirilmiştir.
