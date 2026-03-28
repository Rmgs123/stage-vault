import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { authGuard } from '../../middleware/auth.js'

const createBlockSchema = z.object({
  title: z.string().min(1, 'Название блока обязательно').max(200),
  description: z.string().max(5000).optional(),
  durationMin: z.number().int().min(0).max(1440).optional(),
})

const updateBlockSchema = z.object({
  title: z.string().min(1, 'Название блока обязательно').max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  durationMin: z.number().int().min(0).max(1440).nullable().optional(),
  completed: z.boolean().optional(),
})

const reorderSchema = z.object({
  ids: z.array(z.string().uuid('Некорректный ID блока')).min(1, 'Список блоков не может быть пустым'),
})

const attachFileSchema = z.object({
  fileId: z.string().uuid('Некорректный ID файла'),
})

async function checkEventAccess(eventId: string, userId: string): Promise<{ allowed: boolean; isOwnerOrEditor: boolean }> {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return { allowed: false, isOwnerOrEditor: false }

  if (event.ownerId === userId) return { allowed: true, isOwnerOrEditor: true }

  const member = await prisma.eventMember.findUnique({
    where: { eventId_userId: { eventId, userId } },
  })
  if (!member) return { allowed: false, isOwnerOrEditor: false }

  return { allowed: true, isOwnerOrEditor: member.role === 'editor' }
}

