-- ==============================================================================
-- Fiş Takipçisi - Supabase Veritabanı ve Depolama Şeması (schema.sql)
-- ==============================================================================

-- 1. Harcamalar (expenses) Tablosu
create table if not exists public.expenses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    store text,
    amount numeric(10, 2) not null check (amount >= 0),
    currency text not null default 'TRY',
    category text not null check (
        category in (
            'Market',
            'Yeme-İçme',
            'Ulaşım',
            'Fatura',
            'Sağlık',
            'Giyim',
            'Eğlence',
            'Diğer'
        )
    ),
    purchased_at date not null default current_date,
    image_path text,
    created_at timestamptz not null default now()
);

-- Performans için indeksler
create index if not exists idx_expenses_user_purchased 
    on public.expenses (user_id, purchased_at desc);

-- 2. Row Level Security (RLS) Etkinleştirme
alter table public.expenses enable row level security;

-- Kullanıcı sadece kendi harcamalarını görebilir
create policy "Kullanıcılar yalnızca kendi harcamalarını görebilir"
    on public.expenses for select
    using (auth.uid() = user_id);

-- Kullanıcı sadece kendi adına harcama ekleyebilir
create policy "Kullanıcılar yalnızca kendi harcamalarını ekleyebilir"
    on public.expenses for insert
    with check (auth.uid() = user_id);

-- Kullanıcı sadece kendi harcamalarını güncelleyebilir
create policy "Kullanıcılar yalnızca kendi harcamalarını güncelleyebilir"
    on public.expenses for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Kullanıcı sadece kendi harcamalarını silebilir
create policy "Kullanıcılar yalnızca kendi harcamalarını silebilir"
    on public.expenses for delete
    using (auth.uid() = user_id);


-- 3. Storage Bucket: "receipts" (Özel / Private)
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do update set public = false;

-- Storage RLS Politikaları
-- Dosyalar "<user_id>/<uuid>.<uzantı>" yolunda saklanır.
-- (storage.foldername(name))[1] ilk klasör ismini (user_id) döner.

-- Yükleme: Kullanıcı yalnızca kendi user_id klasörüne dosya yükleyebilir
create policy "Kullanıcılar yalnızca kendi klasörüne fiş yükleyebilir"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'receipts' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- Okuma / İndirme: Kullanıcı yalnızca kendi klasöründeki fişleri görebilir
create policy "Kullanıcılar yalnızca kendi fişlerini görebilir"
    on storage.objects for select
    to authenticated
    using (
        bucket_id = 'receipts' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- Silme: Kullanıcı yalnızca kendi klasöründeki fişleri silebilir
create policy "Kullanıcılar yalnızca kendi fişlerini silebilir"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'receipts' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );
