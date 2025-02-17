import React, { useState, useEffect } from 'react';
import {
  List,
  Card,
  Image,
  Button,
  message,
  Modal,
  Spin,
  Space,
  Tooltip,
  Upload,
  Empty, // <-- Import Empty
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async () => {
    try {
      const response = await fetch(
        `${AppSettings.API_URL}/media`,
        { credentials: 'include' }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
  
      const data: { data: MediaItem[] } = await response.json();
  
      setMediaItems(data.data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      message.error('Failed to load media files.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const confirmDelete = (index: number, filename: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this media file?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => onRemoveMediaItem(index, filename),
    });
  };

  const onRemoveMediaItem = async (index: number, filename: string) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}/media/delete`, {
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
      message.success('Media file successfully deleted.');
    } catch (error) {
      console.error('Error deleting media item:', error);
      message.error('Failed to delete media file.');
    }
  };

  const onCopyMediaPath = async (mediaURL: string) => {
    try {
      await navigator.clipboard.writeText(mediaURL);
      message.success('URL copied to clipboard.');
    } catch (error) {
      console.error('Error copying media path:', error);
      message.error('Failed to copy URL.');
    }
  };

  const customUpload = async (options: any) => {
    const { onSuccess, onError, file } = options;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${AppSettings.API_URL}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        onSuccess(null, file);
        fetchMedia();
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
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`Failed to upload ${info.file.name}.`);
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
        <p className="ant-upload-text">Drag files here or click to select</p>
        <p className="ant-upload-hint">You can upload multiple files at once.</p>
      </Upload.Dragger>

      {isLoading ? (
        <Spin indicator={<LoadingOutlined spin />} size="large" className={s.spinner} />
      ) : mediaItems.length === 0 ? (
        <Empty description="No uploaded media files" />
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
                        <Tooltip title="Copy link" placement="right">
                          <Button icon={<CopyOutlined />} onClick={() => onCopyMediaPath(item.url)} />
                        </Tooltip>
                        <Tooltip title="View" placement="right">
                          <Button
                            icon={item.type === 'image' ? <EyeOutlined /> : <DownloadOutlined />}
                            onClick={() => window.open(item.url, '_blank')}
                          />
                        </Tooltip>
                        <Tooltip title="Delete" placement="right">
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
        </>
      )}
    </section>
  );
};

export default MediaLibrary;
