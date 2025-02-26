import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { message, Card, Typography, Spin, Image } from 'antd';
import { AppSettings } from '@/shared';

const { Title, Text } = Typography;

interface User {
  name: string;
}

interface NewsItem {
  id: number;
  title: string;
  content: string; // HTML-контент
  image: string;
  created_at: string;
  user: User;
}

export const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNewsById = async (newsId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}/news/${newsId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch news item');
      }
      const result: NewsItem = await response.json();

      setNews(result);
    } catch (error) {
      console.error('Error fetching news item:', error);
      message.error('Не удалось получить новость.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNewsById(id);
    }
  }, [id]);

  const convertUTCToLocal = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!news) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Новость не найдена</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <Card
        title={
          <Title 
            level={2}
            style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
          >
            {news.title}
          </Title>
        }
        extra={<Text type="secondary">{convertUTCToLocal(news.created_at)}</Text>}
      >
        {news.image && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Image src={news.image} alt={news.title} style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: news.content }} style={{ marginBottom: '20px' }} />
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', textAlign: 'right' }}>
          <Text strong>Author: </Text>
          <Text>{news.user.name}</Text>
        </div>
      </Card>
    </div>
  );
};
