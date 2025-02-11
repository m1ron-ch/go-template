import React, { useState } from 'react';
import { Table, Button, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';

import ImageSelectionModal from '@/features/Modals/ImageSelectionModal';
import UrlSelectionModal from '@/features/Modals/UrlSelectionModal';

type FeatureCardData = {
  key: number;
  title: string;
  description: string;
  link: string;
  image: string;
};

type FeatureCardTableProps = {
  data?: FeatureCardData[];
  onChange: (data: FeatureCardData[]) => void;
};

const FeatureCardTable: React.FC<FeatureCardTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<FeatureCardData[]>(data);
  const [count, setCount] = useState(data.length);

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [urls, setUrls] = useState<{ filename: string; url: string }[]>([]);
  const [currentSelection, setCurrentSelection] = useState<{
    key: number;
    field: keyof FeatureCardData;
  } | null>(null);

  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);

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

  const openLinkSelectionDialog = async (key: number) => {
    setCurrentSelection({ key, field: 'link' });
    setIsLinkModalVisible(true);
    setLoadingUrls(true);

    try {
      const response = await fetch(`${AppSettings.API_URL}urls`, {
        credentials: 'include',
      });
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleUrlSelect = (url: string) => {
    if (currentSelection) {
      const updatedData = dataSource.map((item) => {
        if (item.key === currentSelection.key) {
          return { ...item, [currentSelection.field]: url };
        }
        return item;
      });
      setDataSource(updatedData);
      onChange(updatedData);
    }
    setIsImageModalVisible(false);
    setIsLinkModalVisible(false);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
    field: keyof FeatureCardData
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
    const newCard: FeatureCardData = {
      key: count,
      title: '',
      description: '',
      link: '',
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
      render: (_: string, record: FeatureCardData) => (
        <Input
          value={record.title}
          onChange={(e) => handleFieldChange(e, record.key, 'title')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (_: string, record: FeatureCardData) => (
        <Input
          value={record.description}
          onChange={(e) => handleFieldChange(e, record.key, 'description')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Ссылка',
      dataIndex: 'link',
      key: 'link',
      render: (_: string, record: FeatureCardData) => (
        <Input
          value={record.link}
          onClick={() => openLinkSelectionDialog(record.key)}
          placeholder="Выберите ссылку"
          readOnly
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Изображение',
      dataIndex: 'image',
      key: 'image',
      render: (_: string, record: FeatureCardData) => (
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
      render: (_: string, record: FeatureCardData) => (
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

      <ImageSelectionModal
        visible={isImageModalVisible}
        loading={loadingUrls}
        data={urls}
        onCancel={() => setIsImageModalVisible(false)}
        onSelect={handleUrlSelect}
      />

      <UrlSelectionModal
        visible={isLinkModalVisible}
        loading={loadingUrls}
        data={urls}
        onCancel={() => setIsLinkModalVisible(false)}
        onSelect={handleUrlSelect}
      />
    </div>
  );
};

export default FeatureCardTable;
