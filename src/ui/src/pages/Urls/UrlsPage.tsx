import React, { useEffect, useState } from 'react'
import { Button, message, Table, Tag, Modal, Form, Select, Input, Space, Col, Row } from 'antd'
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Spacer } from '@/shared/Spacer'
import { AppSettings } from '@/shared'
import s from './UrlsPage.module.scss'

interface Url {
  uid: number
  url: string
  is_occupied: boolean
}

export const UrlsPage: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [newLinkForm] = Form.useForm()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<Url | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState<string>('')

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}urls`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch URLs')
      }
      const result: Url[] = await response.json()
      const filteredResult = result.filter(url => url.url !== '/')
      setUrls(filteredResult)
    } catch (error) {
      console.error('Error fetching URLs:', error)
      message.error('Не удалось получить пути.')
    }
  }

  const handleAddClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      setIsLoading(true)
      const values = await newLinkForm.validateFields()
      const payload = {
        parent_id: values.url_id,
        url: `${values.url}`,
      }

      const response = await fetch(`${AppSettings.API_URL}url/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        fetchUrls()
        message.success('Ссылка добавлена успешно')
        newLinkForm.resetFields()
        setIsModalVisible(false)
      } else {
        message.error(`Ошибка добавления ссылки (${response.statusText})`)
      }
    } catch (error) {
      console.log('Validate Failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  const handleDeleteClick = (url: Url) => {
    setSelectedUrl(url)
    setDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedUrl) {
      setIsDeleting(true)
      try {
        const response = await fetch(`${AppSettings.API_URL}url/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ id: selectedUrl.uid }),
        })

        if (response.ok) {
          message.success(
            <span>
              Ссылка <b>{selectedUrl?.url}</b> удалена успешно
            </span>
          )
          setDeleteModalVisible(false)
          setSelectedUrl(null)
          fetchUrls()
        } else {
          message.error(`Ошибка удаления ссылки (${response.statusText})`)
        }
      } catch (error) {
        console.error('Error deleting URL:', error)
        message.error('Не удалось удалить ссылку.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false)
    setSelectedUrl(null)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const filteredUrlsList = urls.filter(item =>
    item.url.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: 'Путь',
      dataIndex: 'url',
      key: 'url',
      width: '70%',
      render: (url: string) => (
        <a
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {url}
        </a>
      ),
    },
    {
      title: 'Доступность',
      dataIndex: 'is_occupied',
      key: 'is_occupied',
      width: '10%',
      sorter: (a: Url, b: Url) => Number(a.is_occupied) - Number(b.is_occupied),
      render: (is_occupied: boolean) => (
        <Tag color={is_occupied ? 'red' : 'green'}>{is_occupied ? 'Занят' : 'Свободен'}</Tag>
      ),
      filters: [
        { text: 'Занят', value: true },
        { text: 'Свободен', value: false },
      ],
      onFilter: (value: any, record: Url) => record.is_occupied === value,
    },
    {
      title: 'Действия',
      key: 'action',
      width: '10%',
      render: (_: string, record: Url) => (
        <span>
          <Button
            key={`delete-${record.uid}`}
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
            style={{ marginLeft: 8 }}
          />
        </span>
      ),
    },
  ]

  return (
    <div className={s.container}>
      <Spacer />
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddClick}
              style={{ marginBottom: 16 }}
            >
              Добавить
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchUrls}
              style={{ marginBottom: 16, marginLeft: 8 }}
            >
              Обновить
            </Button>
          </Space>
        </Col>
        <Col>
          <Input
            placeholder="Поиск по заголовку"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
        </Col>
      </Row>
      <Table
        className="custom-table"
        dataSource={filteredUrlsList}
        columns={columns}
        pagination={{ defaultPageSize: 15 }}
        rowKey="uid"
      />

      <Modal
        title="Добавить новую ссылку"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        centered
        footer={[
          <Button key="back" onClick={handleModalCancel}>
            Отмена
          </Button>,
          <Button loading={isLoading} key="submit" type="primary" onClick={handleModalOk}>
            Добавить
          </Button>,
        ]}
      >
        <Form form={newLinkForm} layout="horizontal">
          <Form.Item
            label="Путь родителя"
            name="url_id"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select style={{ width: '100%' }} placeholder="Выберите путь">
              <Select.Option value={undefined}>Не выбрано</Select.Option>
              {urls.map(item => (
                <Select.Option key={`url-${item.uid}`} value={item.uid}>
                  {item.url}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Путь"
            name="url"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[{ required: true, message: 'Пожалуйста, введите путь' }]}
          >
            <Input addonBefore="/" placeholder="Введите путь" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Удалить ссылку"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        centered
        footer={[
          <Button key="back" onClick={handleDeleteCancel}>
            Отмена
          </Button>,
          <Button
            key="submit"
            danger
            loading={isDeleting}
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            Удалить
          </Button>,
        ]}
      >
        <p>
          Вы точно хотите удалить ссылку <b>"{selectedUrl?.url}"</b>?
        </p>
      </Modal>
    </div>
  )
}
