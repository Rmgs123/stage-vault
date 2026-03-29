const API_BASE = '/api'

export interface ApiError {
  message: string
  statusCode: number
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('accessToken') || localStorage.getItem('codeToken')
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers = new Headers(options.headers)

    const hasBody = options.body !== undefined && options.body !== null
    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    if (hasBody && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Ошибка запроса' }))
      throw {
        message: error.message || 'Ошибка запроса',
        statusCode: res.status,
      } as ApiError
    }

    if (res.status === 204) {
      return undefined as T
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return undefined as T
    }

    const text = await res.text()
    return text ? (JSON.parse(text) as T) : (undefined as T)
  }

  get<T>(path: string) {
    return this.request<T>(path)
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }

  async upload<T>(path: string, files: File[]): Promise<T> {
    const token = this.getToken()
    const formData = new FormData()
    files.forEach((file) => formData.append('file', file))

    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Ошибка запроса' }))
      throw {
        message: error.message || 'Ошибка запроса',
        statusCode: res.status,
      } as ApiError
    }

    return res.json()
  }
}

export const api = new ApiClient()