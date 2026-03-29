import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('не рендерится, когда open=false', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Контент</p>
      </Modal>,
    )
    expect(screen.queryByText('Контент')).not.toBeInTheDocument()
  })

  it('рендерится, когда open=true', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Контент</p>
      </Modal>,
    )
    expect(screen.getByText('Контент')).toBeInTheDocument()
  })

  it('отображает заголовок', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Заголовок">
        <p>Тело</p>
      </Modal>,
    )
    expect(screen.getByText('Заголовок')).toBeInTheDocument()
  })

  it('вызывает onClose при нажатии на overlay', async () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <p>Тело</p>
      </Modal>,
    )

    // Overlay — первый div с bg-black/30
    const overlay = document.querySelector('.bg-black\\/30') as HTMLElement
    await userEvent.click(overlay)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('вызывает onClose по Escape', async () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <p>Тело</p>
      </Modal>,
    )

    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('рендерит кнопку закрытия', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Тест">
        <p>Тело</p>
      </Modal>,
    )
    // Кнопка закрытия содержит X-иконку
    const closeButtons = document.querySelectorAll('button')
    expect(closeButtons.length).toBeGreaterThan(0)
  })
})
