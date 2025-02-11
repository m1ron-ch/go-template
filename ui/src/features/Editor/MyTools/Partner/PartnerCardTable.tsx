import React, { useState } from 'react';
import { Table, Button, Input, Modal, Spin, List } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';

type PartnerCardData = {
  key: number;
  title: string;
  description: string;
  image: string;
  link: {
    href: string;
    text: string;
  };
};

type PartnerCardTableProps = {
  data?: PartnerCardData[];
  onChange: (data: PartnerCardData[]) => void;
};

const PartnerCardTable: React.FC<PartnerCardTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<PartnerCardData[]>(data);
  const [count, setCount] = useState(data.length);

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [urls, setUrls] = useState<{ filename: string; url: string }[]>([]);
  const [currentSelection, setCurrentSelection] = useState<{ key: number, field: keyof PartnerCardData } | null>(null);

  const openImageSelectionDialog = async (key: number) => {
    setCurrentSelection({ key, field: 'image' });
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
          return { ...item, image: url };
        }
        return item;
      });
      setDataSource(updatedData);
      onChange(updatedData);
    }
    setIsImageModalVisible(false);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, key: number, field: keyof PartnerCardData | 'link.href' | 'link.text') => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        if (field.startsWith('link.')) {
          const linkField = field.split('.')[1] as keyof PartnerCardData['link'];
          return { 
            ...item, 
            link: { 
              ...item.link, 
              [linkField]: e.target.value 
            } 
          };
        }
        return { ...item, [field]: e.target.value };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleAddCard = () => {
    const newCard: PartnerCardData = { key: count, title: '', description: '', image: '', link: { href: '', text: '' } };
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

  const columns = [
    {
      title: 'Изображение',
      dataIndex: 'image',
      key: 'image',
      render: (_: string, record: PartnerCardData) => (
        <div>
          {record.image && <img src={record.image} alt={record.title} style={{ maxWidth: '100px', marginBottom: '10px' }} />}
          <Button onClick={() => openImageSelectionDialog(record.key)} icon={<PlusOutlined />}>
            Выбрать изображение
          </Button>
        </div>
      ),
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
      render: (_: string, record: PartnerCardData) => (
        <Input value={record.title} onChange={e => handleFieldChange(e, record.key, 'title')} />
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (_: string, record: PartnerCardData) => (
        <Input value={record.description} onChange={e => handleFieldChange(e, record.key, 'description')} />
      ),
    },
    {
      title: 'Ссылка (URL)',
      dataIndex: ['link', 'href'],
      key: 'link.href',
      render: (_: string, record: PartnerCardData) => (
        <Input value={record.link.href} onChange={e => handleFieldChange(e, record.key, 'link.href')} />
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: PartnerCardData) => (
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
        rowKey="key"
        pagination={false}
        footer={() => (
          <Button
            type="dashed"
            onClick={handleAddCard}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Добавить партнера
          </Button>
        )}
      />

      <Modal
        title="Выберите изображение"
        visible={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        width={800}
      >
        {loadingUrls ? (
          <Spin />
        ) : (
          <List
            grid={{ gutter: 16, column: 4 }}
            bordered
            dataSource={urls}
            renderItem={(urlData) => (
              <List.Item
                key={urlData.filename}
                onClick={() => handleUrlSelect(urlData.url)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '8px', 
                  backgroundColor: '#fafafa',
                  padding: '10px'
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
                  <div>{urlData.filename}</div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default PartnerCardTable;
