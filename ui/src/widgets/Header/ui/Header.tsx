// import {  useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { AppSettings } from '@/shared'
// import { Typography, Space, Menu, Dropdown, message, Button } from 'antd'
// import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import s from './Header.module.scss'

export const Header: React.FC = () => {
  return (
    <div className={s.header}>
      <div className={s.logoContainer}>
        <div className={s.userMenu}>
        </div>
      </div>
    </div>
  );
}
