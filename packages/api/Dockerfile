# ========== Stage 1: build ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем root package files для workspace
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/api/package.json packages/api/
COPY packages/api/tsconfig.json packages/api/
COPY packages/api/prisma packages/api/prisma/

# Устанавливаем зависимости
RUN npm ci --workspace=packages/api --include-workspace-root

# Копируем исходный код api
COPY packages/api/src packages/api/src/

# Генерируем Prisma Client + компилируем TypeScript
RUN npx prisma generate --schema=packages/api/prisma/schema.prisma \
    && npm run build -w packages/api

# ========== Stage 2: production ==========
FROM node:20-alpine AS production

WORKDIR /app

# Копируем root package files
COPY package.json package-lock.json ./
COPY packages/api/package.json packages/api/

# Ставим только production зависимости
RUN npm ci --workspace=packages/api --include-workspace-root --omit=dev

# Копируем Prisma schema + сгенерированный клиент
COPY packages/api/prisma packages/api/prisma/
COPY --from=builder /app/node_modules/.prisma node_modules/.prisma

# Копируем скомпилированный код
COPY --from=builder /app/packages/api/dist packages/api/dist/

# Копируем seed-скрипт (если нужен)
COPY scripts/ scripts/

EXPOSE 3000

# Запуск: миграция БД + старт сервера
CMD ["sh", "-c", "npx prisma db push --schema=packages/api/prisma/schema.prisma --skip-generate && node packages/api/dist/index.js"]
