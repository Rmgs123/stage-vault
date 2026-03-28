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

- [ ] Модели TimelineBlock, BlockAttachment в Prisma
- [ ] CRUD `/api/events/:id/timeline`
- [ ] `PATCH /api/events/:id/timeline/reorder`
- [ ] Прикрепление / открепление файлов к блокам
- [ ] Фронт: TimelineBlock (название, описание, таймер, чекбокс)
- [ ] Фронт: Drag-and-drop сортировка
- [ ] Фронт: Timer (обратный отсчёт, start/stop/reset)
- [ ] Фронт: ProgressBar (общий прогресс)

## Фаза 5: Команды и Inbox

- [ ] Модель Notification в Prisma
- [ ] `POST /api/events/:id/members/invite`
- [ ] `GET/PATCH/DELETE` для участников
- [ ] `GET /api/notifications` + accept/decline
- [ ] `GET /api/users/search`
- [ ] Middleware: `roleGuard`
- [ ] Фронт: TeamPanel (участники, роли)
- [ ] Фронт: InviteDialog (поиск + приглашение)
- [ ] Фронт: InboxPanel (бейдж, уведомления, кнопки)

## Фаза 6: Режим площадки

- [ ] Модель AccessCode в Prisma
- [ ] `POST /api/events/:id/access-codes` (генерация + TTL)
- [ ] `DELETE` для досрочного отзыва
- [ ] `POST /api/access/verify` (публичный, temp JWT)
- [ ] Middleware: `codeAuthGuard`
- [ ] Фронт: CodeEntryPage (`/go`)
- [ ] Фронт: интеграция temp JWT
- [ ] Фронт: скрытие запрещённых элементов

## Фаза 7: Пульт ведущего

- [ ] Фронт: PresenterPage (layout)
- [ ] Фронт: SlideViewer (навигация по PDF)
- [ ] Фронт: Fullscreen API (кнопка «На проектор»)
- [ ] Фронт: синхронизация с Timeline
- [ ] Фронт: быстрый доступ к файлам
- [ ] Фронт: горячие клавиши

## Фаза 8: ИИ-ассистент

- [ ] Модуль `ai/` на бэкенде: сборка контекста
- [ ] `POST /api/events/:id/ai/chat`
- [ ] Конфигурация LLM провайдера через `.env`
- [ ] Системный промпт
- [ ] Фронт: AIChat (сворачиваемая панель)
- [ ] Фронт: MessageBubble + история
- [ ] Фронт: индикатор загрузки

## Фаза 9: Докеризация и деплой

- [ ] Dockerfile для api (multi-stage)
- [ ] Dockerfile для web (build + nginx)
- [ ] `docker-compose.yml` (api + web + postgres + minio + nginx)
- [ ] `nginx.conf`
- [ ] `.env.example`
- [ ] `scripts/seed.ts`
- [ ] README с инструкцией по запуску

## Фаза 10: Тестирование и документация

- [ ] Unit-тесты: auth модуль
- [ ] Unit-тесты: access codes
- [ ] Интеграционные тесты: основные API
- [ ] Фронтенд-тесты: критичные компоненты
- [ ] Пояснительная записка к курсовой
- [ ] Скриншоты интерфейса
