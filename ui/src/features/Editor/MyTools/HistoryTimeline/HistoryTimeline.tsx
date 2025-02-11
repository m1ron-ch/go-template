import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal, Spin, List } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import TinyMCEEditorModal from '../TinyMCEEditorModal';
import { AppSettings } from '@/shared';

type HistoryCardData = {
  key: string;
  year: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
};

type HistoryTimelineProps = {
  data?: HistoryCardData[];
  onChange: (data: HistoryCardData[]) => void;
};

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<HistoryCardData[]>(data);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null);
  const [urls, setUrls] = useState<{ filename: string; url: string; type: string }[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);

  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
  const [isEditingShortDescription, setIsEditingShortDescription] = useState(false);
  const [isEditorModalVisible, setIsEditorModalVisible] = useState(false);

  const openFileSelectionDialog = async (index: number) => {
    setCurrentCardIndex(index);
    setIsModalVisible(true);
    setLoadingUrls(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}media`, {
        credentials: 'include',
      });
      const data = await response.json();

      const files = data.data;
      const filteredData = files.filter((item: { type: string }) => item.type === 'image');
      setUrls(filteredData);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleUrlSelect = (url: string) => {
    if (currentCardIndex !== null) {
      const updatedData = dataSource.map((card, i) =>
        i === currentCardIndex ? { ...card, image: url } : card
      );
      setDataSource(updatedData);
      onChange(updatedData);
    }
    setIsModalVisible(false);
  };

  const startEditingDescription = (key: string, isShortDescription: boolean) => {
    setEditingCardKey(key);
    setIsEditingShortDescription(isShortDescription);
    setIsEditorModalVisible(true);
  };

  const handleSaveDescription = (newContent: string) => {
    if (editingCardKey) {
      const updatedData = dataSource.map((card) => {
        if (card.key === editingCardKey) {
          return {
            ...card,
            ...(isEditingShortDescription ? { shortDescription: newContent } : { fullDescription: newContent }),
          };
        }
        return card;
      });
      setDataSource(updatedData);
      onChange(updatedData);
    }
    setIsEditorModalVisible(false);
  };

  const handleCancelEditorModal = () => {
    setIsEditorModalVisible(false);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
    field: keyof HistoryCardData
  ) => {
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
    const newData: HistoryCardData = {
      key: Date.now().toString(),
      year: '',
      image: '',
      shortDescription: '',
      fullDescription: '',
    };
    const updatedData = [...dataSource, newData];
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleDeleteCard = (key: string) => {
    const updatedData = dataSource.filter(item => item.key !== key);
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const columns = [
    {
      title: 'Год',
      dataIndex: 'year',
      key: 'year',
      render: (_: string, record: HistoryCardData) => (
        <Input
          value={record.year}
          onChange={(e) => handleFieldChange(e, record.key, 'year')}
        />
      ),
    },
    {
      title: 'Изображение',
      dataIndex: 'image',
      key: 'image',
      render: (_: string, record: HistoryCardData, index: number) => (
        <Space>
          <Input
            value={record.image}
            onClick={() => openFileSelectionDialog(index)}
            placeholder="Выберите изображение"
            readOnly
          />
          {record.image && (
            <Button icon={<EyeOutlined />} href={record.image} target="_blank" />
          )}
        </Space>
      ),
    },
    {
      title: 'Краткое описание',
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      render: (_: string, record: HistoryCardData) => (
        <Button onClick={() => startEditingDescription(record.key, true)}>
          Редактировать краткое описание
        </Button>
      ),
    },
    {
      title: 'Полное описание',
      dataIndex: 'fullDescription',
      key: 'fullDescription',
      render: (_: string, record: HistoryCardData) => (
        <Button onClick={() => startEditingDescription(record.key, false)}>
          Редактировать полное описание
        </Button>
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: HistoryCardData) => (
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
      <TinyMCEEditorModal
        visible={isEditorModalVisible}
        initialValue={
          editingCardKey
            ? dataSource.find((card) => card.key === editingCardKey)?.[isEditingShortDescription ? 'shortDescription' : 'fullDescription'] || ''
            : ''
        }
        onSave={handleSaveDescription}
        onCancel={handleCancelEditorModal}
      />

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowKey="key" 
        footer={() => (
          <Button
            type="dashed"
            onClick={handleAddCard}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Добавить новую карточку
          </Button>
        )}
      />

      <Modal
        title="Выберите изображение"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {loadingUrls ? (
          <Spin />
        ) : (
          <List
            bordered
            dataSource={urls}
            renderItem={(urlData) => (
              <List.Item
                key={urlData.filename}
                onClick={() => handleUrlSelect(urlData.url)}
                style={{ cursor: 'pointer' }}
              >
                <img src={urlData.url} alt={urlData.filename} style={{ width: 150, marginRight: 10 }} />
                {urlData.filename}
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default HistoryTimeline;
