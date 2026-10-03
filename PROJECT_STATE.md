# Файл проекта — «Маршрут без фильтра»

**Обновлено:** 2026-10-03. **Версия:** 0.1.0 — первый играбельный прототип.
**Репозиторий:** totalsite8/game1. **Ветка сессии:** `arena/01a1030b-game1`.

## Начало новой сессии

1. Прочитать этот файл, README и `docs/ADR-001.md`.
2. Прочитать оригинальный `GAME_BRIEF_KATYA_OLYA_VIETNAM_RU.md` (676 строк): он определяет весь большой проект, а не описание уже реализованной версии.
3. Проверить `git status`, `package.json` и актуальный статус Vercel/GitHub, не считать URL предпросмотра постоянным.
4. `npm ci`, `npm test`, `npm run build`; запустить preview для браузерной проверки.
5. Продолжать только на привязанной к сессии ветке. Не хранить токены в чате или Git.

## Запрос владельца

Создать игру по брифу, размещать проект в GitHub с деплоем Vercel, учитывать телефоны/планшеты/компьютеры, вести файл передачи контекста, заложить возможность сопровождения до 2030 года.

## Сделано

- Бриф подтянут с `origin/main` fast-forward в рабочую ветку.
- TypeScript, React, Babylon.js, Vite; зафиксированные версии, lockfile.
- Главный экран с оригинальной AI-иллюстрацией, локальными шрифтами, адаптивной вёрсткой.
- Три процедурных диорамы (отель, рынок, набережная); камера orbit, tap-to-move, WASD/стрелки, две фигурки-героини, взаимодействие с NPC через click/tap или DOM-кнопку.
- Эпизод «Карта без адреса»: 12 выборов, последствия для доверия/безопасности/денег/батареи/времени/фактов, журнал, карта последовательности.
- **Персонажи доведены до объёма 0.1.0+:** библия психологии/биографии/речи/противоречий (Катя, Оля, 6 вьетнамских NPC, 3 горожанина), культурная конкретика Дананга/Хойана, 4 карточки travel-safety.
- Процедурные персонажи заменили маркеры: `Humanoid` строит фигуру по `LookProfile` (телосложение, причёска, низ, рукав, реквизит, осанка) в 3 уровнях детализации, с лицом (глаза/веки/брови/нос/губы/уши/волосы), походкой, позами, дыханием, морганием, взглядом на собеседника и репликой «под нос»; силуэт и анимация откалиброваны по измерениям.
- Четыре исхода: честный маршрут, безопасность, сенсация, восстановленное доверие. Не шесть production-финалов из брифа.
- RU/EN для игрового интерфейса и сценария.
- IndexedDB autosave; экспорт JSON, импорт через валидацию и replay, удаление/рестарт с подтверждением. Запись сериализована; ошибки не выдаются за успех.
- 16+ предупреждение, мягкий пересказ напряжённой сцены, крупный текст, text-only, low-resolution renderer; HTML dialog/keyboard controls.
- PWA manifest + PNG/SVG icons, hash-versioned precache, offline после первой успешной загрузки. Кэш API запрещён. Все шрифты локальные.
- `/api/health`; HMAC helper Telegram (без demo bypass); cloud endpoint fail-closed (503).
- Vercel config + security headers, .env.example без секретов, CI, Dependabot, Prettier.
- Технические документы, deployment checklist и текущий файл.

## Проверено 2026-10-03

- `npm ci --ignore-scripts`: успешно (также первоначальная установка через npm 11).
- `npm run typecheck`, `npm run build`, `npm run format:check`: успешно.
- `npm test`: **5 тестов**, в том числе обход всех достижимых путей и всех четырёх исходов, проверка импортов/границ, HMAC positive/negative/expiry.
- Production Playwright: **5 тестов успешно**: полный путь в 3D + журнал + reload; 390px RU/EN text mode + export/import/delete; API; offline reload + следующий выбор; 320/768/1024px + искусственный отказ WebGL + Escape.
- Скриншоты: `docs/home-desktop.png`, `docs/home-mobile.png`, `docs/game-desktop.png`, `docs/game-characters.png` (крупный план фигур). Именно procedural 3D, не художественная обложка, является текущей игровой графикой.
- Процедурные персонажи измерены headless-пробами: рост 7,5 голов, ширина плеч ~0,40 м, таза ~0,30 м (поправлено с 0,62/0,55), ступни на земле (y≈0,067 при GROUND_Y 0,063), шаг 0,72·H, противофаза ног (остаток 0,03 рад), дыхание ~17 мм, перенос веса ~15 мм, моргание и взгляд на собеседника работают; клик по NPC открывает диалог. Персонажи светлее вертикалей сцены, пересветов нет.
- `npm audit`: 0 известных уязвимостей на момент проверки.
- Исправлен найденный offline-баг: cache.match учитывал `Vary: Origin` у module assets; для своих immutable precache URL применяется `ignoreVary`.
- **Не проверено:** реальные iPhone/Safari, Android GPU, Telegram WebView, gamepad, 30/60 FPS на целевых телефонах, screen reader/контраст комплексно, культурная экспертиза. Viewport-тест — не тест реального телефона.

## GitHub

