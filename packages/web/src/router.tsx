import type { RouteObject } from 'react-router-dom'

const HomePage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold font-serif text-text-primary mb-2">StageVault</h1>
      <p className="text-text-muted">Платформа управления контентом мероприятий</p>
    </div>
  </div>
)

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
]
