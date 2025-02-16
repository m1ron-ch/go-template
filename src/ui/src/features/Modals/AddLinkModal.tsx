import React, { useState } from 'react'
import { Modal, Form, Select, Input, Button, message } from 'antd'
import { AppSettings } from '@/shared'

interface Url {
  uid: number
  url: string
  is_occupied: boolean
}

interface AddLinkModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
  urls: Url[]
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  urls,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [form] = Form.useForm()

  const handleOk = async () => {
    try {
      setIsLoading(true)
      const values = await form.validateFields()
      const payload = {
        parent_id: values.url_id,
        url: `${values.url}`,
      }

      console.log(JSON.stringify(payload))
      
      const response = await fetch(`${AppSettings.API_URL}url/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        message.success('Ссылка добавлена успешно')
        form.resetFields()
        onSuccess()
        onCancel()
      } else {
        message.error(`Ошибка добавления ссылки (${response.statusText})`)
        console.error('Error:', response.statusText)
      }
    } catch (error) {
      console.log('Validate Failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="Добавить новую ссылку"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      centered
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button loading={isLoading} key="submit" type="primary" onClick={handleOk}>
          Добавить
        </Button>,
      ]}
    >
      <Form form={form} layout="horizontal">
        <Form.Item
          label="Путь родителя"
          name="url_id"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Select style={{ width: '100%' }} placeholder="Выберите путь">
            <Select.Option value={undefined}>Не выбрано</Select.Option>
            {urls.map(item => (
              <Select.Option key={item.uid} value={item.uid}>
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
  )
}
