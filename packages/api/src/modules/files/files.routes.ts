import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import prisma from '../../lib/prisma.js'
import { authGuard } from '../../middleware/auth.js'
import { uploadFile, deleteFile, getPresignedUrl } from '../../lib/s3.js'

const CATEGORY_MAP: Record<string, string> = {
  // Music
  mp3: 'music', wav: 'music', ogg: 'music', flac: 'music', aac: 'music', m4a: 'music',
  // Presentations
  pptx: 'presentation', pdf: 'presentation',
  // Images
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', svg: 'image', webp: 'image',
  // Video
  mp4: 'video', webm: 'video', mov: 'video',
  // Documents
  txt: 'document', md: 'document', doc: 'document', docx: 'document', rtf: 'document',
}

function getCategory(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return CATEGORY_MAP[ext] || 'other'
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
    aac: 'audio/aac', m4a: 'audio/mp4',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pdf: 'application/pdf',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    svg: 'image/svg+xml', webp: 'image/webp',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
    txt: 'text/plain', md: 'text/markdown', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    rtf: 'application/rtf', zip: 'application/zip',
  }
  return mimeMap[ext] || 'application/octet-stream'
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB

const updateFileSchema = z.object({
  name: z.string().min(1, 'Название файла обязательно').max(255).optional(),
  note: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

async function checkEventAccess(eventId: string, userId: string): Promise<{ event: { id: string; ownerId: string } | null; role: string | null }> {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, ownerId: true } })
  if (!event) return { event: null, role: null }

  if (event.ownerId === userId) return { event, role: 'owner' }

  const membership = await prisma.eventMember.findUnique({
    where: { eventId_userId: { eventId, userId } },
  })

  if (!membership) return { event: null, role: null }
  return { event, role: membership.role }
}

export default async function filesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  // GET /api/events/:id/files — list files for an event
  app.get('/api/events/:id/files', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const { event } = await checkEventAccess(id, userId)
    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден или нет доступа' })
    }

    const category = (request.query as { category?: string }).category

    const files = await prisma.file.findMany({
      where: {
        eventId: id,
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return files
  })

  // POST /api/events/:id/files — upload file(s)
  app.post('/api/events/:id/files', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const { event, role } = await checkEventAccess(id, userId)
    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден или нет доступа' })
    }

    if (role === 'viewer') {
      return reply.code(403).send({ message: 'Зрители не могут загружать файлы' })
    }

    const parts = request.parts()
    const uploadedFiles: Array<{
      id: string
      name: string
      originalName: string
      mimeType: string
      size: number
      s3Key: string
      category: string
      sortOrder: number
      note: string | null
      createdAt: Date
      eventId: string
    }> = []

    for await (const part of parts) {
      if (part.type !== 'file' || !part.filename) continue

      const chunks: Buffer[] = []
      let totalSize = 0

      for await (const chunk of part.file) {
        totalSize += chunk.length
        if (totalSize > MAX_FILE_SIZE) {
          return reply.code(400).send({ message: `Файл "${part.filename}" превышает лимит 500 MB` })
        }
        chunks.push(chunk)
      }

      if (part.file.truncated) {
        return reply.code(400).send({ message: `Файл "${part.filename}" превышает лимит 500 MB` })
      }

      const buffer = Buffer.concat(chunks)
      const originalName = part.filename
      const category = getCategory(originalName)
      const mimeType = part.mimetype || getMimeType(originalName)
      const fileId = randomUUID()
      const ext = originalName.split('.').pop() || ''
      const s3Key = `events/${id}/${fileId}.${ext}`

      await uploadFile(s3Key, buffer, mimeType)

      // Get max sortOrder for this category
      const maxSort = await prisma.file.aggregate({
        where: { eventId: id, category },
        _max: { sortOrder: true },
      })
      const sortOrder = (maxSort._max.sortOrder ?? -1) + 1

      const fileRecord = await prisma.file.create({
        data: {
          id: fileId,
          eventId: id,
          name: originalName,
          originalName,
          mimeType,
          size: buffer.length,
          s3Key,
          category,
          sortOrder,
        },
      })

      uploadedFiles.push(fileRecord)
    }

    if (uploadedFiles.length === 0) {
      return reply.code(400).send({ message: 'Файлы не были загружены' })
    }

    return reply.code(201).send(uploadedFiles)
  })

  // GET /api/events/:id/files/:fid — get presigned download URL
  app.get('/api/events/:id/files/:fid', async (request, reply) => {
    const { id, fid } = request.params as { id: string; fid: string }
    const userId = request.userId!

    const { event } = await checkEventAccess(id, userId)
    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден или нет доступа' })
    }

    const file = await prisma.file.findFirst({
      where: { id: fid, eventId: id },
    })

    if (!file) {
      return reply.code(404).send({ message: 'Файл не найден' })
    }

    const url = await getPresignedUrl(file.s3Key)

    return { ...file, downloadUrl: url }
  })

  // PATCH /api/events/:id/files/:fid — update file (name, note, sortOrder)
  app.patch('/api/events/:id/files/:fid', async (request, reply) => {
    const { id, fid } = request.params as { id: string; fid: string }
    const userId = request.userId!

    const { event, role } = await checkEventAccess(id, userId)
    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден или нет доступа' })
    }

    if (role === 'viewer') {
      return reply.code(403).send({ message: 'Зрители не могут редактировать файлы' })
    }

    const file = await prisma.file.findFirst({
      where: { id: fid, eventId: id },
    })

    if (!file) {
      return reply.code(404).send({ message: 'Файл не найден' })
    }

    const parsed = updateFileSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { name, note, sortOrder } = parsed.data

    const updated = await prisma.file.update({
      where: { id: fid },
      data: {
        ...(name !== undefined && { name }),
        ...(note !== undefined && { note }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return updated
  })

  // DELETE /api/events/:id/files/:fid — delete file
  app.delete('/api/events/:id/files/:fid', async (request, reply) => {
    const { id, fid } = request.params as { id: string; fid: string }
    const userId = request.userId!

    const { event, role } = await checkEventAccess(id, userId)
    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден или нет доступа' })
    }

    if (role === 'viewer') {
      return reply.code(403).send({ message: 'Зрители не могут удалять файлы' })
    }

    const file = await prisma.file.findFirst({
      where: { id: fid, eventId: id },
    })

    if (!file) {
      return reply.code(404).send({ message: 'Файл не найден' })
    }

    // Delete from S3
    await deleteFile(file.s3Key)

    // Delete from DB
    await prisma.file.delete({ where: { id: fid } })

    return { message: 'Файл удалён' }
  })
}
