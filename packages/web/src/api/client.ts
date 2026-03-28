const API_BASE = '/api'

export interface ApiError {
  message: string
  statusCode: number
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Ошибка запроса' }))
      throw { message: error.message || 'Ошибка запроса', statusCode: res.status } as ApiError
    }

    return res.json()
  }

  get<T>(path: string) {
    return this.request<T>(path)
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