- Код отправлен в `arena/01a1030b-game1`.
- Pull request персонажей: https://github.com/totalsite8/game1/pull/4 (открыт).
- Ранее: PR https://github.com/totalsite8/game1/pull/1 — смержен, коммит `6956012`.
- GitHub Actions проверил установку, форматирование, unit, build, audit и production browser tests: https://github.com/totalsite8/game1/actions/runs/37143668410 — success.
- После первого успешного CI workflow обновлён: актуальные actions v7 закреплены по SHA, runner ubuntu-24.04 закреплён против неожиданной миграции ubuntu-latest. Проверить последнюю повторную сборку при продолжении.

## Деплой — блокер доступа

- Arena preview: dev port 5173; production preview port 4173.
- `vercel whoami`: Logged out.
- `vercel deploy --temporary --yes`: сервис отклонил temporary deployment; нет credentials.
- **Публичного deployment Vercel пока нет.** Нельзя выдавать Arena preview за Vercel production.
- Владелец должен импортировать `totalsite8/game1` в своём Vercel, выбрать рабочую ветку, Node 22, Build `npm run build`, Output `dist`, Install `npm ci`. Переменные для гостевой версии не нужны. Подробно: `docs/DEPLOYMENT.md`.
- После подключения владельцем: проверить реальный URL, rewrites API, CSP, PWA, cache и сохранение. Не запрашивать токены в чате.

## Карта кода

| Путь                                      | Назначение                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `src/App.tsx`, `src/styles.css`           | Главное меню, игра, модальные экраны, responsive                              |
| `src/packages/story/story.ts`             | Локализованные beats, choices, observations, endings                          |
| `src/packages/game-core/core.ts`          | Чистая функция choose, restore/replay, ending                                 |
| `src/packages/platform/storage.ts`        | IndexedDB и очередь записи/удаления                                           |
| `src/packages/render-babylon/World.tsx`   | Рендер мира/ input; cleanup и pause                                           |
| `src/packages/render-babylon/humanoid.ts` | Процедурная фигура персонажа: пропорции, лицо, позы, походка, дыхание, взгляд |
| `src/packages/content/*`                  | Библия персонажей + LookProfile для 3D; каталог 36 идей — НЕ 36 игр           |
| `src/packages/validation/schemas.ts`      | Типы каталога, схема initData                                                 |
| `api/*`                                   | health, HMAC verification, отключённая синхронизация                          |
| `scripts/build-sw.mjs`                    | Генерация offline worker после build                                          |
| `tests/core.test.ts`, `tests/browser/*`   | Unit + браузерные проверки                                                    |

## Осознанные ограничения

- Это короткий прототип, не 20–30 минут утверждённого vertical slice и не игра на 6–10 часов. Длительность ещё не измерена на игроках.
- Только WebGL renderer. WebGPU, GLB/KTX2/LOD, физика/коллизии, gamepad/joystick, анимации/лица, музыка/озвучка не реализованы.
- Управление героиней пока не влияет на доступность реплик; нет индивидуальных abilities. Нет свободного backtracking по карте.
- Показатели бюджета/времени/батареи меняются, но пока нет отдельного состояния истощения/recovery-геймплея.
- Персонаж на сцене — процедурная стилизованная фигура, не production-модель с лицевой анимацией/артикуляцией; диалоги по-прежнему текстовые, без озвучки и мимики уровня AAA.
- Полный monorepo не создан: модульные папки внутри одного приложения. Workspace extraction при появлении bot/admin.
- Нет managed DB, сессий, rate limit, sync conflict UI, Telegram SDK/бота, store wrapper. `/telegram` — тот же гостевой web client, не интегрированная Mini App.
- HMAC endpoint не авторизует пользователя на сервере и не выдаёт cookies. Нельзя подключить облако, доверяя просто присланным slot/stats.
- Справочная безопасность в неиспользуемом draft-контенте требует редактора/носителя; не использовать её как юридическую/туристическую рекомендацию.

## Следующие действия (приоритет)

1. **P0** — подключение Vercel владельцем, проверка Preview, CI на GitHub.
2. **P0** — согласовать художественное направление прототипа и эпизод; культурный/safeguarding review.
3. **P1** — настоящее 20–30-минутное прохождение, исследуемые предметы, условия героинь, восстановление после ошибок; 6 финалов из ТЗ.
4. **P1** — production GLB персонажей/локаций, анимации, LOD/KTX2; benchmark WebGPU vs WebGL2 на реальных устройствах; ресурсы по локациям.
5. **P1** — Telegram adapter + официальный бот через владельца, безопасные server sessions, managed DB, rate limits и replay-validation всех переходов.
6. **P2** — миграции сохранений и conflict UI, editor/admin с auth, native wrappers только после mobile QA.
7. Еженедельные проверки зависимостей; ежеквартальные тесты актуальных браузеров. «2030» — план сопровождения, не безусловная гарантия.

## Проверки для повторения

```sh
npm ci
npm run format:check
npm test
npm run build
npm audit --audit-level=moderate
npm run preview
# отдельный терминал, Linux:
node scripts/browser-libs.mjs
TEST_URL=http://localhost:4173 LD_LIBRARY_PATH=/tmp/route-browser-libs/lib npm run test:e2e
```

В sandbox прямой download Chromium с CDN не был доступен. Использован `@sparticuz/chromium` из npm и его bundled shared libraries. Это зависимость тестов, не клиента. Папка `/tmp` не сохраняется между средами; helper восстанавливает библиотеки.
