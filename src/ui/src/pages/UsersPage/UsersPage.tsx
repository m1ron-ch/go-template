import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Spin } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import styles from './UsersPage.module.scss'
import { AppSettings } from '@/shared'
import { Spacer } from '@/shared/Spacer'

interface User {
  id: number
  name: string
  login: string
  role_id: number
  status_id: number

  // If you still need these fields, you can keep them. 
  // But in your JSON, they're not present:
  // last_login: string
  // registration_date: string
  // token_creation: string
  // l_name: string
  // f_name: string
  // m_name: string
  // ipv4: string
  // password: string
  // email: string
  // ...
}

export const UsersPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          setUser(null)
        }
      })
      .catch(() => {
        setUser(null)

      })
  }, [])

  const [users, setUsers] = useState<User[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [form] = Form.useForm()

  const roleNames: { [key: number]: string } = {
    1: 'Admin',
    2: 'User',
    0: 'Undefined',
    // ... if you have other roles
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      form.setFieldsValue(selectedUser)
    } else {
      form.resetFields()
    }
  }, [selectedUser, form])

  // Fetch users from server
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${AppSettings.API_URL}/users`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      // The server returns an array (not an object with `data`)
      const usersArray: User[] = await response.json()
      setUsers(usersArray)
    } catch (error) {
      console.error('Error fetching users:', error)
      message.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  // Open edit modal
  const handleEditUser = async (userId: number) => {
    const userToEdit = users.find((u) => u.id === userId)
    // if current user is "Admin" (role=2) and the user to edit is "SuperAdmin" (role=1), disallow
    if (user?.role_id === 2 && userToEdit?.role_id === 1) {
      message.error("You can't edit a SuperAdmin user.")
      return
    }

    // fetch user detail from server
    try {
      const response = await fetch(`${AppSettings.API_URL}/users/${userId}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      const userData: User = await response.json()
      setSelectedUser(userData)
      setModalVisible(true)
    } catch (error) {
      console.error('Error fetching user data:', error)
      message.error('Failed to fetch user data')
    }
  }

  // Save (create or update) user
  const handleSaveUser = async () => {
    const formValues = form.getFieldsValue()

    // If selectedUser is set => update, otherwise => add
    const url = selectedUser
      ? `${AppSettings.API_URL}/users/edit/${selectedUser.id}`
      : `${AppSettings.API_URL}/user`
    const method = selectedUser ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formValues,
          id: selectedUser ? selectedUser.id : undefined,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to save user')
      }
      message.success(selectedUser ? 'User updated' : 'User created')
      setModalVisible(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      message.error('Failed to save user')
    }
  }

  // Delete user
  const handleDeleteUser = (u: User) => {
    if (user?.role_id === 2 && u.role_id === 1) {
      message.error("You can't delete a SuperAdmin user.")
      return
    }
    setSelectedUser(u)
    setDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      setIsDeleting(true)
      try {
        const response = await fetch(`${AppSettings.API_URL}/users/delete/${selectedUser.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ user_id: selectedUser.id }),
        })
        if (!response.ok) {
          throw new Error('Failed to delete user')
        }
        message.success(`User ${selectedUser.name} deleted`)
        setDeleteModalVisible(false)
        setSelectedUser(null)
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        message.error('Failed to delete user')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Convert status_id to color
  const getColorByStatus = (status: number) => {
    switch (status) {
      case 1:
        return '#4CAF50' // Active
      case 2:
        return '#FFC107' // Block
      case 3:
        return '#F44336' // Deleted
      default:
        return 'inherit'
    }
  }

  // Convert status_id to string
  const getUserStatus = (status_id: number) => {
    switch (status_id) {
      case 1:
        return 'Active'
      case 2:
        return 'Blocked'
      case 3:
        return 'Deleted'
      default:
        return 'Undefined'
    }
  }

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status_id',
      key: 'status_id',
      render: (status: number) => (
        <span style={{ color: getColorByStatus(status) }}>{getUserStatus(status)}</span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Login',
      dataIndex: 'login',
      key: 'login',
    },
    {
      title: 'Role',
      dataIndex: 'role_id',
      key: 'role_id',
      render: (role_id: number) => <span>{roleNames[role_id]}</span>,
    },
    {
      title: 'Action',
      key: 'actions',
      render: (_: any, u: User) => (
        <div className={styles.actionIcons}>
          {(user?.role_id !== 2 || u.role_id !== 1) && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditUser(u.id)}
              style={{ marginRight: 8 }}
            />
          )}
          {u.id !== user?.id && u.status_id != 3 && (user?.role_id === 1 || u.role_id !== 1) && (
            <Button icon={<DeleteOutlined />} onClick={() => handleDeleteUser(u)} danger />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <Spacer />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setSelectedUser(null)
          form.resetFields()
          setModalVisible(true)
        }}
        style={{ marginBottom: 16 }}
      >
        Add
      </Button>
      <Button
        type="default"
        icon={<ReloadOutlined />}
        onClick={fetchUsers}
        style={{ marginBottom: 16, marginLeft: 8 }}
      >
        Refresh
      </Button>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={{
          spinning: isLoading,
          indicator: <Spin indicator={<LoadingOutlined spin />} size="large" />,
        }}
        rowClassName={(record) => (record.id === user?.id ? styles.currentUserRow : '')}
      />

      <Modal
        key={selectedUser ? selectedUser.id : 'new'}
        title={selectedUser ? 'Edit user' : 'Add user'}
        open={modalVisible}
        centered
        onCancel={() =>
          Modal.confirm({
            title: 'Are you sure you want to close?',
            content: 'All unsaved changes will be lost.',
            okText: 'Yes',
            centered: true,
            cancelText: 'No',
            onOk() {
              setModalVisible(false)
            },
          })
        }
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveUser}>
            Save
          </Button>,
        ]}
      >
        <Form
          form={form}
          initialValues={selectedUser || { status_id: 1, role_id: 2 }}
          onFinish={handleSaveUser}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item label="Status" name="status_id" rules={[{ required: true, message: 'Select status' }]}>
            <Select>
              <Select.Option value={1}>Active</Select.Option>
              <Select.Option value={2}>Blocked</Select.Option>
              <Select.Option value={3}>Deleted</Select.Option>
            </Select>
          </Form.Item>

          {/* 
             In your real JSON you don't have l_name / f_name / m_name 
             but you do have "name". If you want to keep name:
          */}
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Enter name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role_id"
            rules={[{ required: true, message: 'Select role' }]}
          >
            <Select defaultValue={2}>
              {user?.role_id === 1 ? (
                <>
                  {/* <Select.Option value={1}>Admin</Select.Option> */}
                  <Select.Option value={2}>User</Select.Option>
                </>
              ) : (
                <>
                  <Select.Option value={2}>User</Select.Option>
                </>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Login"
            name="login"
            rules={[{ required: true, message: 'Enter login' }]}
          >
            <Input />
          </Form.Item>

          {/* Password field if needed, but your server JSON doesn't show it */}
          <Form.Item label="Password" name="password">
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Delete user"
        centered
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" danger loading={isDeleting} onClick={handleDeleteConfirm}>
            Delete
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to delete user <b>{selectedUser?.name}</b>?
        </p>
      </Modal>
    </div>
  )
}
