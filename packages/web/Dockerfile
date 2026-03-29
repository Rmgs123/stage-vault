# ========== Stage 1: build ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем root package files для workspace
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/web/package.json packages/web/

# Устанавливаем зависимости
RUN npm ci --workspace=packages/web --include-workspace-root

# Копируем исходный код web
COPY packages/web/ packages/web/

# Собираем фронтенд
RUN npm run build -w packages/web

# ========== Stage 2: nginx ==========
FROM nginx:alpine AS production

# Копируем собранные файлы
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# Удаляем дефолтный конфиг nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем наш nginx конфиг (будет подмонтирован через docker-compose)
# Fallback-конфиг для SPA роутинга
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
