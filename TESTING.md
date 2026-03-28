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

### Фаза 2: Проекты мероприятий

#### 5.2.1 Создание проекта (через UI)

1. Войди в аккаунт → попадёшь на **Dashboard** (`/`)
2. Нажми **«+ Создать проект»**
3. Заполни название (обязательно), описание и дату (опционально)
4. Нажми **«Создать проект»**
5. Должно перенаправить на страницу проекта (`/events/:id`)

#### 5.2.2 Dashboard — список проектов

1. Вернись на главную (`/`)
2. Убедись, что карточка проекта отображается с названием, датой, статусом «черновик»
3. Переключи фильтр **«Мои»** / **«Участвую»** — проект должен быть только в **«Мои»**
4. Попробуй поиск по названию
5. Попробуй сортировку «По дате» / «По названию»

#### 5.2.3 Страница проекта — вкладки

1. Нажми на карточку проекта → откроется страница с вкладками
2. Проверь вкладки: **Файлы**, **Сценарий**, **Команда**, **Настройки**
3. Каждая вкладка пока показывает заглушку с текстом о будущей реализации
4. Кнопка **«<»** должна вернуть на Dashboard

#### 5.2.4 Проверка через API (curl)

```bash
# Получи токен (если ещё нет):
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Создать проект
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Тестовый проект","description":"Описание"}'

# Список проектов
curl http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN"

# Получить проект (подставь id из ответа выше)
curl http://localhost:3000/api/events/<id> \
  -H "Authorization: Bearer $TOKEN"

# Обновить проект
curl -X PATCH http://localhost:3000/api/events/<id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Новое название","status":"ready"}'

# Удалить проект
curl -X DELETE http://localhost:3000/api/events/<id> \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.2.5 Проверка прав доступа

- Только **владелец** может редактировать (`PATCH`) и удалять (`DELETE`) проект
- Участник видит проект в `GET /api/events`, но не может его изменить (получит 403)
- Неавторизованный пользователь получит 401

---

### Фаза 3: Хранилище файлов

#### 5.3.0 Подготовка MinIO (один раз)

MinIO запускается через `docker compose -f docker-compose.dev.yml up`. Бакет создаётся автоматически при первой загрузке файла. Если нет — создай вручную:

1. Открой MinIO Console: **http://localhost:9001**
2. Войди: `minioadmin` / `minioadmin`
3. Создай бакет `stagevault-files`

#### 5.3.1 Загрузка файлов (через UI)

1. Войди в аккаунт → открой проект → вкладка **«Файлы»**
2. Перетащи файл(ы) в зону загрузки или нажми на неё для выбора
3. Файлы должны появиться в соответствующей категории:
   - `.mp3`, `.wav`, `.ogg` → **Музыка** (с плеером)
   - `.pdf`, `.pptx` → **Презентации** (карточки)
   - `.jpg`, `.png`, `.svg` → **Изображения** (карточки с просмотром)
   - `.mp4`, `.webm` → **Видео** (карточки)
   - `.txt`, `.md`, `.doc` → **Документы** (список)
   - всё остальное → **Прочее** (список)

#### 5.3.2 Аудиоплеер

1. Загрузи несколько аудиофайлов (`.mp3`)
2. В секции **Музыка** появится плеер с кнопками Play/Pause, навигацией ▶/◀, громкостью
3. Нажми на трек в списке — он начнёт воспроизводиться
4. Проверь переключение треков, регулировку громкости, mute

#### 5.3.3 Просмотр изображений

1. Загрузи несколько изображений (`.jpg`, `.png`)
2. Наведи на карточку → нажми иконку 👁 (Eye)
3. Должен открыться полноэкранный просмотр с навигацией ◀/▶
4. Нажми `Esc` или `X` для закрытия

#### 5.3.4 Скачивание и удаление

1. Наведи на файл → нажми иконку скачивания → файл должен открыться/скачаться
2. Наведи на файл → нажми иконку удаления (корзина) → подтверди → файл удалится

#### 5.3.5 Проверка через API (curl)

```bash
# Получи токен:
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Загрузить файл (подставь id проекта)
curl -X POST http://localhost:3000/api/events/<id>/files \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test.mp3"

# Список файлов проекта
curl http://localhost:3000/api/events/<id>/files \
  -H "Authorization: Bearer $TOKEN"

