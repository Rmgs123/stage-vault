import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import dotenv from 'dotenv'
import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import eventsRoutes from './modules/events/events.routes.js'
import filesRoutes from './modules/files/files.routes.js'
import timelineRoutes from './modules/timeline/timeline.routes.js'
import teamsRoutes from './modules/teams/teams.routes.js'
import inboxRoutes from './modules/inbox/inbox.routes.js'
import accessRoutes from './modules/access/access.routes.js'
import aiRoutes from './modules/ai/ai.routes.js'

dotenv.config({ path: '../../.env' })

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
})

await app.register(multipart, {
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
})

// Routes
await app.register(authRoutes)
await app.register(usersRoutes)
await app.register(eventsRoutes)
await app.register(filesRoutes)
await app.register(timelineRoutes)
await app.register(teamsRoutes)
await app.register(inboxRoutes)
await app.register(accessRoutes)
await app.register(aiRoutes)

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
