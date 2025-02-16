import React, { useState } from 'react';
import { Table, Button, Input, Modal, Spin, List } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';

type AchievementCardData = {
  key: number;
  title: string;
  value: string;
  description: string;
  image: string;
};

type AchievementCardTableProps = {
  data?: AchievementCardData[];
  onChange: (data: AchievementCardData[]) => void;
};

const AchievementCardTable: React.FC<AchievementCardTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<AchievementCardData[]>(data);
  const [count, setCount] = useState(data.length);

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [urls, setUrls] = useState<{ filename: string; url: string }[]>([]);
  const [currentSelection, setCurrentSelection] = useState<{ key: number, field: keyof AchievementCardData } | null>(null);

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
          return { ...item, [currentSelection.field]: url };
        }
        return item;
      });
      setDataSource(updatedData);
      onChange(updatedData);
    }
    setIsImageModalVisible(false);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
    field: keyof AchievementCardData
  ) => {
    const updatedData = dataSource.map((item) => {
      if (item.key === key) {
        return { ...item, [field]: e.target.value };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleAddCard = () => {
    const newCard: AchievementCardData = {
      key: count,
      title: '',
      value: '',
      description: '',
      image: '',
    };
    const updatedData = [...dataSource, newCard];
    setDataSource(updatedData);
    onChange(updatedData);
    setCount(count + 1);
  };

  const handleDeleteCard = (key: number) => {
    const updatedData = dataSource.filter((item) => item.key !== key);
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const columns = [
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
      render: (_: string, record: AchievementCardData) => (
        <Input
          value={record.title}
          onChange={(e) => handleFieldChange(e, record.key, 'title')}
          style={{ width: '100%' }}
        />
      ),
    },
    // {
    //   title: 'Значение',
    //   dataIndex: 'value',
    //   key: 'value',
    //   render: (_: string, record: AchievementCardData) => (
    //     <Input
    //       value={record.value}
    //       onChange={(e) => handleFieldChange(e, record.key, 'value')}
    //       style={{ width: '100%' }}
    //     />
    //   ),
    // },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (_: string, record: AchievementCardData) => (
        <Input
          value={record.description}
          onChange={(e) => handleFieldChange(e, record.key, 'description')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Изображение',
      dataIndex: 'image',
      key: 'image',
      render: (_: string, record: AchievementCardData) => (
        <Input
          value={record.image}
          onClick={() => openImageSelectionDialog(record.key)}
          placeholder="Выберите изображение"
          readOnly
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: AchievementCardData) => (
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
            Добавить карточку
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

export default AchievementCardTable;
