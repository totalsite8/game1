# Деплой на Vercel

## Фактическое состояние, 2026-10-03

`vercel whoami`: Logged out. `vercel deploy --temporary --yes`: temporary deployments unavailable; no credentials. Поэтому **публичного Vercel URL пока нет**. Секреты не запрашивались и не сохранены. Arena Live Preview — отдельный dev-сервер, не production deployment.

## Подключение владельцем

1. Войти в свой Vercel аккаунт через браузер.
2. Add New → Project → Import Git Repository → `totalsite8/game1`.
3. Root Directory: корень репозитория. Framework: Vite. Node: 22.x.
4. Для публикации текущей работы выбрать ветку `arena/01a102d0-game1` (или сначала смержить PR через GitHub самостоятельно). Не перепривязывать сессию Arena к другой ветке.
5. Install: `npm ci`; Build: `npm run build`; Output: `dist`.
6. Для гостевого прототипа **переменные окружения не нужны**.
7. Deploy. Проверить `/`, `/play`, `/telegram`, `/api/health`, сохранения, offline после загрузки.
8. Прислать URL, если нужна проверка deployment. Токены/пароли в чат не отправлять.

Если Vercel доступен через подключение платформы, подключить аккаунт там. CLI login выполняется владельцем; не хранить token в репозитории.

## Серверная часть

- `/api/health`: техническая готовность (200), не обещание доступности WebGPU.
- `/api/telegram/verify`: без `TELEGRAM_BOT_TOKEN` — 503. При подключении токена проверяет HMAC, свежесть 10 минут, не выдаёт login-cookie и не создаёт облачный слот. Не считать полноценной авторизацией.
- `/api/saves/sync`: всегда 503 до реализации постоянной БД, аутентификации, rate limiting, CSRF и server-authoritative replay.
- Заголовки CSP, HSTS, Permissions Policy заданы в `vercel.json`. Camera/microphone/geolocation отключены.

## Release checklist

- npm ci; format:check; test; build; audit; browser smoke на собранном клиенте.
- Проверить browser console, API routes, HTTPS и заголовки.
- Реальные Safari/iOS/Android/Telegram WebView: запуск, поворот, background/resume, отказ IndexedDB, low-power.
- Offline после полного precache, безопасное обновление после закрытия всех вкладок.
- Удаление/экспорт данных, клавиатура, screen reader, контраст.
- Финальный текст Privacy/Terms, контакт оператора и культурная экспертиза до публичного релиза.
- Сначала Vercel Preview. Production — только после этих проверок.

## Rollback

В Vercel выбрать предыдущее успешное deployment → Promote. Не менять save version без миграции. Обновления SW применяются после закрытия всех старых вкладок; сообщать об этом тестерам. До подключения облака резервная копия — экспорт JSON самим игроком.
