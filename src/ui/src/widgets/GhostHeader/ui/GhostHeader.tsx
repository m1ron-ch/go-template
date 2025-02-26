import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout, Menu, Dropdown, Space, MenuProps } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import s from './GhostHeader.module.scss'

const { Header: AntHeader } = Layout

interface User {
  login: string
  role_id: number
}

export const GhostHeader: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setUser(data)
          setIsAuth(!!data.login)
        } else {
          setUser(null)
          setIsAuth(false)
        }
      })
      .catch(() => {
        setUser(null)
        setIsAuth(false)
      })
  }, [])

  const handleLogout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      navigate('/')
      setIsAuth(false)
      setUser(null)
    })
  }

  const userMenuItems: MenuProps['items'] = [
    user?.role_id === 1
      ? { key: 'admin_panel', label: <Link to="/admin/news">Admin Panel</Link> }
      : null,
    user?.role_id !== 1
      ? { key: 'Campaign', label: <Link to="/campaign">Campaign</Link> }
      : null,
    {
      key: 'logout',
      label: 'Logout',
      style: { color: 'red' },
      onClick: handleLogout,
    },
  ].filter(Boolean);

  const userMenu = <Menu items={userMenuItems} />

  const menuItems = [
    { key: 'news', label: <Link style={{ color: 'white' }} to="/news">News</Link> },
    { key: 'leaked-data', label: <Link style={{ color: 'white' }} to="/leaked-data">Leaked Data</Link> },
    { key: 'awaiting-publication', label: <Link style={{ color: 'white' }} to="/awaiting-publication">Awaiting Publication</Link> },
    { key: 'terms-and-conditions', label: <Link style={{ color: 'white' }} to="/terms-and-conditions">Terms & Conditions</Link> },
    { key: 'order-service', label: <Link style={{ color: 'white' }} to="/order-service">Order a service</Link> },
    { key: 'contact', label: <Link style={{ color: 'white' }} to="/contact">Contact Us</Link> },
  ]

  const pathParts = location.pathname.split('/')
  const selectedKey = pathParts[1] || 'news'

  return (
    <AntHeader
      className={s.header}
      style={{
        color:"white !importan",
        // Более насыщенный и акцентный зеленый градиент для header
        background: 'linear-gradient(90deg, #43a047, #2e7d32)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '0 24px',
      }}
    >
    <Menu
      mode="horizontal"
      items={menuItems}
      className={s.menu}
      selectedKeys={[selectedKey]}
    />
      <div className={s.rightSide}>
        {isAuth ? (
          <Dropdown overlay={userMenu} trigger={['hover']}>
            <Space style={{ cursor: 'pointer', fontWeight: 'bold', color: 'white' }}>
              {user?.login || 'User'}
              <DownOutlined />
            </Space>
          </Dropdown>
        ) : null}
      </div>
    </AntHeader>
  )
}
