# MamanBol — профориентация (PWA + Supabase)

Статическое веб-приложение: тест на 30 вопросов (RIASEC + предметы/навыки), персональный результат
с процентом совпадения, 40 профессий Казахстана, справочник вузов, авторизация и история результатов.

## Файлы
- `index.html`, `style.css`, `app.js` — само приложение
- `manifest.json`, `sw.js`, `icons/` — PWA (установка на телефон, оффлайн)
- `supabase.sql` — таблица `results` + RLS-политики

## Быстрый старт
1. Создай проект на https://supabase.com (бесплатно).
2. В **SQL Editor** выполни содержимое `supabase.sql`.
3. **Project Settings → API**: скопируй `Project URL` и ключ `anon public`.
4. Вставь их в начало `app.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
5. (Рекомендуется) **Authentication → Providers → Email** → выключи *Confirm email*, чтобы входить сразу.
6. Выложи папку на **GitHub Pages** (см. ниже) и открой по ссылке `https://логин.github.io/mamanbol/`.

Подробная инструкция — в ответе ассистента.
