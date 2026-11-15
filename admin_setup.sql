-- ============================================================
-- MamanBol — встроенная админ-панель (безопасно, без секретного ключа)
-- Выполнить ОДИН раз: Supabase -> SQL Editor -> New query -> вставить всё -> Run.
--
-- Функции помечены SECURITY DEFINER (видят auth.users), но каждая сначала
-- проверяет, что вызвавший вошёл под email администратора. Обычный
-- пользователь получит "Доступ запрещён". В браузер идёт только публичный ключ.
-- ============================================================

-- 1) Кто админ (поменяй/дополни список при необходимости)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $is_admin$
  select coalesce((auth.jwt() ->> 'email') in (
    'bekzatismagulov3@gmail.com',
    'bekzatismagulo3@gmail.com'
  ), false);
$is_admin$;

-- 2) Список всех пользователей + сколько раз проходили тест
create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
  name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  results_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $list_users$
begin
  if not public.is_admin() then raise exception 'Доступ запрещён'; end if;
  return query
    select u.id,
           u.email::text,
           (u.raw_user_meta_data ->> 'full_name')::text,
           u.created_at,
           u.last_sign_in_at,
           count(r.id)
    from auth.users u
    left join public.results r on r.user_id = u.id
    group by u.id
    order by u.created_at desc;
end;
$list_users$;

-- 3) Все прохождения теста с email и именем
create or replace function public.admin_list_results()
returns table (
  id uuid,
  user_id uuid,
  email text,
  name text,
  created_at timestamptz,
  scores jsonb,
  top_professions jsonb
)
language plpgsql
stable
security definer
set search_path = public
as $list_results$
begin
  if not public.is_admin() then raise exception 'Доступ запрещён'; end if;
  return query
    select r.id,
           r.user_id,
           u.email::text,
           (u.raw_user_meta_data ->> 'full_name')::text,
           r.created_at,
           r.scores,
           r.top_professions
    from public.results r
    join auth.users u on u.id = r.user_id
    order by r.created_at desc;
end;
$list_results$;

-- 4) Удалить одно прохождение теста
create or replace function public.admin_delete_result(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $del_result$
begin
  if not public.is_admin() then raise exception 'Доступ запрещён'; end if;
  delete from public.results where id = p_id;
end;
$del_result$;

-- 5) Удалить пользователя целиком (его результаты удалятся автоматически)
create or replace function public.admin_delete_user(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $del_user$
begin
  if not public.is_admin() then raise exception 'Доступ запрещён'; end if;
  delete from auth.users where id = p_id;
end;
$del_user$;

-- 6) Разрешить вызывать эти функции вошедшим пользователям
--    (внутри всё равно стоит проверка is_admin)
grant execute on function public.is_admin()                to authenticated;
grant execute on function public.admin_list_users()        to authenticated;
grant execute on function public.admin_list_results()      to authenticated;
grant execute on function public.admin_delete_result(uuid) to authenticated;
grant execute on function public.admin_delete_user(uuid)   to authenticated;
