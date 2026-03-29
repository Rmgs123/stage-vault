import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('рендерит input элемент', () => {
    render(<Input placeholder="Введите текст" />)
    expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument()
  })

  it('рендерит label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('связывает label и input через htmlFor/id', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('показывает ошибку', () => {
    render(<Input error="Обязательное поле" />)
    expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
  })

  it('применяет стили ошибки', () => {
    render(<Input error="Ошибка" placeholder="test" />)
    const input = screen.getByPlaceholderText('test')
    expect(input.className).toContain('border-red-300')
  })

  it('принимает пользовательский ввод', async () => {
    const onChange = vi.fn()
    render(<Input placeholder="type" onChange={onChange} />)

    const input = screen.getByPlaceholderText('type')
    await userEvent.type(input, 'hello')

    expect(onChange).toHaveBeenCalled()
    expect(input).toHaveValue('hello')
  })

  it('рендерит rightIcon', () => {
    render(<Input rightIcon={<span data-testid="icon">X</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
