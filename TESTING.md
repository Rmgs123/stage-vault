# StageVault — Инструкция по запуску и тестированию

> Пошаговое руководство: как поднять окружение, запустить проект и проверить каждую фазу.

---

## 1. Подготовка окружения (один раз)

### 1.1 Создать `.env` файл

```bash
# Из корня проекта:
cp .env.example .env
cp .env.example packages/api/.env
```

> Prisma и dotenv загружают `.env` из разных путей.
> Убедись, что файл есть и в корне, и в `packages/api/`.

### 1.2 Установить зависимости

```bash
npm install
```

---

## 2. Запуск (3 терминала)

### Терминал 1 — Docker (PostgreSQL + MinIO)

```bash
docker compose -f docker-compose.dev.yml up
```

Дождись строк:
- `database system is ready to accept connections`
- `API: http://...` (MinIO console)

### Терминал 2 — Backend (API)

```bash
# Применить схему БД + сгенерировать Prisma Client:
cd packages/api
npx prisma db push

# Запустить сервер:
cd ../..
npm run dev:api
```

Проверка — открой в браузере или выполни:
```bash
curl http://localhost:3000/api/health
# Ожидаемый ответ: {"status":"ok","timestamp":"..."}
```

### Терминал 3 — Frontend (Web)

```bash
npm run dev:web
```

Открой: **http://localhost:5173**

---

## 3. Остановка и очистка

### Остановить серверы

- В терминалах 2 и 3 нажми `Ctrl+C`

### Остановить Docker (сохранить данные)

```bash
docker compose -f docker-compose.dev.yml down
```

### Остановить Docker + удалить все данные

```bash
docker compose -f docker-compose.dev.yml down -v
rm -rf .docker-data
```

> После `down -v` при следующем запуске нужно заново делать `npx prisma db push`.

---

## 4. Полезные команды

### Prisma Studio (GUI для базы данных)

```bash
cd packages/api
npx prisma studio
```

Откроется на **http://localhost:5555** — можно смотреть и редактировать записи в БД.

### Подключение к PostgreSQL напрямую

```bash
docker exec -it stagevault-postgres psql -U stagevault -d stagevault
```

Полезные SQL-команды:
```sql
-- Показать все таблицы
\dt

-- Показать всех пользователей
SELECT id, email, nickname, "emailVerified", theme FROM "User";

-- Выход
\q
```

### Сброс базы данных

```bash
cd packages/api
npx prisma db push --force-reset
```

> Удалит все данные и пересоздаст таблицы.

---

## 5. Проверка по фазам

---

### Фаза 1: Аутентификация

#### 5.1.1 Регистрация

1. Открой **http://localhost:5173** → вкладка **«Регистрация»**
2. Заполни email, пароль (минимум 8 символов), никнейм (опционально)
3. Нажми «Создать аккаунт»
4. Должно появиться сообщение: *«Регистрация прошла успешно. Проверьте почту для подтверждения.»*

#### 5.1.2 Верификация email (вручную, т.к. SMTP не настроен)

В dev-режиме ссылка верификации выводится в **терминал бэкенда** (Терминал 2). Выглядит так:

```
[DEV] Verification email for user@example.com:
http://localhost:5173/verify-email?token=eyJhbG...
```

**Вариант А** — открой эту ссылку в браузере.

**Вариант Б** — подтверди напрямую в базе данных:

```bash
docker exec -it stagevault-postgres psql -U stagevault -d stagevault -c "UPDATE \"User\" SET \"emailVerified\" = true WHERE email = 'твой@email.com';"
```

Или через Prisma Studio:
```bash
cd packages/api && npx prisma studio
```
Открой таблицу `User` → нажми на запись → измени `emailVerified` на `true` → сохрани.

#### 5.1.3 Вход

1. Перейди на вкладку **«Вход»**
2. Введи email и пароль
3. Должно перенаправить на главную страницу (Dashboard)

#### 5.1.4 Профиль

1. Нажми на иконку профиля в правом верхнем углу → **«Профиль»**
2. Проверь:
   - Отображается email (только чтение)
   - Можно изменить никнейм
   - Можно сменить пароль (текущий + новый)
   - Можно переключить тему (light/dark)
3. После смены никнейма — убедись, что изменение сохранилось (обнови страницу)

#### 5.1.5 Смена пароля

1. В разделе «Безопасность» на странице профиля
2. Введи текущий пароль и новый пароль
3. Должно появиться сообщение об успехе
4. Выйди и войди с новым паролем

#### 5.1.6 Восстановление пароля

1. На странице входа нажми **«Забыли пароль?»**
2. Введи email
3. В терминале бэкенда появится ссылка:
   ```
   [DEV] Password reset email for user@example.com:
   http://localhost:5173/reset-password?token=eyJhbG...
   ```
4. Открой ссылку → введи новый пароль → сохрани
5. Войди с новым паролем

#### 5.1.7 Проверка через API (curl)

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678","nickname":"testuser"}'

# Верификация email в БД
docker exec -it stagevault-postgres psql -U stagevault -d stagevault \
  -c "UPDATE \"User\" SET \"emailVerified\" = true WHERE email = 'test@test.com';"

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678"}'

# Сохрани accessToken из ответа, затем:
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <accessToken>"
```

---

### Фаза 2–10

> Будет дополняться по мере реализации.
