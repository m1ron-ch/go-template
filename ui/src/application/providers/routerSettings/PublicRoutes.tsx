import { Navigate, Outlet } from 'react-router-dom'

import { useLocalStorage } from '@/shared'

export const PublicRoutes = () => {
  const { isAuth } = useLocalStorage()

  return isAuth ? <Navigate to={'/news'} /> : <Outlet />
}
