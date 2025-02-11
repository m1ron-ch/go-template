import React, { useState, useEffect } from 'react';
import {
  List,
  Card,
  Image,
  Button,
  message,
  Modal,
  Spin,
  Pagination,
  Space,
  Tooltip,
  Upload,
  Empty, // <-- Импортируем Empty
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileOutlined,
  LoadingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { AppSettings } from '@/shared';
import s from './MediaLibrary.module.scss';

interface MediaItem {
  upload_date: string;
  filename: string;
  url: string;
  type: string;
}

export const MediaLibrary: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async (page: number, limit: number) => {
    try {
      const response = await fetch(
        `${AppSettings.API_URL}media?page=${page}&limit=${limit}`,
        { credentials: 'include' }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
  
      const data: { data: MediaItem[] | null; total: number } = await response.json();
  
      setMediaItems(data.data || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error('Error fetching media:', error);
      message.error('Не удалось загрузить медиафайлы.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(currentPage, pageSize);
  }, [currentPage]);

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
    fetchMedia(page, pageSize);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const customUpload = async (options: any) => {
    const { onSuccess, onError, file } = options;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${AppSettings.API_URL}media/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        onSuccess(null, file);
        fetchMedia(currentPage, pageSize);
      } else {
        onError('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      onError('Error uploading file');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    customRequest: customUpload,
    showUploadList: false,
    style: { marginBottom: '16px' },
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} файл успешно загружен.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} не удалось загрузить файл.`);
      }
    },
  };

  return (
    <section className={s.list}>
      <Upload.Dragger
        {...uploadProps}
        style={{ background: 'rgba(0, 0, 0, 0)', marginBottom: '20px' }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">Перетащите файлы сюда или нажмите, чтобы выбрать</p>
        <p className="ant-upload-hint">Можно загрузить несколько файлов одновременно.</p>
      </Upload.Dragger>

      {isLoading ? (
        <Spin indicator={<LoadingOutlined spin />} size="large" className={s.spinner} />
      ) : mediaItems.length === 0 ? (
        <Empty description="Нет загруженных медиафайлов" />
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
                      <Image
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        src={item.url}
                        className={s.image}
                      />
                    ) : (
                      <div className={s.fileIconWrapper}>
                        <FileOutlined className={s.fileIcon} />
                      </div>
                    )
                  }
                >
                  <div className={s.cardActions}>
                    <Space>
                      <Space direction="vertical">
                        <Tooltip title="Копировать ссылку" placement="right">
                          <Button icon={<CopyOutlined />} onClick={() => onCopyMediaPath(item.url)} />
                        </Tooltip>
                        <Tooltip title="Просмотр" placement="right">
                          <Button
                            icon={item.type === 'image' ? <EyeOutlined /> : <DownloadOutlined />}
                            onClick={() => window.open(item.url, '_blank')}
                          />
                        </Tooltip>
                        <Tooltip title="Удалить" placement="right">
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => confirmDelete(index, item.filename)}
                          />
                        </Tooltip>
                      </Space>
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

export default MediaLibrary;
