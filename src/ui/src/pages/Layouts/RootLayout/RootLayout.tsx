import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import { GhostHeader } from '@/widgets/GhostHeader'

const { Content } = Layout

export const RootLayout = () => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        // Мягкий зелёный градиент для фона всего приложения
        background: 'linear-gradient(135deg, #dcedc8, #a5d6a7)',
      }}
    >
      <GhostHeader />
      <Content style={{ padding: '24px'}}>
        <Outlet />
      </Content>
    </Layout>
  )
}
