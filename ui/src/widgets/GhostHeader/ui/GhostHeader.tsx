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
  const navigate = useNavigate();
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

  const userMenuItems = [
    user?.role_id === 1
      ? { key: 'admin_panel', label: <Link to="/admin">Admin Panel</Link> }
      : null,
    user?.role_id != 1
      ? { key: 'Campaing', label: <Link to="/campaing">Campaing</Link> }
      : null,
    user?.role_id != 1
      ? { key: 'chat', label: <Link to="/chat">Chat</Link> }
      : null,
    {
      key: 'logout',
      label: (
        <span style={{ color: 'red' }} onClick={handleLogout}>
          Logout
        </span>
      ),
    }
  ].filter(Boolean) as MenuProps['items']

  const userMenu = <Menu items={userMenuItems} />

  const menuItems = [
    { key: 'news', label: <Link to="/news">News</Link> },
    { key: 'leaked-data', label: <Link to="/leaked-data">Leaked Data</Link> },
    { key: 'awaiting-publication', label: <Link to="/awaiting-publication">Awaiting Publication</Link> },
    { key: 'terms-and-conditions', label: <Link to="/terms-and-conditions">Terms & Conditions</Link> },
    { key: 'order-service', label: <Link to="/order-service">Order a service</Link> },
    { key: 'contact', label: <Link to="/contact">Contact Us</Link> },
  ]

  const pathParts = location.pathname.split('/');
  const selectedKey = pathParts[1] || 'news';

  return (
    <AntHeader className={s.header}>
      <Menu mode="horizontal" items={menuItems} className={s.menu} selectedKeys={[selectedKey]} />
      <div className={s.rightSide}>
        {isAuth ? (
          <Dropdown overlay={userMenu} trigger={['hover']}>
            <Space style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              {user?.login || 'User'}
              <DownOutlined />
            </Space>
          </Dropdown>
        ) : (
          <></>
        )}
      </div>
    </AntHeader>
  )
}
