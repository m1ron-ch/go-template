import { Navigate, Outlet } from 'react-router-dom'

import { useLocalStorage } from '@/shared'

export const PrivateRoutes = () => {
  const { isAuth } = useLocalStorage()

  return isAuth ? <Outlet /> : <Navigate to={'/account/authentication/credentials/verification/authorization/secure/signin/ZxYwVuTsRqPoNmLkJiHgFeDcBa9876543210QwErTyUiOpAsDfGhJkLzXcVbNm'} />
}
