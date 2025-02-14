import { Outlet } from 'react-router-dom'
import s from './AuthLayout.module.scss'
import { NavBar } from '@/widgets'
import { GhostHeader } from '@/widgets/GhostHeader'
// import { useEffect } from 'react'
// import { useEffect } from 'react'


export const AuthLayout = () => {
  // const navigate = useNavigate()

  // useEffect(() => {
  //   fetch('/api/auth/me', {
  //     method: 'GET',
  //     credentials: 'include',
  //   })
  //     .then(async (res) => {
  //       if (!res.ok) {
  //         navigate('/')
  //         return null 
  //       }

  //       return res.json()
  //     })
  //     .then((data) => {
  //       if (!data) return 
  //       if (data.role_id !== 1) { navigate('/') }
  //     })
  //     .catch(() => {
  //       navigate('/')
  //     })
  // }, [navigate])

  // useEffect(() => {
  //   document.body.style.background = 'linear-gradient(135deg, #dcedc8, #a5d6a7)';
  //   document.body.style.minHeight = '100vh';
  //   return () => {
  //     document.body.style.background = '';
  //   };
  // }, []);

  return (
    <div
      style={{
        minHeight: '100vh', // Минимальная высота вьюпорта
        // background: 'linear-gradient(135deg, #dcedc8, #a5d6a7)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <GhostHeader />
      <div className={s.root} style={{ flexGrow: 1 }}> {/* flexGrow позволит расти */}
        <NavBar className={s.navbar} />
        <main className={s.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
