import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { authGuard } from '../../middleware/auth.js'
import { env } from '../../config/env.js'

// ---------- Zod schemas ----------

const chatBodySchema = z.object({
  message: z.string().min(1, 'Сообщение не может быть пустым').max(4000, 'Сообщение слишком длинное'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(50).optional().default([]),
})

// ---------- Context assembly ----------

async function buildEventContext(eventId: string): Promise<string> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      owner: { select: { nickname: true, email: true } },
      files: {
        select: {
          id: true,
          name: true,
          originalName: true,
          category: true,
          mimeType: true,
          size: true,
          note: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      blocks: {
        select: {
          id: true,
          title: true,
          description: true,
          durationMin: true,
          sortOrder: true,
          completed: true,
          attachments: {
            select: {
              file: {
                select: { name: true, category: true },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { members: true } },
    },
  })

  if (!event) return ''

  const lines: string[] = []

  // Event metadata
  lines.push(`# Мероприятие: ${event.title}`)
  if (event.description) lines.push(`Описание: ${event.description}`)
  if (event.date) lines.push(`Дата: ${new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`)
  lines.push(`Статус: ${event.status}`)
  lines.push(`Организатор: ${event.owner.nickname || event.owner.email}`)
  lines.push(`Участников: ${event._count.members + 1}`)
  lines.push('')

  // Files
  if (event.files.length > 0) {
    lines.push(`## Файлы (${event.files.length})`)
    const categoryLabels: Record<string, string> = {
      music: 'Музыка',
      presentation: 'Презентация',
      image: 'Изображение',
      video: 'Видео',
      document: 'Документ',
      other: 'Прочее',
    }
    for (const file of event.files) {
      const cat = categoryLabels[file.category] || file.category
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      lines.push(`- [${cat}] ${file.name} (${file.originalName}, ${sizeMb} МБ, ${file.mimeType})`)
      if (file.note) lines.push(`  Заметка: ${file.note}`)
    }
    lines.push('')
  }

  // Timeline
  if (event.blocks.length > 0) {
    const totalMin = event.blocks.reduce((s, b) => s + (b.durationMin || 0), 0)
    const completedCount = event.blocks.filter((b) => b.completed).length
    lines.push(`## Сценарий (${event.blocks.length} блоков, ~${totalMin} мин, выполнено ${completedCount}/${event.blocks.length})`)
    for (const block of event.blocks) {
      const status = block.completed ? '[x]' : '[ ]'
      const dur = block.durationMin ? ` (${block.durationMin} мин)` : ''
      lines.push(`${block.sortOrder + 1}. ${status} ${block.title}${dur}`)
      if (block.description) lines.push(`   ${block.description}`)
      if (block.attachments.length > 0) {
        const attached = block.attachments.map((a) => a.file.name).join(', ')
        lines.push(`   Прикреплённые файлы: ${attached}`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ---------- System prompt ----------

const SYSTEM_PROMPT = `Ты — ИИ-ассистент платформы StageVault. Ты помогаешь организаторам мероприятий анализировать контент и сценарий.

Твои возможности:
- Отвечать на вопросы по файлам, сценарию и метаданным мероприятия
- Указывать на возможные ошибки и несоответствия
- Считать длительность, количество элементов, давать сводки
- Предлагать улучшения структуры сценария

Ограничения:
- Ты не можешь редактировать файлы или сценарий
- Ты видишь только метаданные файлов (имя, тип, размер), но не их содержимое
- Отвечай кратко и по делу
- Используй русский язык
- Если информации недостаточно, скажи об этом честно`

// ---------- LLM call ----------

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function callLLM(messages: LLMMessage[]): Promise<string> {
  if (!env.AI_API_KEY) {
    throw new Error('AI_API_KEY не настроен')
  }

  if (env.AI_PROVIDER === 'anthropic') {
    return callAnthropic(messages)
  }

  return callOpenAI(messages)
}

async function callOpenAI(messages: LLMMessage[]): Promise<string> {
  const baseUrl = env.AI_BASE_URL.replace(/\/+$/, '')
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error: ${res.status} ${err}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0]?.message?.content || ''
}

async function callAnthropic(messages: LLMMessage[]): Promise<string> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content || ''
  const nonSystemMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      system: systemMsg,
      messages: nonSystemMessages,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} ${err}`)
  }

  const data = await res.json() as {
    content: Array<{ type: string; text: string }>
  }
  return data.content.find((c) => c.type === 'text')?.text || ''
}

// ---------- Routes ----------

export default async function aiRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  // POST /api/events/:id/ai/chat
  app.post('/api/events/:id/ai/chat', async (request, reply) => {
    const { id } = request.params as { id: string }

    // Check access: either owner/member or code access to this event
    if (request.isCodeAccess) {
      if (request.codeEventId !== id) {
        return reply.code(403).send({ message: 'Нет доступа к этому мероприятию' })
      }
    } else {
      const userId = request.userId!
      const event = await prisma.event.findUnique({
        where: { id },
        select: { ownerId: true },
      })

      if (!event) {
        return reply.code(404).send({ message: 'Мероприятие не найдено' })
      }

      if (event.ownerId !== userId) {
        const membership = await prisma.eventMember.findUnique({
          where: { eventId_userId: { eventId: id, userId } },
        })
        if (!membership) {
          return reply.code(403).send({ message: 'Нет доступа к этому мероприятию' })
        }
      }
    }

    // Validate body
    const parsed = chatBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({
        message: parsed.error.errors[0]?.message || 'Ошибка валидации',
      })
    }

    const { message, history } = parsed.data

    // Build context
    const context = await buildEventContext(id)

    // Assemble messages
    const llmMessages: LLMMessage[] = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\n--- Контекст мероприятия ---\n${context}` },
      ...history.map((h) => ({ role: h.role as 'system' | 'user' | 'assistant', content: h.content })),
      { role: 'user', content: message },
    ]

    try {
      const answer = await callLLM(llmMessages)
      return reply.send({
        data: { role: 'assistant' as const, content: answer },
        message: 'ok',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка ИИ-сервиса'
      app.log.error(err, 'AI chat error')

      if (errorMessage.includes('AI_API_KEY не настроен')) {
        return reply.code(503).send({
          message: 'ИИ-ассистент не настроен. Обратитесь к администратору.',
        })
      }

      return reply.code(502).send({
        message: 'Не удалось получить ответ от ИИ. Попробуйте позже.',
      })
    }
  })
}
