import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import { GhostHeader } from '@/widgets/GhostHeader'

const { Content } = Layout

export const RootLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <GhostHeader />
      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}