export default async function timelineRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  // GET /api/events/:id/timeline — list blocks with attachments
  app.get('/api/events/:id/timeline', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const { allowed } = await checkEventAccess(id, userId)
    if (!allowed) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }

    const blocks = await prisma.timelineBlock.findMany({
      where: { eventId: id },
      include: {
        attachments: {
          include: {
            file: {
              select: {
                id: true,
                name: true,
                originalName: true,
                category: true,
                mimeType: true,
                size: true,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return blocks.map((block) => ({
      id: block.id,
      eventId: block.eventId,
      title: block.title,
      description: block.description,
      durationMin: block.durationMin,
      sortOrder: block.sortOrder,
      completed: block.completed,
      createdAt: block.createdAt,
      attachments: block.attachments.map((a) => ({
        id: a.id,
        fileId: a.file.id,
        name: a.file.name,
        originalName: a.file.originalName,
        category: a.file.category,
        mimeType: a.file.mimeType,
        size: a.file.size,
      })),
    }))
  })

  // POST /api/events/:id/timeline — create block
  app.post('/api/events/:id/timeline', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const { allowed, isOwnerOrEditor } = await checkEventAccess(id, userId)
    if (!allowed) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }
    if (!isOwnerOrEditor) {
      return reply.code(403).send({ message: 'Недостаточно прав для редактирования сценария' })
    }

    const parsed = createBlockSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { title, description, durationMin } = parsed.data

    // Get next sort order
    const lastBlock = await prisma.timelineBlock.findFirst({
      where: { eventId: id },
      orderBy: { sortOrder: 'desc' },
    })
    const nextOrder = (lastBlock?.sortOrder ?? -1) + 1

    const block = await prisma.timelineBlock.create({
      data: {
        eventId: id,
        title,
        description: description || null,
        durationMin: durationMin ?? null,
        sortOrder: nextOrder,
      },
    })

    return reply.code(201).send({
      ...block,
      attachments: [],
    })
  })

  // PATCH /api/events/:id/timeline/:bid — update block
  app.patch('/api/events/:id/timeline/:bid', async (request, reply) => {
    const { id, bid } = request.params as { id: string; bid: string }
    const userId = request.userId!

    const { allowed, isOwnerOrEditor } = await checkEventAccess(id, userId)
    if (!allowed) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }
    if (!isOwnerOrEditor) {
      return reply.code(403).send({ message: 'Недостаточно прав для редактирования сценария' })
    }

    const block = await prisma.timelineBlock.findFirst({
      where: { id: bid, eventId: id },
    })
    if (!block) {
      return reply.code(404).send({ message: 'Блок сценария не найден' })
    }

    const parsed = updateBlockSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { title, description, durationMin, completed } = parsed.data

    const updated = await prisma.timelineBlock.update({
      where: { id: bid },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(durationMin !== undefined && { durationMin }),
        ...(completed !== undefined && { completed }),
      },
      include: {
        attachments: {
          include: {
            file: {
              select: {
                id: true,
                name: true,
                originalName: true,
                category: true,
                mimeType: true,
                size: true,
              },
            },
          },
        },
      },
    })

    return {
      id: updated.id,
      eventId: updated.eventId,
      title: updated.title,
      description: updated.description,
      durationMin: updated.durationMin,
      sortOrder: updated.sortOrder,
      completed: updated.completed,
      createdAt: updated.createdAt,
      attachments: updated.attachments.map((a) => ({
        id: a.id,
        fileId: a.file.id,
        name: a.file.name,
        originalName: a.file.originalName,
        category: a.file.category,
        mimeType: a.file.mimeType,
        size: a.file.size,
      })),
    }
  })

  // DELETE /api/events/:id/timeline/:bid — delete block
  app.delete('/api/events/:id/timeline/:bid', async (request, reply) => {
    const { id, bid } = request.params as { id: string; bid: string }
    const userId = request.userId!

    const { allowed, isOwnerOrEditor } = await checkEventAccess(id, userId)
    if (!allowed) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }
    if (!isOwnerOrEditor) {
      return reply.code(403).send({ message: 'Недостаточно прав для удаления блока' })
    }

    const block = await prisma.timelineBlock.findFirst({
      where: { id: bid, eventId: id },
    })
    if (!block) {
      return reply.code(404).send({ message: 'Блок сценария не найден' })
    }

    await prisma.timelineBlock.delete({ where: { id: bid } })

    return { message: 'Блок удалён' }
  })

  // PATCH /api/events/:id/timeline/reorder — reorder blocks
  app.patch('/api/events/:id/timeline/reorder', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const { allowed, isOwnerOrEditor } = await checkEventAccess(id, userId)
    if (!allowed) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }
    if (!isOwnerOrEditor) {
      return reply.code(403).send({ message: 'Недостаточно прав для изменения порядка' })
    }

    const parsed = reorderSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { ids } = parsed.data

    // Verify all ids belong to this event
    const existingBlocks = await prisma.timelineBlock.findMany({
      where: { eventId: id },
      select: { id: true },
    })
    const existingIds = new Set(existingBlocks.map((b) => b.id))

    for (const blockId of ids) {
      if (!existingIds.has(blockId)) {
        return reply.code(400).send({ message: `Блок ${blockId} не принадлежит этому мероприятию` })
      }
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      ids.map((blockId, index) =>
        prisma.timelineBlock.update({
          where: { id: blockId },
          data: { sortOrder: index },
        }),
      ),
    )

    return { message: 'Порядок обновлён' }
  })

  // POST /api/events/:id/timeline/:bid/attachments — attach file to block
  app.post('/api/events/:id/timeline/:bid/attachments', async (request, reply) => {
    const { id, bid } = request.params as { id: string; bid: string }
    const userId = request.userId!

    const { allowed, isOwnerOrEditor } = await checkEventAccess(id, userId)
    if (!allowed) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }
    if (!isOwnerOrEditor) {
      return reply.code(403).send({ message: 'Недостаточно прав для прикрепления файлов' })
    }

    const block = await prisma.timelineBlock.findFirst({
      where: { id: bid, eventId: id },
    })
    if (!block) {
      return reply.code(404).send({ message: 'Блок сценария не найден' })
    }

    const parsed = attachFileSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { fileId } = parsed.data

    // Verify file belongs to the same event
    const file = await prisma.file.findFirst({
      where: { id: fileId, eventId: id },
    })
    if (!file) {
      return reply.code(404).send({ message: 'Файл не найден в этом мероприятии' })
    }

    // Check if already attached
    const existing = await prisma.blockAttachment.findUnique({
      where: { blockId_fileId: { blockId: bid, fileId } },
    })
    if (existing) {
      return reply.code(409).send({ message: 'Файл уже прикреплён к этому блоку' })
    }

    const attachment = await prisma.blockAttachment.create({
      data: { blockId: bid, fileId },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            originalName: true,
            category: true,
            mimeType: true,
            size: true,
          },
        },
      },
    })

    return reply.code(201).send({
      id: attachment.id,
      fileId: attachment.file.id,
      name: attachment.file.name,
      originalName: attachment.file.originalName,
      category: attachment.file.category,
      mimeType: attachment.file.mimeType,
      size: attachment.file.size,
    })
  })

  // DELETE /api/events/:id/timeline/:bid/attachments/:aid — detach file from block
  app.delete('/api/events/:id/timeline/:bid/attachments/:aid', async (request, reply) => {
    const { id, bid, aid } = request.params as { id: string; bid: string; aid: string }
    const userId = request.userId!

    const { allowed, isOwnerOrEditor } = await checkEventAccess(id, userId)
    if (!allowed) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }
    if (!isOwnerOrEditor) {
      return reply.code(403).send({ message: 'Недостаточно прав для открепления файлов' })
    }

    const attachment = await prisma.blockAttachment.findFirst({
      where: { id: aid, blockId: bid },
    })
    if (!attachment) {
      return reply.code(404).send({ message: 'Вложение не найдено' })
    }

    await prisma.blockAttachment.delete({ where: { id: aid } })

    return { message: 'Файл откреплён' }
  })
}
