import React, { useState } from 'react';
import { Table, Button, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TinyMCEEditorModal from '../TinyMCEEditorModal';

type FeatureCardData = {
  key: number;
  title: string;
  description: string;
  richText: string;
};

type FeatureCardTableProps = {
  data?: FeatureCardData[];
  onChange: (data: FeatureCardData[]) => void;
};

const FeatureCardTable: React.FC<FeatureCardTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<FeatureCardData[]>(data);
  const [count, setCount] = useState(data.length);

  const [editingCardKey, setEditingCardKey] = useState<number | null>(null);
  const [isEditorModalVisible, setIsEditorModalVisible] = useState(false);

  const startEditingRichText = (key: number) => {
    setEditingCardKey(key);
    setIsEditorModalVisible(true);
  };

  const handleSaveRichText = (newContent: string) => {
    if (editingCardKey !== null) {
      const updatedData = dataSource.map((card) => {
        if (card.key === editingCardKey) {
          return { ...card, richText: newContent };
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
      richText: '',
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
      title: 'Полное описание',
      dataIndex: 'richText',
      key: 'richText',
      render: (_: string, record: FeatureCardData) => (
        <Button onClick={() => startEditingRichText(record.key)}>
          Редактировать полное описание
        </Button>
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
      <TinyMCEEditorModal
        visible={isEditorModalVisible}
        initialValue={
          editingCardKey !== null
            ? dataSource.find((card) => card.key === editingCardKey)?.richText || ''
            : ''
        }
        onSave={handleSaveRichText}
        onCancel={handleCancelEditorModal}
      />

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
    </div>
  );
};

export default FeatureCardTable;
