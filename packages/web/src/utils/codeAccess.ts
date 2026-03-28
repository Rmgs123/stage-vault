export function isCodeAccess(): boolean {
  return !!localStorage.getItem('codeToken')
}

export function getCodeEventId(): string | null {
  return localStorage.getItem('codeEventId')
}

export function clearCodeAccess(): void {
  localStorage.removeItem('codeToken')
  localStorage.removeItem('codeEventId')
  localStorage.removeItem('codeEventTitle')
  localStorage.removeItem('codeExpiresAt')
}

export function isCodeExpired(): boolean {
  const expiresAt = localStorage.getItem('codeExpiresAt')
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() < Date.now()
}
