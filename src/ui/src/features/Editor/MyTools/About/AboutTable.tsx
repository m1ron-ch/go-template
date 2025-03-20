import React, { useState, useEffect } from 'react';
import { Input, Button, Modal, Spin } from 'antd';
import { AppSettings } from '@/shared';

interface AboutData {
  image?: string;
  title?: string;
  description?: string;
  link?: string;
}

interface AboutTableProps {
  data?: AboutData;
  onChange: (data: AboutData) => void;
}

const AboutTable: React.FC<AboutTableProps> = ({ data = {}, onChange }) => {
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [link, setLink] = useState(data.link || '');
  const [image, setImage] = useState(`${data.image}` || '');

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [items, setItems] = useState<{ filename: string; url: string; type?: string }[]>([]);

  useEffect(() => {
    onChange({ title, description, link, image });
    console.log(AppSettings.API_URL.slice(0, -1)+data.image);
  }, [title, description, link, image]);

  const openImageSelectionDialog = async () => {
    setIsImageModalVisible(true);
    setLoadingUrls(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}media`, {
        credentials: 'include',
      });
      const data = await response.json();
      const files = data.data || data;
      const filteredData = files.filter((item: { type: string }) => item.type === 'image');
      setItems(filteredData);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoadingUrls(false);
    }
  };

  const openLinkSelectionDialog = async () => {
    setIsLinkModalVisible(true);
    setLoadingUrls(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}urls`, {
        credentials: 'include',
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleImageSelect = (url: string) => {
    setImage(url);
    setIsImageModalVisible(false);
  };

  const handleLinkSelect = (url: string) => {
    setLink(url);
    setIsLinkModalVisible(false);
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '8px' }}>
        <Button onClick={openImageSelectionDialog}>Выбрать изображение</Button>
        {image && <img src={image} alt="Selected" style={{ display: 'block', maxHeight: '100px', marginTop: '8px' }} />}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Input
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Input.TextArea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Button onClick={openLinkSelectionDialog}>
          {link ? `Текущая ссылка: ${link}` : 'Выбрать ссылку'}
        </Button>
      </div>

      <Modal
        title="Выберите изображение"
        open={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        width={1200}
      >
        {loadingUrls ? (
          <Spin />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {items.map((urlData) => (
              <div
                key={urlData.filename}
                onClick={() => handleImageSelect(urlData.url)}
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '10px',
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={urlData.url}
                  alt={urlData.filename}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        title="Выберите ссылку"
        open={isLinkModalVisible}
        onCancel={() => setIsLinkModalVisible(false)}
        footer={null}
        width={800}
      >
        {loadingUrls ? (
          <Spin />
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {items.map((urlData) => (
              <div
                key={urlData.filename || urlData.url}
                onClick={() => handleLinkSelect(urlData.url)}
                style={{
                  cursor: 'pointer',
                  padding: '8px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                {urlData.url}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AboutTable;
