import React, { useState } from 'react';
import { Table, Button, Input, Modal, Spin, List } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';

type EvidenceCardData = {
  key: number;
  title: string;
  description: string;
  images: string[];
};

type EvidenceCardTableProps = {
  data?: EvidenceCardData[];
  onChange: (data: EvidenceCardData[]) => void;
};

const EvidenceCardTable: React.FC<EvidenceCardTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<EvidenceCardData[]>(data);
  const [count, setCount] = useState(data.length);

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [urls, setUrls] = useState<{ filename: string; url: string }[]>([]);
  const [currentSelection, setCurrentSelection] = useState<{ key: number, field: keyof EvidenceCardData } | null>(null);

  const openImageSelectionDialog = async (key: number) => {
    setCurrentSelection({ key, field: 'images' }); // Поле изменено на 'images'
    setIsImageModalVisible(true);
    setLoadingUrls(true);

    try {
      const response = await fetch(`${AppSettings.API_URL}media`, {
        credentials: 'include',
      });
      const data = await response.json();
      const files = data.data || data;
      const filteredData = files.filter((item: { type: string }) => item.type === 'image');
      setUrls(filteredData);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleUrlSelect = (url: string) => {
    if (currentSelection) {
      const updatedData = dataSource.map(item => {
        if (item.key === currentSelection.key) {
          return { ...item, images: [...item.images, url] }; // Добавление изображения в массив
        }
        return item;
      });
      setDataSource(updatedData);
      onChange(updatedData);
    }
    setIsImageModalVisible(false);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, key: number, field: keyof EvidenceCardData) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        return { ...item, [field]: e.target.value };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleAddCard = () => {
    const newCard: EvidenceCardData = { key: count, title: '', description: '', images: [] };
    const updatedData = [...dataSource, newCard];
    setDataSource(updatedData);
    onChange(updatedData);
    setCount(count + 1);
  };

  const handleDeleteCard = (key: number) => {
    const updatedData = dataSource.filter(item => item.key !== key);
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleDeleteImage = (key: number, imageUrl: string) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        return { ...item, images: item.images.filter(img => img !== imageUrl) };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const columns = [
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
      render: (_: string, record: EvidenceCardData) => (
        <Input value={record.title} onChange={e => handleFieldChange(e, record.key, 'title')} />
      ),
    },
    {
      title: 'Описание', // Добавлен столбец для описания
      dataIndex: 'description',
      key: 'description',
      render: (_: string, record: EvidenceCardData) => (
        <Input value={record.description} onChange={e => handleFieldChange(e, record.key, 'description')} />
      ),
    },
    {
      title: 'Изображения',
      dataIndex: 'images',
      key: 'images',
      render: (_: string, record: EvidenceCardData) => (
        <div>
          {record.images.map((image, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <img src={image} alt={`Image ${index + 1}`} style={{ maxWidth: '100px', marginRight: '10px' }} />
              <Button
                danger
                onClick={() => handleDeleteImage(record.key, image)}
                icon={<DeleteOutlined />}
                size="small"
              />
            </div>
          ))}
          <Button onClick={() => openImageSelectionDialog(record.key)} icon={<PlusOutlined />}>
            Добавить изображение
          </Button>
        </div>
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: EvidenceCardData) => (
        <Button
          danger
          onClick={() => handleDeleteCard(record.key)}
          icon={<DeleteOutlined />}
        />
      ),
    },
  ];

  return (
    <div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        footer={() => (
          <Button
            type="dashed"
            onClick={handleAddCard}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Добавить запись
          </Button>
        )}
      />

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
          <List
            grid={{ gutter: 16, column: 6 }}
            bordered
            dataSource={urls}
            renderItem={(urlData) => (
              <List.Item
                key={urlData.filename}
                onClick={() => handleUrlSelect(urlData.url)}
                style={{
                    width: '100%', 
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ 
                  width: '100%', 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '8px', 
                  backgroundColor: '#fafafa' 
                }}>
                  <img 
                    src={urlData.url} 
                    alt={urlData.filename} 
                    style={{ 
                      width: '100%', 
                      height: '100px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }} 
                  />
                  {urlData.filename}
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default EvidenceCardTable;
