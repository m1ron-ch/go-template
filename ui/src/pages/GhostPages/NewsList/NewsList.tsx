import React, { useEffect, useState } from 'react'
import { List, Avatar, Typography, message, Spin } from 'antd'
import s from './NewsList.module.scss'
import { AppSettings } from '@/shared'

const { Text } = Typography

interface NewsItem {
  id: number
  title: string
  is_visibility: boolean
  content: string
  created_at: string
  date: string
  time: string
  user: {
    id: number
    name: string
    login: string
    role_id: number
    status_id: number
  }
  image: string
  description: string
}

export const NewsList: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${AppSettings.API_URL}/news_list`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      const result: NewsItem[] = await response.json()
      setNewsList(result)
    } catch (error) {
      console.error('Error fetching news:', error)
      message.error('Не удалось получить новости.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '24px' }}>
      {isLoading ? (
        <Spin tip="Loading..." />
      ) : (
        <List
          className={s.newsList}
          itemLayout="vertical"
          dataSource={newsList}
          renderItem={(item) => {
            return (
              <List.Item
                key={item.id}
                extra={
                  <div className={s.imgWrapper}>
                    <img
                      src={item.image}
                      alt="news"
                      className={s.newsImage}
                    />
                  </div>
                }
              >
                <List.Item.Meta
                  title={
                    <a href={`/news/${item.id}`} className={s.newsTitle}>
                      {item.title}
                    </a>
                  }
                  description={
                    <div className={s.metaRow}>
                      <div className={s.author}>
                        <Avatar
                          style={{ backgroundColor: '#87d068', marginRight: 8 }}
                          size="small"
                        >
                          {item.user?.name?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <Text>{item.user?.name}</Text>
                      </div>
                      {/* Отображаем дату/время, если есть */}
                      {(item.date || item.time) && (
                        <Text className={s.dateTime}>
                          {item.date} &nbsp; {item.time}
                        </Text>
                      )}
                    </div>
                  }
                />
                <div className={s.description}>
                  {item.description}
                </div>
              </List.Item>
            )
          }}
        />
      )}
    </div>
  )
}
