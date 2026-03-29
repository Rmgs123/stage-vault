import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('рендерит текст', () => {
    render(<Button>Нажми</Button>)
    expect(screen.getByRole('button', { name: 'Нажми' })).toBeInTheDocument()
  })

  it('вызывает onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Клик</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('не кликается в состоянии disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Выкл</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('не кликается в состоянии loading', async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Загрузка</Button>)

    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('показывает спиннер при loading', () => {
    render(<Button loading>Загрузка</Button>)
    const btn = screen.getByRole('button')
    // Loader2 рендерит svg с animate-spin
    expect(btn.querySelector('.animate-spin')).toBeTruthy()
  })

  it('применяет variant primary по умолчанию', () => {
    render(<Button>Основная</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-brand-600')
  })

  it('применяет variant danger', () => {
    render(<Button variant="danger">Удалить</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-red-500')
  })

  it('применяет size sm', () => {
    render(<Button size="sm">Маленькая</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('px-3')
  })
})
