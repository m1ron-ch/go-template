import React, { useEffect, useState } from 'react'
import { message, Spin } from 'antd'
import { AppSettings } from '@/shared'

interface ContactData {
  content: string
  json: string | object
}

export const ContactUs: React.FC = () => {
  const [contactHTML, setContactHTML] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchContactData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${AppSettings.API_URL}/contact_us`, {
          method: 'GET',
          credentials: 'include'
        })
        if (!response.ok) {
          throw new Error('Failed to fetch contact info')
        }
        const data: ContactData = await response.json()
        setContactHTML(data.content)
      } catch (error) {
        console.error('Error fetching contact info:', error)
        message.error('Не удалось получить контактную информацию.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchContactData()
  }, [])

  return (
    <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '24px' }}>
      {isLoading ? (
        <Spin tip="Загрузка..." />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: contactHTML }} />
      )}
    </div>
  )
}
