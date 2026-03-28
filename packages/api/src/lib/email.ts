import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

function createTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const link = `${env.FRONTEND_URL}/verify-email?token=${token}`

  if (env.NODE_ENV === 'development') {
    console.log(`\n[DEV] Verification email for ${email}:\n${link}\n`)
    return
  }

  const transporter = createTransporter()
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'StageVault — Подтверждение email',
    html: `
      <h2>Добро пожаловать в StageVault!</h2>
      <p>Нажмите на ссылку, чтобы подтвердить ваш email:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Ссылка действительна 24 часа.</p>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const link = `${env.FRONTEND_URL}/reset-password?token=${token}`

  if (env.NODE_ENV === 'development') {
    console.log(`\n[DEV] Password reset email for ${email}:\n${link}\n`)
    return
  }

  const transporter = createTransporter()
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'StageVault — Сброс пароля',
    html: `
      <h2>Сброс пароля</h2>
      <p>Вы запросили сброс пароля. Нажмите на ссылку:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Ссылка действительна 1 час.</p>
    `,
  })
}
