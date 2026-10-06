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

-- RLS Etkinleştirme
alter table public.expenses enable row level security;

create policy "Kullanıcılar yalnızca kendi harcamalarını görebilir"
    on public.expenses for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi harcamalarını ekleyebilir"
    on public.expenses for insert
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi harcamalarını güncelleyebilir"
    on public.expenses for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi harcamalarını silebilir"
    on public.expenses for delete
    using (auth.uid() = user_id);


-- 2. Kategori Bütçe Hedefleri (budgets) Tablosu
create table if not exists public.budgets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
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
    monthly_limit numeric(10, 2) not null check (monthly_limit >= 0),
    currency text not null default 'TRY',
    created_at timestamptz not null default now(),
    unique(user_id, category)
);

alter table public.budgets enable row level security;

create policy "Kullanıcılar yalnızca kendi bütçe limitlerini görebilir"
    on public.budgets for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi bütçe limitlerini ekleyebilir"
    on public.budgets for insert
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi bütçe limitlerini güncelleyebilir"
    on public.budgets for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi bütçe limitlerini silebilir"
    on public.budgets for delete
    using (auth.uid() = user_id);


-- 3. İstek Listesi (wishlist) Tablosu
create table if not exists public.wishlist (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    title text not null,
    price numeric(10, 2) not null check (price >= 0),
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
    image_path text,
    priority text not null check (priority in ('Yüksek', 'Orta', 'Düşük')) default 'Orta',
    is_purchased boolean not null default false,
    notes text,
    created_at timestamptz not null default now()
);

alter table public.wishlist enable row level security;

create policy "Kullanıcılar yalnızca kendi istek listesini görebilir"
    on public.wishlist for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi istek listesine ekleyebilir"
    on public.wishlist for insert
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi istek listesini güncelleyebilir"
    on public.wishlist for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi istek listesinden silebilir"
    on public.wishlist for delete
    using (auth.uid() = user_id);


-- 4. Storage Bucket: "receipts" (Özel / Private)
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do update set public = false;

create policy "Kullanıcılar yalnızca kendi klasörüne fiş yükleyebilir"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'receipts' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Kullanıcılar yalnızca kendi fişlerini görebilir"
    on storage.objects for select
    to authenticated
    using (
        bucket_id = 'receipts' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Kullanıcılar yalnızca kendi fişlerini silebilir"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'receipts' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- 5. Subscriptions Tablosu (Sabit Abonelikler & Yinelenen Giderler)
create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    amount numeric(10, 2) not null check (amount >= 0),
    currency text not null default 'TRY',
    category text not null default 'Eğlence',
    billing_day integer not null check (billing_day between 1 and 31),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Kullanıcılar yalnızca kendi aboneliklerini görebilir"
    on public.subscriptions for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi aboneliklerini ekleyebilir"
    on public.subscriptions for insert
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi aboneliklerini güncelleyebilir"
    on public.subscriptions for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi aboneliklerini silebilir"
    on public.subscriptions for delete
    using (auth.uid() = user_id);

-- 6. Savings Goals Tablosu (Birikim Hedefleri & Kumbara)
create table if not exists public.savings_goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    target_amount numeric(10, 2) not null check (target_amount > 0),
    current_amount numeric(10, 2) not null default 0 check (current_amount >= 0),
    currency text not null default 'TRY',
    target_date date,
    color text not null default '#6366f1',
    created_at timestamptz not null default now()
);

alter table public.savings_goals enable row level security;

create policy "Kullanıcılar yalnızca kendi birikim hedeflerini görebilir"
    on public.savings_goals for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi birikim hedeflerini ekleyebilir"
    on public.savings_goals for insert
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi birikim hedeflerini güncelleyebilir"
    on public.savings_goals for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Kullanıcılar yalnızca kendi birikim hedeflerini silebilir"
    on public.savings_goals for delete
    using (auth.uid() = user_id);
