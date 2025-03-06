import React, { useState } from 'react'
import { Layout, Tabs } from 'antd'
import { ChatsPage } from './ChatsPage'
import { SupportChatPage } from './SupportChatPage'

const { TabPane } = Tabs

interface Props {
  leaked_id: number
}

export const ChatsWithTabs: React.FC<Props> = ({ leaked_id }) => {
  const [activeTab, setActiveTab] = useState<'client' | 'support'>('client')
  
  return (
    <Layout  style={{ height: '100vh', background: '#ffffff' }}>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'client' | 'support')}
        style={{ width: '100%' }}
      >
        <TabPane tab="Client" key="client">
          {/* Здесь – список «клиентских» чатов, как в вашем исходном ChatsPage */}
          <ChatsPage leaked_id={leaked_id} />
        </TabPane>
        
        <TabPane tab="Support" key="support">
          {/* Здесь – чат с админом, грузим из /chats/u/v1 */}
          <SupportChatPage />
        </TabPane>
      </Tabs>
    </Layout>
  )
}
