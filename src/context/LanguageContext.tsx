'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'tr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string) => string
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  tr: {
    // Header & Nav
    nav_expenses: 'Harcamalar',
    nav_wishlist: 'İstek Listesi',
    nav_subscriptions: 'Abonelikler',
    nav_savings: 'Kumbara',
    btn_budgets: 'Bütçe Limitleri',
    btn_signout: 'Çıkış Yap',
    live_tracking: 'Canlı Takip Aktif',
    back_to_expenses: 'Harcamalara Dön',

    // Summary Cards
    summary_title: 'Harcama Özeti',
    summary_subtitle: 'Aylık fişlerinizi, harcama dağılımınızı ve bütçenizi inceleyin',
    total_spent: 'Aylık Toplam Harcama',
    recorded_receipts: 'Kaydedilen Fiş',
    top_category: 'Lider Kategori',
    receipt_count_suffix: 'adet',
    avg_per_receipt: 'Fiş başı ort.',
    no_expenses_yet: 'Henüz harcama yok',
    no_data: 'Veri bulunmuyor',
    all_confirmed: 'Seçili ay için onaylanan fişler',

    // Budget Progress
    budget_progress_title: 'Aylık Bütçe İlerlemesi',
    budget_progress_subtitle: 'Kategori bazlı harcama limitleriniz ve anlık doluluk oranları',
    target_tracking: 'Hedef Takibi',
    over_limit_suffix: 'aşıldı!',

    // Uploader
    uploader_title: 'Yeni Fiş Ekle',
    uploader_subtitle: 'Yapay zeka ile tara veya bilgileri girin',
    take_photo: 'Fotoğraf Çek',
    take_photo_desc: 'Kamerayı açarak fişi canlı tara',
    upload_file: 'Görsel Yükle',
    upload_file_desc: 'Galeriden veya bilgisayardan seç',
    store_label: 'MAĞAZA / İŞLETME ADI',
    amount_label: 'TOPLAM TUTAR (KDV DAHİL) *',
    category_label: 'KATEGORİ *',
    date_label: 'HARCAMA TARİHİ *',
    date_hint: 'Fişten okunan tarihi kontrol etmeyi unutmayın',
    btn_save: 'Harcamayı Kaydet',
    saving: 'Kaydediliyor...',

    // Category Chart
    chart_title: 'Kategori Dağılımı',
    chart_subtitle: 'Seçili aydaki toplam harcamanın kategorilere göre dökümü',
    no_chart_data: 'Bu ay henüz grafik oluşturacak harcama verisi yok',
    no_chart_data_desc: 'Yeni bir fiş eklediğinizde kategori dağılımı burada belirecektir.',

    // Expense List
    list_title: 'Harcama Detayları',
    list_subtitle: 'Seçili aya ait harcamalarınızı arayın, filtreleyin ve dışa aktarın',
    btn_export: 'Excel / CSV İndir',
    search_placeholder: 'İşletme veya mağaza ara (örn: Migros)...',
    sort_date_desc: 'En Yeni Tarih',
    sort_amount_desc: 'En Yüksek Tutar',
    sort_amount_asc: 'En Düşük Tutar',
    filter_all: 'Tümü',
    no_expenses: 'Henüz Fiş Eklenmedi',
    no_expenses_desc: 'Bu ay için onaylanan bir harcama bulunmuyor. Yukarıdan ilk fişinizi yükleyerek başlayabilirsiniz.',
    no_search_results: 'Arama kriterlerinize uygun harcama kaydı bulunamadı.',
    confirm_delete: 'Silinsin mi?',

    // Subscriptions
    subs_page_title: 'Sabit Abonelikler',
    subs_monthly_title: 'Aylık Sabit Abonelikler',
    subs_active_title: 'Aktif Servisler',
    subs_next_payment: 'En Yakın Ödeme',
    subs_templates: 'Hızlı Şablonlar',
    subs_templates_desc: 'Tek tıkla formu doldurun',
    subs_list_title: 'Sabit Gider Listesi',
    subs_list_desc: 'Tekrarlanan aboneliklerinizi yönetin ve ödeme günlerini takip edin',
    subs_add_btn: 'Abonelik Ekle',
    subs_no_items: 'Kayıtlı abonelik bulunmuyor',
    subs_due_today: 'Bugün!',
    subs_days_left: 'gün kaldı',
    subs_active_tag: 'Aktif',
    subs_paused_tag: 'Durduruldu',
    billing_day_prefix: 'Her ayın',
    billing_day_suffix: '. günü',

    // Savings
    savings_page_title: 'Dijital Kumbara',
    savings_saved_title: 'Kumbarada Biriken',
    savings_success_title: 'Genel Başarı Oranı',
    savings_goals_title: 'Aktif Hedefler',
    savings_list_title: 'Birikim Hedeflerim',
    savings_list_desc: 'Hayalleriniz için tasarruf hedefleri belirleyin ve kumbaranıza para ekleyin',
    savings_add_btn: 'Yeni Hedef Ekle',
    savings_quick_add: 'Özel Ekle',
    savings_no_goals: 'Henüz Birikim Hedefiniz Yok',
    savings_no_goals_desc: 'Tatil, yeni cihaz veya acil durum fonu için ilk kumbaranızı oluşturarak birikim yapmaya başlayın!',
    savings_remaining: 'Kalan',
    savings_reached: '🎉 Hedefe Ulaşıldı!',
    deposit_to_piggy: 'Kumbaraya Ekle',
    goal_title_label: 'Hedef Başlığı',
    goal_title_placeholder: 'Örn: Yaz Tatili Fonu, Yeni Bilgisayar',
    target_amount_label: 'Hedef Tutar (₺)',
    initial_amount_label: 'Başlangıç Birikimi (₺)',
    target_date_label: 'Hedef Tarih (İsteğe Bağlı)',
    color_theme_label: 'Tema Rengi',
    create_goal_btn: 'Hedefi Oluştur',
    new_goal_modal_title: 'Yeni Birikim Hedefi',
    new_goal_modal_desc: 'Geleceğiniz için birikim hedefi belirleyin',
    amount_to_add_label: 'Eklenecek Tutar (₺)',
    add_deposit_btn: 'Ekle',
    target_date_prefix: 'Hedef:',

    // Floating Assistant
    ai_button: 'Almalı mıyım? (AI)',
    ai_coach_title: 'Finans Koçu AI',
    ai_coach_subtitle: 'Satın alma kararını bütçenle değerlendir',
    ai_item_label: 'Ürün / İstek',
    ai_price_label: 'Fiyat (₺)',
    ai_category_label: 'Kategori',
    ai_analyze_btn: 'Satın Almayı Değerlendir',
    ai_analyzing: 'Bütçe analiz ediliyor...',
    ai_welcome_msg: 'Merhaba! Almayı düşündüğün bir şey varsa söyle; bu ayki harcamalarına, kalan bütçene ve ayın gününe göre hemen analiz edeyim.',
    ai_safe: 'GÜVENLİ',
    ai_consider: 'DÜŞÜNEREK AL',
    ai_delay: 'ERTELE',

    // Wishlist
    wishlist_page_title: 'İstek Listesi',
    wishlist_total_value: 'İsteklerin Toplam Değeri',
    wishlist_pending_items: 'Alınmayı Bekleyen',
    wishlist_purchased_items: 'Satın Alınanlar',
    wishlist_add_btn: 'Yeni İstek Ekle',
    wishlist_list_title: 'Alınacak Şeyler Listesi',
    wishlist_list_desc: 'Almak istediğiniz ürünleri fotoğraflı veya fotoğrafsız kaydedin, AI ile değerlendirin',
    wishlist_no_items: 'Henüz İstek Listenizde Ürün Yok',
    wishlist_no_items_desc: 'Almayı planladığınız bir kaban, ayakkabı veya teknolojik aleti ekleyerek başlayın.',
    wishlist_banner_badge: 'Akıllı Satın Alma Danışmanı',
    wishlist_banner_title: 'Hayal ve İstek Listeniz',
    wishlist_banner_desc: 'Almayı düşündüğünüz şeyleri kaydedin, bütçenizi zorlamadan ne zaman alabileceğinizi yapay zekaya danışın.',
    wishlist_quick_ai: 'Hızlı AI Danışmanı',
    filter_pending: 'Bekleyenler',
    filter_purchased: 'Satın Alınanlar',
    priority_high: 'Yüksek',
    priority_medium: 'Orta',
    priority_low: 'Düşük',
    priority_suffix: 'Öncelik',
    mark_as_purchased: 'Satın Aldım',
    purchased_badge: 'Satın Alındı & Harcamaya Eklendi',
    should_i_buy_btn: 'Almalı mıyım?',
    first_wish_btn: 'İlk İsteği Ekle',
    item_title_label: 'Ürün / İstek Adı *',
    estimated_price_label: 'Tahmini Fiyat (₺) *',
    notes_label: 'Notlar / Link (Opsiyonel)',
    photo_label: 'Fotoğraf (Opsiyonel)',
    choose_photo: 'Görsel Seç',
    change_photo: 'Değiştir',
    save_wish_btn: 'İsteği Kaydet',
    new_wish_modal_title: 'Yeni İstek / Ürün Ekle',

    // Calendar & Heatmap
    calendar_title: 'Tarih & Harcama Takvimi',
    calendar_subtitle: 'Geçmiş yıllara atlayın ve harcama yoğunluğunu görün',
    this_month: 'Bu Ay',
    change_date: 'Değiştir',
    daily_breakdown: 'Günlük Harcama Dağılımı',

    // Budget Modal
    budget_modal_title: 'Aylık Bütçe Limitleri',
    budget_modal_subtitle: 'Kategori bazlı harcama tavanlarınızı belirleyin',
    budget_saved: 'Kaydedildi',
    budget_alerts_active: 'AI bütçe limitleri devrede',
    save_btn: 'Kaydet',
    cancel_btn: 'İptal',
    ok_btn: 'Tamam',

    // Categories
    cat_Market: 'Market',
    'cat_Yeme-İçme': 'Yeme-İçme',
    cat_Ulaşım: 'Ulaşım',
    cat_Fatura: 'Fatura',
    cat_Sağlık: 'Sağlık',
    cat_Giyim: 'Giyim',
    cat_Eğlence: 'Eğlence',
    cat_Diğer: 'Diğer',
    // Aliases
    cat_Dining: 'Yeme-İçme',
    cat_Transport: 'Ulaşım',
    cat_Bills: 'Fatura',
    cat_Health: 'Sağlık',
    cat_Clothing: 'Giyim',
    cat_Entertainment: 'Eğlence',
    cat_Other: 'Diğer',

    // Auth & Login
    auth_login_tab: 'Giriş Yap',
    auth_signup_tab: 'Kayıt Ol',
    auth_login_subtitle: 'Akıllı harcama, fiş ve birikim asistanınıza giriş yapın',
    auth_signup_subtitle: 'Yeni bir Lensofish hesabı oluşturup finansal kontrolü ele alın',
    auth_email_label: 'E-posta Adresi',
    auth_email_placeholder: 'ornek@eposta.com',
    auth_password_label: 'Şifre',
    auth_password_hint: 'En az 6 karakter olmalıdır',
    auth_login_btn: 'Giriş Yap',
    auth_signup_btn: 'Hesap Oluştur',
    auth_logging_in: 'Giriş yapılıyor...',
    auth_signing_up: 'Kaydediliyor...',
    auth_no_account: 'Hesabınız yok mu?',
    auth_have_account: 'Zaten hesabınız var mı?',
    auth_signup_link: 'Kayıt Olun',
    auth_signin_link: 'Giriş Yapın',
    auth_err_required: 'Lütfen e-posta ve şifrenizi girin.',
    auth_err_invalid: 'E-posta veya şifre hatalı.',
    auth_err_unconfirmed: 'Lütfen önce e-posta adresinizi doğrulayın.',
    auth_err_generic: 'Giriş yapılırken bir hata oluştu.',
    auth_err_password_len: 'Şifre en az 6 karakter olmalıdır.',
    auth_err_already_registered: 'Bu e-posta adresiyle zaten bir hesap mevcut.',
    auth_err_signup_failed: 'Kayıt işlemi başarısız oldu.',
    auth_success_signup: 'Hesabınız başarıyla oluşturuldu! E-posta adresinize bir onay bağlantısı gönderilmiş olabilir. Giriş yapabilirsiniz.',

    // Showcase & Developer Portfolio
    showcase_badge: 'Yapay Zeka Destekli Finans Asistanı',
    showcase_headline: 'Harcamalarınızı mercek altına alın.',
    showcase_desc: 'Fişlerinizi saniyeler içinde tarayın, bütçenizi, sabit aboneliklerinizi ve dijital kumbaranızı tek noktadan yönetin.',
    showcase_feat1_title: 'Yapay Zeka ile Fiş Okuma',
    showcase_feat1_desc: 'Kameradan çekin; mağaza, tutar, tarih ve kategori saniyeler içinde otomatik ayrılsın.',
    showcase_feat2_title: 'Bütçe Limitleri & Analiz',
    showcase_feat2_desc: 'Kategori bazlı harcama tavanı belirleyin, yoğunluk takvimiyle bütçenizi koruyun.',
    showcase_feat3_title: 'Abonelikler & Kumbara',
    showcase_feat3_desc: 'Yinelenen faturaların ödeme günlerini ve birikim hedeflerinizi canlı takip edin.',
    showcase_feat4_title: 'Finans Koçu AI ("Almalı mıyım?")',
    showcase_feat4_desc: 'Alışveriş kararsızlıklarında bütçenize göre anlık objektif satın alma tavsiyesi alın.',
    dev_note_title: 'Geliştirici & Portfolyo Notu',
    dev_note_badge: 'Açık Kaynak Proje',
    dev_note_text: 'Bu proje Elif Nisa Ölçücü tarafından geliştirilmiştir. Canlı sistem güvenliği ve API maliyet koruması sebebiyle yeni üye alımı kapalıdır. Kaynak kodlarını ve mimari dokümanını GitHub üzerinden inceleyebilirsiniz.',
    dev_github_btn: 'GitHub’da İncele',
    signup_closed_notice: 'Canlı demoda yeni üye alımı kapalıdır. Kaynak kodları GitHub’da mevcuttur.',
  },
  en: {
    // Header & Nav
    nav_expenses: 'Expenses',
    nav_wishlist: 'Wishlist',
    nav_subscriptions: 'Subscriptions',
    nav_savings: 'Savings',
    btn_budgets: 'Budget Limits',
    btn_signout: 'Sign Out',
    live_tracking: 'Live Tracking Active',
    back_to_expenses: 'Back to Expenses',

    // Summary Cards
    summary_title: 'Expense Summary',
    summary_subtitle: 'Review your monthly receipts, expense breakdown, and budgets',
    total_spent: 'Monthly Total Spent',
    recorded_receipts: 'Recorded Receipts',
    top_category: 'Top Category',
    receipt_count_suffix: 'items',
    avg_per_receipt: 'Avg per receipt',
    no_expenses_yet: 'No expenses yet',
    no_data: 'No data',
    all_confirmed: 'Confirmed receipts for this month',

    // Budget Progress
    budget_progress_title: 'Monthly Budget Progress',
    budget_progress_subtitle: 'Category limits and real-time usage percentages',
    target_tracking: 'Target Tracking',
    over_limit_suffix: 'exceeded!',

    // Uploader
    uploader_title: 'Add New Receipt',
    uploader_subtitle: 'Scan with AI or enter details manually',
    take_photo: 'Take Photo',
    take_photo_desc: 'Open camera and scan receipt live',
    upload_file: 'Upload Image',
    upload_file_desc: 'Choose from gallery or computer',
    store_label: 'STORE / MERCHANT NAME',
    amount_label: 'TOTAL AMOUNT (INCL. TAX) *',
    category_label: 'CATEGORY *',
    date_label: 'PURCHASE DATE *',
    date_hint: 'Verify the detected purchase date',
    btn_save: 'Save Expense',
    saving: 'Saving...',

    // Category Chart
    chart_title: 'Category Breakdown',
    chart_subtitle: 'Distribution of monthly spending across categories',
    no_chart_data: 'No expense data to chart this month',
    no_chart_data_desc: 'Categories will appear here once you add a receipt.',

    // Expense List
    list_title: 'Expense Details',
    list_subtitle: 'Search, filter, and export your monthly receipts',
    btn_export: 'Export CSV / Excel',
    search_placeholder: 'Search store or merchant (e.g. Migros)...',
    sort_date_desc: 'Newest Date',
    sort_amount_desc: 'Highest Amount',
    sort_amount_asc: 'Lowest Amount',
    filter_all: 'All',
    no_expenses: 'No Receipts Added Yet',
    no_expenses_desc: 'No approved expenses found for this month. Upload your first receipt above to begin.',
    no_search_results: 'No expenses match your search criteria.',
    confirm_delete: 'Delete?',

    // Subscriptions
    subs_page_title: 'Subscriptions',
    subs_monthly_title: 'Monthly Subscriptions',
    subs_active_title: 'Active Services',
    subs_next_payment: 'Next Payment',
    subs_templates: 'Quick Templates',
    subs_templates_desc: 'Fill the form in one click',
    subs_list_title: 'Recurring Bills List',
    subs_list_desc: 'Manage recurring subscriptions and track due dates',
    subs_add_btn: 'Add Subscription',
    subs_no_items: 'No subscriptions registered',
    subs_due_today: 'Today!',
    subs_days_left: 'days left',
    subs_active_tag: 'Active',
    subs_paused_tag: 'Paused',
    billing_day_prefix: 'Every month day',
    billing_day_suffix: '',

    // Savings
    savings_page_title: 'Piggy Bank & Savings',
    savings_saved_title: 'Total in Piggy Bank',
    savings_success_title: 'Overall Success Rate',
    savings_goals_title: 'Active Goals',
    savings_list_title: 'My Savings Goals',
    savings_list_desc: 'Set savings goals for your dreams and add funds to your piggy bank',
    savings_add_btn: 'Add New Goal',
    savings_quick_add: 'Custom Add',
    savings_no_goals: 'No Savings Goals Yet',
    savings_no_goals_desc: 'Start saving for a vacation, new device, or emergency fund by setting up your first goal!',
    savings_remaining: 'Remaining',
    savings_reached: '🎉 Goal Reached!',
    deposit_to_piggy: 'Add to Piggy Bank',
    goal_title_label: 'Goal Title',
    goal_title_placeholder: 'e.g. Summer Vacation, New Laptop',
    target_amount_label: 'Target Amount (₺)',
    initial_amount_label: 'Initial Deposit (₺)',
    target_date_label: 'Target Date (Optional)',
    color_theme_label: 'Theme Color',
    create_goal_btn: 'Create Goal',
    new_goal_modal_title: 'New Savings Goal',
    new_goal_modal_desc: 'Define a savings milestone for your future',
    amount_to_add_label: 'Amount to Deposit (₺)',
    add_deposit_btn: 'Deposit',
    target_date_prefix: 'Target:',

    // Floating Assistant
    ai_button: 'Should I Buy? (AI)',
    ai_coach_title: 'Financial Coach AI',
    ai_coach_subtitle: 'Evaluate purchase decisions with your budget',
    ai_item_label: 'Product / Wish',
    ai_price_label: 'Price',
    ai_category_label: 'Category',
    ai_analyze_btn: 'Analyze Purchase',
    ai_analyzing: 'Analyzing budget...',
    ai_welcome_msg: 'Hello! Tell me what you want to buy; I will evaluate it against your monthly budget and spending pace.',
    ai_safe: 'SAFE TO BUY',
    ai_consider: 'CONSIDER CAREFULLY',
    ai_delay: 'DELAY / POSTPONE',

    // Wishlist
    wishlist_page_title: 'Wishlist',
    wishlist_total_value: 'Total Wishlist Value',
    wishlist_pending_items: 'Pending Items',
    wishlist_purchased_items: 'Purchased Items',
    wishlist_add_btn: 'Add New Wish',
    wishlist_list_title: 'Wishlist Items',
    wishlist_list_desc: 'Save products you want to buy with or without photos, analyze with AI',
    wishlist_no_items: 'No items in your wishlist yet',
    wishlist_no_items_desc: 'Start by saving a coat, pair of shoes, or gadget you plan to purchase.',
    wishlist_banner_badge: 'Smart Purchase Advisor',
    wishlist_banner_title: 'Your Wishlist & Dreams',
    wishlist_banner_desc: 'Save items you plan to buy and consult AI to see if they fit your budget without strain.',
    wishlist_quick_ai: 'Quick AI Advisor',
    filter_pending: 'Pending',
    filter_purchased: 'Purchased',
    priority_high: 'High',
    priority_medium: 'Medium',
    priority_low: 'Low',
    priority_suffix: 'Priority',
    mark_as_purchased: 'Mark Purchased',
    purchased_badge: 'Purchased & Added to Expenses',
    should_i_buy_btn: 'Should I buy?',
    first_wish_btn: 'Add First Wish',
    item_title_label: 'Product / Wish Name *',
    estimated_price_label: 'Estimated Price (₺) *',
    notes_label: 'Notes / Link (Optional)',
    photo_label: 'Photo (Optional)',
    choose_photo: 'Select Image',
    change_photo: 'Change',
    save_wish_btn: 'Save Wish',
    new_wish_modal_title: 'Add New Item / Wish',

    // Calendar & Heatmap
    calendar_title: 'Date & Spending Calendar',
    calendar_subtitle: 'Jump between months and explore spending intensity',
    this_month: 'This Month',
    change_date: 'Change',
    daily_breakdown: 'Daily Spending Breakdown',

    // Budget Modal
    budget_modal_title: 'Monthly Budget Limits',
    budget_modal_subtitle: 'Set spending caps for each category',
    budget_saved: 'Saved',
    budget_alerts_active: 'AI budget limits active',
    save_btn: 'Save',
    cancel_btn: 'Cancel',
    ok_btn: 'OK',

    // Categories
    cat_Market: 'Grocery',
    'cat_Yeme-İçme': 'Dining & Food',
    cat_Ulaşım: 'Transport',
    cat_Fatura: 'Bills & Utilities',
    cat_Sağlık: 'Health',
    cat_Giyim: 'Clothing',
    cat_Eğlence: 'Entertainment',
    cat_Diğer: 'Other',
    // Aliases
    cat_Dining: 'Dining & Food',
    cat_Transport: 'Transport',
    cat_Bills: 'Bills & Utilities',
    cat_Health: 'Health',
    cat_Clothing: 'Clothing',
    cat_Entertainment: 'Entertainment',
    cat_Other: 'Other',

    // Auth & Login
    auth_login_tab: 'Sign In',
    auth_signup_tab: 'Sign Up',
    auth_login_subtitle: 'Sign in to your smart spending, receipt and savings assistant',
    auth_signup_subtitle: 'Create a new Lensofish account and take control of your finances',
    auth_email_label: 'Email Address',
    auth_email_placeholder: 'example@email.com',
    auth_password_label: 'Password',
    auth_password_hint: 'Must be at least 6 characters',
    auth_login_btn: 'Sign In',
    auth_signup_btn: 'Create Account',
    auth_logging_in: 'Signing in...',
    auth_signing_up: 'Creating account...',
    auth_no_account: "Don't have an account?",
    auth_have_account: 'Already have an account?',
    auth_signup_link: 'Sign Up',
    auth_signin_link: 'Sign In',
    auth_err_required: 'Please enter your email and password.',
    auth_err_invalid: 'Invalid email or password.',
    auth_err_unconfirmed: 'Please confirm your email address first.',
    auth_err_generic: 'An error occurred while signing in.',
    auth_err_password_len: 'Password must be at least 6 characters.',
    auth_err_already_registered: 'An account already exists with this email address.',
    auth_err_signup_failed: 'Registration failed.',
    auth_success_signup: 'Account created successfully! A confirmation link may have been sent to your email. You can now sign in.',

    // Showcase & Developer Portfolio
    showcase_badge: 'AI-Powered Personal Finance Hub',
    showcase_headline: 'Put your spending under the lens.',
    showcase_desc: 'Scan receipts in seconds, manage budgets, subscriptions, and your digital piggy bank from one single place.',
    showcase_feat1_title: 'AI Receipt Scanning',
    showcase_feat1_desc: 'Snap a receipt photo; store, amount, date, and category are parsed automatically in seconds.',
    showcase_feat2_title: 'Budget Limits & Insights',
    showcase_feat2_desc: 'Set category caps, inspect dynamic charts, and prevent overspending with heatmaps.',
    showcase_feat3_title: 'Subscriptions & Savings',
    showcase_feat3_desc: 'Track recurring billing dates and save money toward your personal dreams.',
    showcase_feat4_title: 'AI Financial Coach ("Should I buy?")',
    showcase_feat4_desc: 'Get live purchase evaluation based on your current spending and remaining days.',
    dev_note_title: 'Developer & Portfolio Note',
    dev_note_badge: 'Open Source Project',
    dev_note_text: 'This project is created by Elif Nisa Ölçücü. Public registration is restricted to prevent API quota misuse. You can explore the full source code and architecture guide on GitHub.',
    dev_github_btn: 'View on GitHub',
    signup_closed_notice: 'Registration is closed on the live demo. Source code is available on GitHub.',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr')

  useEffect(() => {
    const stored = localStorage.getItem('app_lang') as Language | null
    if (stored === 'tr' || stored === 'en') {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app_lang', lang)
  }

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr')
  }

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.tr[key] || key
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
