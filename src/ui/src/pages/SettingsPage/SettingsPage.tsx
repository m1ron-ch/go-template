import React, { useEffect, useState } from 'react'
import { Button, Table, message, Space, Tooltip, Collapse } from 'antd'
import {
  DownloadOutlined,
  RedoOutlined,
  UndoOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  AreaChartOutlined,
} from '@ant-design/icons'
import { AppSettings } from '@/shared'
import { Spacer } from '@/shared/Spacer'

const { Panel } = Collapse

interface User {
  id: number
  l_name: string
  f_name: string
  role_id: number
  login: string
  email: string
}

interface DeletedUser {
  key: string
  name: string
  email: string
}

interface DeletedPage {
  key: string
  title: string
  path: string
}

interface DeletedNews {
  key: string
  title: string
  date: string
}

interface UsersResponse {
  total: number
  data: User[]
}

type LoadingState = {
  [key: string]: boolean
}

const roleNames: { [key: number]: string } = {
  1: 'Суперадмин',
  2: 'Админ',
}

export const SettingsPage: React.FC = () => {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([])
  const [isHandleLoading, setIsHandleLoading] = useState<boolean>(false)
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})

  useEffect(() => {
    loadDeletedUsers()
  }, [])

  const loadDeletedUsers = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}users?status_id=3`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to load deleted users')
      }
      const data: UsersResponse = await response.json()
      const formattedUsers = data.data.map(user => ({
        key: user.id.toString(),
        name: `${user.f_name} ${user.l_name}`,
        login: user.login,
        email: user.email || 'N/A',
        role: roleNames[user.role_id],
      }))
      setDeletedUsers(formattedUsers)
    } catch (error) {
      message.error('Ошибка загрузки удаленных пользователей: ' + error)
    } finally {
    }
  }

  const handleButtonClick = (key: string, action: () => Promise<void>) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: true,
    }))

    action().finally(() => {
      setLoadingStates(prev => ({
        ...prev,
        [key]: false,
      }))
    })
  }

  const handleBackup = async () => {
    try {
      setIsHandleLoading(true)
      const response = await fetch(`${AppSettings.API_URL}db/backup`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch urls')
      }
      message.success('Резервная копия базы данных успешно создана.')
    } catch (err) {
      message.error('Ошибка синхронизации файлов: ' + err)
    } finally {
      setIsHandleLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setIsHandleLoading(true)
      const response = await fetch(`${AppSettings.API_URL}files/sync`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch urls')
      }
      message.success('Данные синхронизированы успешно')
    } catch (err) {
      message.error('Ошибка синхронизации файлов: ' + err)
    } finally {
      setIsHandleLoading(false)
    }
  }

  const handleCheckHash = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}check/hash`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate page')
      }

      setIsHandleLoading(true)
      message.success('Проверка целостности файлов прошла успешна.')
    } catch (err) {
      message.error('Ошибка проверки целостности файлов : ' + err)
    } finally {
      setIsHandleLoading(false)
    }
  }

  const handleRegeneratePages = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}generate/pages`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate page')
      }

      message.success('Страницы успешно перегенерированы')
      console.log('Page regenerated successfully')
    } catch (error) {
      message.error('Ошибка генерации страниц')
      message.error('' + error)
      console.error('Error regenerating page:', error)
    }
  }

  const handleRestore = async (record: DeletedUser | DeletedPage | DeletedNews) => { 
    try {
      const response = await fetch(`${AppSettings.API_URL}user/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({id: Number(record.key)})
      })

      if (!response.ok) {
        throw new Error('Ошибка восстановления пользователя')
      }

      loadDeletedUsers();

      message.success('Пользователь успешно восстановлен')
    } catch (error) {
      message.error('Ошибка восстановления нового пользователя')
      message.error('' + error)
      console.error('Ошибка восстановления нового пользователя:', error)
    }
  }

  // const handleDeleteForever = (record: DeletedUser | DeletedPage | DeletedNews) => {
  //   message.error(`Запись ${record.key} удалена навсегда.`)
  // }

  const columnsUsers = [
    { title: 'Имя', dataIndex: 'name', key: 'name' },
    { title: 'Роль', dataIndex: 'role', key: 'role' },
    { title: 'Логин', dataIndex: 'login', key: 'login' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Действия',
      key: 'actions',
      width: '10%',
      render: (_: any, record: DeletedUser) => (
        <Space size="middle">
          <Tooltip title="Восстановить">
            <Button type="primary" icon={<UndoOutlined />} onClick={() => handleRestore(record)} />
          </Tooltip>
          {/* <Tooltip title="Удалить навсегда">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteForever(record)} />
          </Tooltip> */}
        </Space>
      ),
    },
  ]

  // const columnsPages = [
  //   { title: 'Заголовок', dataIndex: 'title', key: 'title' },
  //   { title: 'Путь', dataIndex: 'path', key: 'path' },
  //   {
  //     title: 'Действия',
  //     key: 'actions',
  //     width: '10%',
  //     render: (_: any, record: DeletedPage) => (
  //       <Space size="middle">
  //         <Tooltip title="Восстановить">
  //           <Button type="primary" icon={<UndoOutlined />} onClick={() => handleRestore(record)} />
  //         </Tooltip>
  //         <Tooltip title="Удалить навсегда">
  //           <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteForever(record)} />
  //         </Tooltip>
  //       </Space>
  //     ),
  //   },
  // ]

  // const columnsNews = [
  //   { title: 'Заголовок', dataIndex: 'title', key: 'title' },
  //   { title: 'Дата', dataIndex: 'date', key: 'date' },
  //   {
  //     title: 'Действия',
  //     key: 'actions',
  //     width: '10%',
  //     render: (_: any, record: DeletedNews) => (
  //       <Space size="middle">
  //         <Tooltip title="Восстановить">
  //           <Button type="primary" icon={<UndoOutlined />} onClick={() => handleRestore(record)} />
  //         </Tooltip>
  //         <Tooltip title="Удалить навсегда">
  //           <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteForever(record)} />
  //         </Tooltip>
  //       </Space>
  //     ),
  //   },
  // ]

  return (
    <div style={{ padding: 20 }}>
      <Spacer />
      <Space size={'large'} style={{ marginBottom: 16, flexWrap: 'wrap'  }}>
        <Button
          type="primary"
          icon={<RedoOutlined />}
          loading={loadingStates['regeneratePages']}
          onClick={() => handleButtonClick('regeneratePages', handleRegeneratePages)}
        >
          Перегенерировать страницы
        </Button>

        <Button
          type="primary"
          icon={<SyncOutlined />}
          loading={isHandleLoading}
          onClick={handleSync}
        >
          Синхронизация файлов
        </Button>

        <Button
          type="default"
          icon={<DownloadOutlined />}
          loading={isHandleLoading}
          onClick={handleBackup}
        >
          Создать резервную копию
        </Button>

        <Button
          type="default"
          icon={<CheckCircleOutlined />}
          onClick={() => handleButtonClick('check', handleCheckHash)}
        >
          Проверка целостности файлов
        </Button>

        <Button
          type="default"
          icon={<AreaChartOutlined />}
          onClick={() => window.open('https://metrika.yandex.ru/dashboard?id=98326613', '_blank')}
        >
          Открыть Yandex Metrica
        </Button>
      </Space>

      <Spacer />

      <Collapse >
        <Panel header="Таблица с удалёнными пользователями" key="1">
          <Table dataSource={deletedUsers} columns={columnsUsers} />
        </Panel>
      </Collapse>
    </div>
  )
}