# Получить файл (presigned URL)
curl http://localhost:3000/api/events/<id>/files/<fid> \
  -H "Authorization: Bearer $TOKEN"

# Обновить файл (переименовать)
curl -X PATCH http://localhost:3000/api/events/<id>/files/<fid> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Новое название.mp3"}'

# Удалить файл
curl -X DELETE http://localhost:3000/api/events/<id>/files/<fid> \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.3.6 Проверка прав доступа

- **Владелец** и **редактор** могут загружать, редактировать и удалять файлы
- **Зритель** может только просматривать и скачивать (получит 403 при попытке загрузки/удаления)
- Неавторизованный пользователь получит 401

---

### Фаза 4: Сценарий (Timeline)

#### 5.4.1 Создание блоков сценария (через UI)

1. Войди в аккаунт → открой проект → вкладка **«Сценарий»**
2. При пустом сценарии видна заглушка «Сценарий пуст» с кнопкой **«Добавить блок»**
3. Нажми **«Добавить блок»** → в модальном окне заполни:
   - Название (обязательно): например, «Вступительное слово»
   - Описание (опционально): «Приветствие ведущего, правила»
   - Длительность (опционально): 5 (минут)
4. Нажми **«Создать»** → блок появится в списке
5. Создай ещё 3–4 блока с разной длительностью

#### 5.4.2 Прогресс-бар

1. В верхней части вкладки «Сценарий» отображается блок **«Ход мероприятия»**
2. Проверь: количество блоков, общая длительность (мин)
3. Отметь несколько блоков как выполненные (чекбокс) → прогресс-бар обновится

#### 5.4.3 Таймер

1. У блоков с длительностью есть бейдж «X мин» и кнопки Play / Reset
2. Нажми **Play** (▶) на блоке → появится таймер обратного отсчёта
3. Нажми **Pause** (⏸) → таймер остановится
4. Нажми **Reset** (↺) → таймер сбросится
5. При запуске таймера на одном блоке, другие таймеры автоматически останавливаются
6. В прогресс-баре появляется индикатор «Идёт: [название блока]»

#### 5.4.4 Чекбоксы (выполнено)

1. Нажми на кружок (◯) слева от блока → он станет зелёной галочкой (✓)
2. Блок станет полупрозрачным с зачёркнутым текстом
3. Прогресс-бар обновится

#### 5.4.5 Редактирование и удаление

1. Нажми **карандаш** (✏) → модальное окно редактирования → измени и сохрани
2. Нажми **корзину** (🗑) → блок удалится

#### 5.4.6 Drag-and-drop сортировка

1. Наведи на иконку **⠿** (drag handle) слева от блока
2. Зажми и перетащи блок вверх или вниз
3. Порядок обновится и сохранится на сервере

#### 5.4.7 Прикрепление файлов к блокам

1. Предварительно загрузи файлы во вкладке **«Файлы»**
2. Перейди на вкладку **«Сценарий»**
3. У каждого блока есть кнопка **📎 Файл** (Paperclip)
4. Нажми → откроется модальное окно со списком файлов проекта
5. Выбери файл → он появится в виде бейджа под описанием блока
6. Для открепления наведи на бейдж файла → нажми **✕**

#### 5.4.8 Проверка через API (curl)

```bash
# Получи токен:
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Создать блок (подставь id проекта)
curl -X POST http://localhost:3000/api/events/<id>/timeline \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Вступительное слово","description":"Приветствие","durationMin":5}'

# Список блоков
curl http://localhost:3000/api/events/<id>/timeline \
  -H "Authorization: Bearer $TOKEN"

# Обновить блок (подставь bid)
curl -X PATCH http://localhost:3000/api/events/<id>/timeline/<bid> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Обновлённое название","completed":true}'

# Изменить порядок (массив id блоков в нужном порядке)
curl -X PATCH http://localhost:3000/api/events/<id>/timeline/reorder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ids":["<bid2>","<bid1>","<bid3>"]}'

# Прикрепить файл к блоку
curl -X POST http://localhost:3000/api/events/<id>/timeline/<bid>/attachments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"fileId":"<fid>"}'

# Открепить файл от блока
curl -X DELETE http://localhost:3000/api/events/<id>/timeline/<bid>/attachments/<aid> \
  -H "Authorization: Bearer $TOKEN"

# Удалить блок
curl -X DELETE http://localhost:3000/api/events/<id>/timeline/<bid> \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.4.9 Проверка прав доступа

- **Владелец** и **редактор** могут создавать, редактировать, удалять блоки и прикреплять файлы
- **Зритель** может только просматривать сценарий (получит 403 при попытке изменений)
- Неавторизованный пользователь получит 401

---

### Фаза 5–10

> Будет дополняться по мере реализации.

---

---

## 5.5 Фаза 5: Команды и Inbox

### 5.5.1 Поиск пользователей (API)

```bash
# Поиск по никнейму (минимум 2 символа)
curl -s http://localhost:3000/api/users/search?q=al \
  -H "Authorization: Bearer $TOKEN" | jq .

