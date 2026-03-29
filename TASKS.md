# StageVault — Задачи

> Трекер задач по фазам разработки. Агенты: обновляйте чекбоксы по мере выполнения.

---

## Фаза 0: Подготовка

- [x] Инициализация монорепо (`packages/api` + `packages/web`)
- [x] Настройка TypeScript, ESLint, Prettier
- [x] Настройка Prisma + PostgreSQL (`docker-compose.dev.yml`)
- [x] Настройка MinIO для локальной разработки
- [x] Настройка Vite + React + Tailwind + React Router
- [x] MobileGuard — заглушка при ширине < 1024px
- [x] Базовый UI-кит: Button, Input, Modal, Card, Badge, Tooltip

## Фаза 1: Аутентификация

- [x] Модель User в Prisma, миграция
- [x] `POST /api/auth/register` (валидация, bcrypt)
- [x] Отправка email подтверждения (Nodemailer)
- [x] `POST /api/auth/verify-email`
- [x] `POST /api/auth/login` (JWT access + refresh)
- [x] `POST /api/auth/refresh`
- [x] `POST /api/auth/forgot-password` + `reset-password`
- [x] Middleware: `authGuard`
- [x] Фронт: LoginPage, RegisterPage, ForgotPasswordPage
- [x] Фронт: AuthStore (Zustand) + ProtectedRoute
- [x] Фронт: ProfilePage (никнейм, смена пароля, тема)

## Фаза 2: Проекты мероприятий

- [x] Модели Event, EventMember в Prisma, миграции
- [x] CRUD `/api/events`
- [x] `GET /api/events` — мои + где участник
- [x] Фронт: DashboardPage (карточки, создание)
- [x] Фронт: EventPage (layout с вкладками)

## Фаза 3: Хранилище файлов

- [x] Модель File в Prisma, миграция
- [x] S3 клиент (MinIO): upload, download, delete
- [x] `POST /api/events/:id/files` (multipart, автокатегоризация)
- [x] `GET /api/events/:id/files` (фильтр по категории)
- [x] `GET /api/events/:id/files/:fid` (presigned URL)
- [x] `PATCH`, `DELETE` для файлов
- [x] Фронт: FileUploader (drag-and-drop + кнопка)
- [x] Фронт: FileCard (превью, действия)
- [x] Фронт: вкладки по категориям
- [x] Фронт: AudioPlayer (плейлист, управление)
- [ ] Фронт: PDFViewer (pdf.js, fullscreen)
- [x] Фронт: ImageViewer (галерея, fullscreen)

## Фаза 4: Сценарий (Timeline)

- [x] Модели TimelineBlock, BlockAttachment в Prisma
- [x] CRUD `/api/events/:id/timeline`
- [x] `PATCH /api/events/:id/timeline/reorder`
- [x] Прикрепление / открепление файлов к блокам
- [x] Фронт: TimelineBlock (название, описание, таймер, чекбокс)
- [x] Фронт: Drag-and-drop сортировка
- [x] Фронт: Timer (обратный отсчёт, start/stop/reset)
- [x] Фронт: ProgressBar (общий прогресс)

## Фаза 5: Команды и Inbox

- [x] Модель Notification в Prisma
- [x] `POST /api/events/:id/members/invite`
- [x] `GET/PATCH/DELETE` для участников
- [x] `GET /api/notifications` + accept/decline
- [x] `GET /api/users/search`
- [x] Middleware: `roleGuard`
- [x] Фронт: TeamPanel (участники, роли)
- [x] Фронт: InviteDialog (поиск + приглашение)
- [x] Фронт: InboxPanel (бейдж, уведомления, кнопки)

## Фаза 6: Режим площадки

- [x] Модель AccessCode в Prisma
- [x] `POST /api/events/:id/access-codes` (генерация + TTL)
- [x] `DELETE` для досрочного отзыва
- [x] `POST /api/access/verify` (публичный, temp JWT)
- [x] Middleware: `codeAuthGuard`
- [x] Фронт: CodeEntryPage (`/go`)
- [x] Фронт: интеграция temp JWT
- [x] Фронт: скрытие запрещённых элементов

## Фаза 7: Пульт ведущего

- [x] Фронт: PresenterPage (layout)
- [x] Фронт: SlideViewer (навигация по PDF)
- [x] Фронт: Fullscreen API (кнопка «На проектор»)
- [x] Фронт: синхронизация с Timeline
- [x] Фронт: быстрый доступ к файлам
- [x] Фронт: горячие клавиши

## Фаза 8: ИИ-ассистент

- [x] Модуль `ai/` на бэкенде: сборка контекста
- [x] `POST /api/events/:id/ai/chat`
- [x] Конфигурация LLM провайдера через `.env`
- [x] Системный промпт
- [x] Фронт: AIChat (сворачиваемая панель)
- [x] Фронт: MessageBubble + история
- [x] Фронт: индикатор загрузки

## Фаза 9: Докеризация и деплой

- [x] Dockerfile для api (multi-stage)
- [x] Dockerfile для web (build + nginx)
- [x] `docker-compose.yml` (api + web + postgres + minio + nginx)
- [x] `nginx.conf`
- [x] `.env.example`
- [x] `scripts/seed.ts`
- [x] README с инструкцией по запуску

## Фаза 10: Тестирование и документация

- [ ] Unit-тесты: auth модуль
- [ ] Unit-тесты: access codes
- [ ] Интеграционные тесты: основные API
- [ ] Фронтенд-тесты: критичные компоненты
