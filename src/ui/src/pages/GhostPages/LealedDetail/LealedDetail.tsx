import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { AppSettings } from '@/shared';
// Импортируйте при необходимости ваши настройки, типы и т.д.
// import { AppSettings } from '@/config';

interface NewsItem {
  id: number;
  title: string;
  content: string; // Здесь контент в формате HTML
  image: string;
  // ... остальные поля (image, description и т.д.)
}

export const LealedDetail: React.FC = () => {
  const { id } = useParams();       // достаём :id из URL
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

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!news) {
    return <div>Новость не найдена</div>;
  }

  return (
    <center>
      <div style={{ padding: 20, width: '1200px' }}>
      <h1>{news.title}</h1>
      <center><img style={{maxWidth: '400px'}} src={news.image} /></center>
      {/* Если news.content содержит HTML, выводим через dangerouslySetInnerHTML */}
      <div dangerouslySetInnerHTML={{ __html: news.content }} />
    </div>
    </center>
    
  );
};
