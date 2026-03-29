/**
 * seed.ts — Заполнение БД тестовыми данными для демонстрации.
 *
 * Запуск:
 *   npx tsx scripts/seed.ts
 *
 * Требует:
 *   - Запущенную PostgreSQL с DATABASE_URL в .env
 *   - Выполненную миграцию (prisma db push)
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('Очистка базы данных...')
  await prisma.notification.deleteMany()
  await prisma.blockAttachment.deleteMany()
  await prisma.accessCode.deleteMany()
  await prisma.timelineBlock.deleteMany()
  await prisma.file.deleteMany()
  await prisma.eventMember.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  console.log('Создание пользователей...')

  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@stage-vault.ru',
      passwordHash,
      nickname: 'Админ',
      emailVerified: true,
      theme: 'light',
    },
  })

  const host = await prisma.user.create({
    data: {
      email: 'host@stage-vault.ru',
      passwordHash,
      nickname: 'Ведущий',
      emailVerified: true,
      theme: 'dark',
    },
  })

  const member = await prisma.user.create({
    data: {
      email: 'member@stage-vault.ru',
      passwordHash,
      nickname: 'Участник',
      emailVerified: true,
      theme: 'light',
    },
  })

  console.log('Создание мероприятий...')

  const quiz = await prisma.event.create({
    data: {
      title: 'Квиз «Мозговой штурм»',
      description: 'Интеллектуальная игра на 6 раундов. Музыкальный, визуальный, текстовый раунды.',
      date: new Date('2026-04-15T19:00:00'),
      status: 'active',
      ownerId: admin.id,
    },
  })

  const concert = await prisma.event.create({
    data: {
      title: 'Весенний концерт',
      description: 'Отчётный концерт студенческого творческого коллектива. 12 номеров, 2 отделения.',
      date: new Date('2026-05-01T18:00:00'),
      status: 'draft',
      ownerId: host.id,
    },
  })

  const workshop = await prisma.event.create({
    data: {
      title: 'Мастер-класс по публичным выступлениям',
      description: 'Практический мастер-класс: структура выступления, работа с аудиторией, слайды.',
      date: new Date('2026-04-20T14:00:00'),
      status: 'active',
      ownerId: admin.id,
    },
  })

  console.log('Добавление участников команд...')

  await prisma.eventMember.createMany({
    data: [
      { eventId: quiz.id, userId: host.id, role: 'editor' },
      { eventId: quiz.id, userId: member.id, role: 'viewer' },
      { eventId: concert.id, userId: admin.id, role: 'editor' },
      { eventId: concert.id, userId: member.id, role: 'viewer' },
      { eventId: workshop.id, userId: host.id, role: 'viewer' },
    ],
  })

  console.log('Создание блоков таймлайна...')

  const quizBlocks = await Promise.all([
    prisma.timelineBlock.create({
      data: {
        eventId: quiz.id,
        title: 'Приветствие и правила',
        description: 'Объяснить формат, представить команды, раздать бланки ответов.',
        durationMin: 10,
        sortOrder: 0,
      },
    }),
    prisma.timelineBlock.create({
      data: {
        eventId: quiz.id,
        title: 'Раунд 1: Разминка',
        description: '10 вопросов общей эрудиции, 30 секунд на ответ.',
        durationMin: 8,
        sortOrder: 1,
      },
    }),
    prisma.timelineBlock.create({
      data: {
        eventId: quiz.id,
        title: 'Раунд 2: Музыкальный',
        description: 'Угадать 10 мелодий по 15-секундному фрагменту.',
        durationMin: 10,
        sortOrder: 2,
      },
    }),
    prisma.timelineBlock.create({
      data: {
        eventId: quiz.id,
        title: 'Раунд 3: Визуальный',
        description: 'Угадать по фрагменту изображения. 10 слайдов.',
        durationMin: 10,
        sortOrder: 3,
      },
    }),
    prisma.timelineBlock.create({
      data: {
        eventId: quiz.id,
        title: 'Подсчёт результатов',
        description: 'Собрать бланки, подсчитать баллы, подготовить призы.',
        durationMin: 10,
        sortOrder: 4,
      },
    }),
    prisma.timelineBlock.create({
      data: {
        eventId: quiz.id,
        title: 'Награждение',
        description: 'Объявить результаты, вручить призы, общее фото.',
        durationMin: 10,
        sortOrder: 5,
      },
    }),
  ])

  const concertBlocks = await Promise.all([
    prisma.timelineBlock.create({
      data: {
        eventId: concert.id,
        title: 'Открытие: приветственное слово',
        description: 'Ведущий приветствует зрителей, объявляет программу.',
        durationMin: 5,
        sortOrder: 0,
      },
    }),
    prisma.timelineBlock.create({
      data: {
        eventId: concert.id,
        title: 'Номер 1: Хор — «Весенние голоса»',
        description: 'Исполнение хоровой композиции. Нужен микрофон на стойке.',
        durationMin: 5,
        sortOrder: 1,
      },
    }),
    prisma.timelineBlock.create({
      data: {
        eventId: concert.id,
        title: 'Номер 2: Танцевальная группа',
        description: 'Современная хореография. Включить фоновую музыку.',
        durationMin: 4,
        sortOrder: 2,
      },
    }),
    prisma.timelineBlock.create({
      data: {
        eventId: concert.id,
        title: 'Антракт',
        description: 'Перерыв 15 минут. Фоновая музыка в зале.',
        durationMin: 15,
        sortOrder: 3,
      },
    }),
  ])

  console.log('Создание кодов доступа...')

  await prisma.accessCode.create({
    data: {
      eventId: quiz.id,
      code: 'QUIZ42',
      expiresAt: new Date('2026-12-31T23:59:59'),
    },
  })

  await prisma.accessCode.create({
    data: {
      eventId: concert.id,
      code: 'SHOW99',
      expiresAt: new Date('2026-12-31T23:59:59'),
    },
  })

  console.log('Создание уведомлений...')

  await prisma.notification.createMany({
    data: [
      {
        userId: member.id,
        type: 'invite',
        title: 'Приглашение в проект',
        body: `Вас пригласили в мероприятие «${quiz.title}»`,
        meta: JSON.parse(JSON.stringify({ eventId: quiz.id, role: 'viewer' })),
      },
      {
        userId: host.id,
        type: 'info',
        title: 'Добро пожаловать!',
        body: 'Добро пожаловать в StageVault. Создайте своё первое мероприятие!',
      },
    ],
  })

  console.log('')
  console.log('=== Seed завершён ===')
  console.log('')
  console.log('Тестовые аккаунты (пароль: password123):')
  console.log('  admin@stage-vault.ru  — владелец квиза и мастер-класса')
  console.log('  host@stage-vault.ru   — владелец концерта, редактор квиза')
  console.log('  member@stage-vault.ru — участник-наблюдатель')
  console.log('')
  console.log('Коды доступа:')
  console.log('  QUIZ42 — квиз «Мозговой штурм»')
  console.log('  SHOW99 — весенний концерт')
  console.log('')
}

main()
  .catch((e) => {
    console.error('Ошибка seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
