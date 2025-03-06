import React, { useEffect, useState } from 'react'
import { Modal, Form, Select, Input, Row, Col, message } from 'antd'
import { AppSettings } from '@/shared'

interface Url {
  id: number
  url: string
  is_occupied: boolean
}

export const TabModal: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([])
  const [modalVisible, setModalVisible] = useState(true)
  const [formData, setFormData] = useState({
    parentId: '',
    urlName: '',
  })

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}urls`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const result: Url[] = await response.json()
      setUrls(result)
    } catch (error) {
      console.error('Error fetching users:', error)
      message.error('Failed to fetch urls')
    }
  }

  const handleModalOk = () => {
    setModalVisible(false)
    setFormData({ parentId: '', urlName: '' })
  }

  const handleModalCancel = () => {
    setModalVisible(false)
  }

  return (
    <Modal
      title="Добавить URL"
      open={modalVisible}
      onOk={handleModalOk}
      onCancel={handleModalCancel}
    >
      <Form>
        <Form.Item label="Путь родителя" name="url">
          <Select
            style={{ width: '100%' }}
            placeholder="Путь"
            value={formData.parentId}
            onChange={value => setFormData({ ...formData, parentId: value })}
          >
            {urls.map(item => (
              <Select.Option key={item.id} value={item.url}>
                {item.url}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Название" rules={[{ required: true }]}>
          <Row gutter={[0, 0]}>
            <Col flex="8%">
              <Input value={'/'} readOnly={true} style={{ backgroundColor: '#FAFAFA' }} />
            </Col>
            <Col flex="92%">
              <Input
                value={formData.urlName}
                onChange={e => setFormData({ ...formData, urlName: e.target.value })}
              />
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  )
}
