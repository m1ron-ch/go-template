import { Outlet, useNavigate } from 'react-router-dom'
import s from './AuthLayout.module.scss'
import { NavBar } from '@/widgets'
import { GhostHeader } from '@/widgets/GhostHeader'
import { useEffect } from 'react'


export const AuthLayout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          navigate('/')
          return null 
        }

        return res.json()
      })
      .then((data) => {
        if (!data) return 
        if (data.role_id !== 1) { navigate('/') }
      })
      .catch(() => {
        navigate('/')
      })
  }, [navigate])

  return (
    <>
      <GhostHeader />
      <div className={s.root}>
        <NavBar className={s.navbar} />
        <main className={s.main}>
          <Outlet />
        </main>
      </div>
    </>
  )
}