# Должен вернуть массив: [{id, email, nickname}, ...]
```

### 5.5.2 Приглашение участника

```bash
# Получить список участников
curl -s http://localhost:3000/api/events/$EVENT_ID/members \
  -H "Authorization: Bearer $TOKEN" | jq .

# Пригласить (от лица владельца)
curl -s -X POST http://localhost:3000/api/events/$EVENT_ID/members/invite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "TARGET_USER_ID"}' | jq .

# Должен вернуть: {message: "Приглашение отправлено", data: {notificationId: "..."}}
```

### 5.5.3 Уведомления (Inbox)

```bash
# Получить уведомления (от лица приглашённого)
curl -s http://localhost:3000/api/notifications \
  -H "Authorization: Bearer $TOKEN2" | jq .

# Количество непрочитанных
curl -s http://localhost:3000/api/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN2" | jq .

# Принять приглашение
curl -s -X POST http://localhost:3000/api/notifications/$NID/accept \
  -H "Authorization: Bearer $TOKEN2" | jq .

# Отклонить приглашение
curl -s -X POST http://localhost:3000/api/notifications/$NID/decline \
  -H "Authorization: Bearer $TOKEN2" | jq .
```

### 5.5.4 Смена роли участника

```bash
# Изменить роль (owner only)
curl -s -X PATCH http://localhost:3000/api/events/$EVENT_ID/members/$MID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "editor"}' | jq .
```

### 5.5.5 Удаление участника

```bash
# Удалить участника (owner only)
curl -s -X DELETE http://localhost:3000/api/events/$EVENT_ID/members/$MID \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 5.5.6 Тестирование через UI

1. **Регистрация двух пользователей** — зарегистрируйте два аккаунта (User A — владелец, User B — приглашаемый). Оба должны задать никнейм в профиле.

2. **Вкладка «Команда»** — откройте проект User A → вкладка «Команда».
   - Должен отображаться только владелец
   - Кнопка «Пригласить» доступна владельцу

3. **Приглашение пользователя** — нажмите «Пригласить» → в поисковой строке введите никнейм или email User B.
   - Результаты поиска должны появиться после 2+ символов
   - Нажмите «Пригласить» — должно появиться «Отправлено»

4. **Inbox (колокольчик)** — войдите как User B, нажмите на колокольчик в шапке.
   - Должен отображаться бейдж с числом непрочитанных уведомлений
   - Уведомление: «User A пригласил вас в проект»
   - Кнопки «Принять» / «Отклонить»

5. **Принять приглашение** — нажмите «Принять».
   - Должен перенаправить на страницу проекта
   - Бейдж должен исчезнуть (или уменьшиться)

6. **Проверка списка участников** — откройте вкладку «Команда» того же проекта.
   - Должен быть виден User B как «Зритель»

7. **Смена роли** (от лица владельца) — кликните на роль участника → выберите «Редактор».
   - Роль должна обновиться
   - User B получит уведомление об изменении роли

8. **Удаление участника** — нажмите кнопку удаления (иконка UserMinus).
   - Участник исчезнет из списка
   - User B получит уведомление об удалении

9. **Проверка прав доступа** — войдите как User B (зритель).
   - На вкладке «Команда» не должно быть кнопки «Пригласить»
   - Смена ролей недоступна
   - Вкладка «Настройки» видна только владельцу

---

## 6. Git: коммит и пуш

```bash
git add -A
git commit -m "feat: Phase 5 — teams, invites, inbox (notifications, role management)"
git push origin main
```
