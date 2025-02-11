import { Login } from '@/features'
import { GhostHeader } from '@/widgets/GhostHeader'
import { Card } from '@mui/material'

export const LoginPage = () => {
  return (
    <>
      <GhostHeader />
      <Card sx={{ margin: '120px auto', maxWidth: 480, minWidth: 320, padding: '40px' }}>
        <Login />
      </Card>
    </>
  )
}
