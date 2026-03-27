import { useRoutes } from 'react-router-dom'
import { routes } from './router'
import { MobileGuard } from './components/layout/MobileGuard'

export default function App() {
  const element = useRoutes(routes)

  return (
    <MobileGuard>
      {element}
    </MobileGuard>
  )
}
