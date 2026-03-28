import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'

dotenv.config({ path: '../../.env' })

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
})

// Routes
await app.register(authRoutes)
await app.register(usersRoutes)

app.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const port = Number(process.env.API_PORT) || 3000

try {
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`API server running on http://localhost:${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
