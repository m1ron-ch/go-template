import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal, Spin, List } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';

type SurveyLinkData = {
  key: number;
  description: string;
  link: string;
};

type SurveyTableProps = {
  data?: SurveyLinkData[];
  onChange: (data: SurveyLinkData[]) => void;
};

const SurveyTable: React.FC<SurveyTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<SurveyLinkData[]>(data);
  const [count, setCount] = useState(data.length);
  const [isUrlModalVisible, setIsUrlModalVisible] = useState(false);
  const [currentLinkInputIndex, setCurrentLinkInputIndex] = useState<number | null>(null);
  const [urls, setUrls] = useState<{ filename: string; url: string; type: string }[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);

  const openFileSelectionDialog = async (index: number) => {
    setCurrentLinkInputIndex(index);
    setIsUrlModalVisible(true);
    setLoadingUrls(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}media`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      const files = data.data;

      const filteredData = files.filter((item: { type: string }) => item.type === 'file');
      setUrls(filteredData);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleUrlSelect = (url: string) => {
    if (currentLinkInputIndex !== null) {
      handleLinkChange(url, currentLinkInputIndex);
    }
    setIsUrlModalVisible(false);
  };

  const handleLinkChange = (value: string, index: number) => {
    const updatedVacancies = dataSource.map((vacancy, i) =>
      i === index ? { ...vacancy, link: value } : vacancy
    );
    setDataSource(updatedVacancies);
    onChange(updatedVacancies);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
    field: keyof SurveyLinkData
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

  const handleAdd = () => {
    const newData: SurveyLinkData = {
      key: count,
      description: '',
      link: '',
    };
    const updatedData = [...dataSource, newData];
    setDataSource(updatedData);
    onChange(updatedData);
    setCount(count + 1);
  };

  const handleDelete = (key: number) => {
    const updatedData = dataSource.filter((item) => item.key !== key);
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const columns = [
    {
      title: 'Описание анкеты',
      dataIndex: 'description',
      key: 'description',
      render: (_: string, record: SurveyLinkData) => (
        <Input
          value={record.description}
          onChange={(e) => handleFieldChange(e, record.key, 'description')}
        />
      ),
    },
    {
      title: 'Ссылка на анкету',
      dataIndex: 'link',
      key: 'link',
      render: (_: string, record: SurveyLinkData, index: number) => (
        <Space>
          <Input
            value={record.link}
            onClick={() => openFileSelectionDialog(index)}
            placeholder="Выберите файл"
            readOnly
          />
          {record.link && (
            <Button icon={<EyeOutlined />} href={record.link} target="_blank" />
          )}
        </Space>
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: SurveyLinkData) => (
        <Button danger onClick={() => handleDelete(record.key)} icon={<DeleteOutlined />} />
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
            onClick={handleAdd}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Добавить новую запись
          </Button>
        )}
      />

      <Modal
        title="Выберите файл"
        open={isUrlModalVisible}
        onCancel={() => setIsUrlModalVisible(false)}
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
                {urlData.filename}
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default SurveyTable;
