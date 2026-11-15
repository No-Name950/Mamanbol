-- ============================================================
-- MamanBol — админ-запросы
-- Выполнять в Supabase → SQL Editor → Run.
-- Это безопасно: SQL Editor работает на сервере под твоим доступом
-- владельца проекта, секретный ключ никуда не попадает.
-- ПАРОЛИ посмотреть нельзя — они хранятся в виде необратимого хеша.
-- ============================================================

-- 1) Все пользователи: email, имя, когда зарегистрировался, последний вход
select
  u.email,
  u.raw_user_meta_data->>'full_name' as имя,
  u.created_at as зарегистрирован,
  u.last_sign_in_at as последний_вход
from auth.users u
order by u.created_at desc;

-- 2) Все прохождения теста: email + имя + дата + направления + профессии
select
  u.email,
  u.raw_user_meta_data->>'full_name' as имя,
  r.created_at as дата,
  r.scores->'top3'  as ведущие_направления,
  r.top_professions as топ_профессии
from public.results r
join auth.users u on u.id = r.user_id
order by r.created_at desc;

-- 3) Сколько тестов прошёл каждый пользователь
select
  u.email,
  count(r.id) as прохождений,
  max(r.created_at) as последнее
from auth.users u
left join public.results r on r.user_id = u.id
group by u.email
order by прохождений desc;

-- 4) Удалить ОДНО прохождение по его id (возьми id из запроса №2 или из Table Editor)
--    delete from public.results where id = 'ВСТАВЬ-ID';

-- 5) Удалить все результаты одного пользователя по email
--    delete from public.results
--    where user_id = (select id from auth.users where email = 'почта@пример.com');

-- 6) Полностью удалить пользователя (его результаты удалятся автоматически)
--    Лучше делать через Authentication → Users → ⋮ → Delete user.
--    Через SQL:
--    delete from auth.users where email = 'почта@пример.com';

-- Сбросить пароль пользователю нельзя "посмотреть", но можно отправить сброс:
-- Authentication → Users → у пользователя ⋮ → Send password recovery / Reset password.
