import React, { useState, useEffect } from 'react';
import { List, Card, Image, Button, message, Modal, Spin, Pagination, Space, Tooltip } from 'antd';
import { CopyOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, FileOutlined, LoadingOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';
import s from './MediaList.module.scss';

interface MediaListProps {}

interface MediaItem {
  upload_date: string;
  filename: string;
  url: string;
  type: string;
}

export const MediaList: React.FC<MediaListProps> = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async (page: number, limit: number) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}media?page=${page}&limit=${limit}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }

      const data: { data: MediaItem[]; total: number } = await response.json();
      setMediaItems(data.data);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching media:', error);
      message.error('Не удалось загрузить медиафайлы.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const confirmDelete = (index: number, filename: string) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот медиафайл?',
      content: 'Это действие невозможно будет отменить.',
      okText: 'Да, удалить',
      okType: 'danger',
      cancelText: 'Нет',
      onOk: () => onRemoveMediaItem(index, filename),
    });
  };

  const onRemoveMediaItem = async (index: number, filename: string) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}media/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      const newMediaItems = [...mediaItems];
      newMediaItems.splice(index, 1);
      setMediaItems(newMediaItems);
      setTotalItems((prevTotal) => prevTotal - 1);
      message.success('Медиафайл успешно удален');
    } catch (error) {
      console.error('Error deleting media item:', error);
      message.error('Не удалось удалить медиафайл.');
    }
  };

  const onCopyMediaPath = async (mediaURL: string) => {
    try {
      await navigator.clipboard.writeText(mediaURL);
      message.success('URL скопирован в буфер обмена');
    } catch (error) {
      console.error('Error copying media path:', error);
      message.error('Не удалось скопировать URL');
    }
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <section className={s.list}>
      {isLoading ? (
        <Spin indicator={<LoadingOutlined spin />} size="large" className={s.spinner} />
      ) : (
        <>
          <List
            grid={{ gutter: 16, column: 5 }}
            dataSource={mediaItems}
            renderItem={(item, index) => (
              <List.Item>
                <Card
                  className={s.card}
                  cover={
                    item.type === 'image' ? (
                      <Image style={{ width: '100%', height: '200px' }} src={item.url} className={s.image} />
                    ) : (
                      <div className={s.fileIconWrapper}>
                        <FileOutlined className={s.fileIcon} />
                      </div>
                    )
                  }
                >
                  <div className={s.cardActions}>
                    <Space>
                      <Space.Compact direction="vertical">
                        <Tooltip title="Копировать ссылку" placement="right">
                          <Button icon={<CopyOutlined />} onClick={() => onCopyMediaPath(item.url)} />
                        </Tooltip>
                        <Tooltip title="Просмотр" placement="right">
                          <Button icon={item.type === 'image' ? <EyeOutlined /> : <DownloadOutlined />} onClick={() => window.open(item.url, '_blank')} />
                        </Tooltip>
                        <Tooltip title="Удалить" placement="right">
                          <Button style={{ color: 'red' }} icon={<DeleteOutlined />} onClick={() => confirmDelete(index, item.filename)} />
                        </Tooltip>
                      </Space.Compact>
                    </Space>
                  </div>
                  <Card.Meta title={item.filename} description={item.upload_date} />
                </Card>
              </List.Item>
            )}
          />
          <Pagination
            className={s.pagination}
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onChange={onPageChange}
          />
        </>
      )}
    </section>
  );
};

export default MediaList;
