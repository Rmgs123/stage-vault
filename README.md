<p align="center">
  <img src="https://img.shields.io/badge/StageVault-За%20кулисами%20вашего%20мероприятия-8B5CF6?style=for-the-badge&logoColor=white" alt="StageVault" />
</p>

<h1 align="center">StageVault</h1>

<p align="center">
  <b>Всё для вашего мероприятия — в одном месте.</b><br/>
  Загрузите. Подготовьте. Проведите.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/статус-в%20разработке-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/платформа-web-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/лицензия-MIT-green?style=flat-square" />
</p>

---

## О проекте

**StageVault** — облачная платформа для организаторов мероприятий.

> *Собрать всю музыку, презентации, сценарии и файлы мероприятия в одном месте — и получить к ним доступ на площадке за 5 секунд, без флешек, паролей и лишних нервов.*

---

## Что умеет

- **Хранилище файлов** — музыка, презентации, видео, документы с автокатегоризацией
- **Доступ по коду** — 6-символьный код, без логина на чужом устройстве
- **Пульт ведущего** — плеер, показ презентаций, сценарий с таймерами
- **Команды** — совместная подготовка мероприятия
- **ИИ-ассистент** — проверка контента, ответы на вопросы по проекту

---

## Технологии

| Слой | Технология |
|------|-----------|
| Фронтенд | React 18, TypeScript, Tailwind CSS, Zustand, Vite |
| Бэкенд | Node.js, Fastify, Prisma, Zod |
| БД | PostgreSQL 16 |
| Хранилище | MinIO (S3-совместимое) |
| Прокси | Nginx |
| Контейнеризация | Docker, Docker Compose |

---

## Быстрый старт (Docker)

### Требования

- [Docker](https://docs.docker.com/get-docker/) и [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Клонировать репозиторий

```bash
git clone https://github.com/your-user/stage-vault.git
cd stage-vault
```

### 2. Создать `.env`

```bash
cp .env.example .env
```

Отредактируйте `.env` — как минимум измените:
- `JWT_ACCESS_SECRET` и `JWT_REFRESH_SECRET` — случайные строки 32+ символов
- `AI_API_KEY` — ключ OpenAI / совместимого провайдера (опционально)
- `SMTP_*` — настройки почты (опционально, без них email-подтверждение не работает)

### 3. Запустить

```bash
docker compose up -d --build
```

Это поднимет 5 сервисов:
- **PostgreSQL** — база данных
- **MinIO** — файловое хранилище
- **API** — бэкенд (Fastify)
- **Web** — фронтенд (React + Nginx)
- **Nginx** — reverse proxy

Приложение будет доступно на **http://localhost** (порт 80).

### 4. Заполнить тестовыми данными (опционально)

```bash
docker compose exec api npx tsx /app/scripts/seed.ts
```

Тестовые аккаунты (пароль: `password123`):
| Email | Роль |
|-------|------|
| admin@stage-vault.ru | Владелец квиза и мастер-класса |
| host@stage-vault.ru | Владелец концерта, редактор квиза |
| member@stage-vault.ru | Участник-наблюдатель |

Коды доступа: `QUIZ42`, `SHOW99`

### 5. Остановить

```bash
docker compose down
```

С удалением данных:
```bash
docker compose down -v
```

---

## Разработка (без Docker)

### Требования

- Node.js 20+
- npm 10+
- PostgreSQL 16
- MinIO (или S3-совместимое хранилище)

### Запуск инфраструктуры

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Установка зависимостей

```bash
npm install
```

### Настройка БД

```bash
cp .env.example .env
# Отредактируйте .env
npx prisma db push --schema=packages/api/prisma/schema.prisma
```

### Запуск

```bash
# В отдельных терминалах:
npm run dev:api
npm run dev:web
```

- API: http://localhost:3000
- Web: http://localhost:5173

### Seed (тестовые данные)

```bash
npx tsx scripts/seed.ts
```

---

## Структура проекта

```
stage-vault/
├── packages/
│   ├── api/          # Fastify бэкенд
│   │   ├── prisma/   # Схема и миграции
│   │   └── src/
│   │       └── modules/  # auth, events, files, timeline, teams, inbox, access, ai
│   └── web/          # React фронтенд
│       └── src/
│           ├── components/
│           ├── pages/
│           └── store/
├── nginx/            # Конфигурация Nginx
├── scripts/          # Seed и утилиты
├── docker-compose.yml      # Продакшен стек
└── docker-compose.dev.yml  # Только PostgreSQL + MinIO
```

---

## Модули

| Модуль | Статус |
|--------|--------|
| Аутентификация | Готов |
| Хранилище файлов | Готов |
| Сценарий (Timeline) | Готов |
| Команды и приглашения | Готов |
| Доступ по коду | Готов |
| Пульт ведущего | Готов |
| ИИ-ассистент | Готов |
| Докеризация | Готов |

---

<p align="center">
  <b>StageVault</b> — за кулисами вашего мероприятия.
</p>
