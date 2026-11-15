-- ============================================================
-- MamanBol — таблица результатов + RLS
-- Выполни это в Supabase: раздел SQL Editor → New query → Run
-- ============================================================

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scores jsonb not null,
  top_professions jsonb not null,
  created_at timestamptz not null default now()
);

-- индекс для быстрой выборки своих результатов по дате
create index if not exists results_user_created_idx
  on public.results (user_id, created_at desc);

-- включаем защиту на уровне строк
alter table public.results enable row level security;

-- каждый видит только свои результаты
create policy "results_select_own"
  on public.results for select
  using (auth.uid() = user_id);

-- каждый может добавлять только свои результаты
create policy "results_insert_own"
  on public.results for insert
  with check (auth.uid() = user_id);

-- (по желанию) удалять только свои
create policy "results_delete_own"
  on public.results for delete
  using (auth.uid() = user_id);
