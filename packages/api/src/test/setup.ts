import dotenv from 'dotenv'

// Загружаем .env для тестов (если существует)
dotenv.config({ path: '../../.env' })

// Устанавливаем тестовые значения по умолчанию
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-32-chars-long!'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-32-chars-long'
process.env.NODE_ENV = 'test'
