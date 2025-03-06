import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal, Spin, List } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';

type Document = {
  key: number;
  name: string;
  url: string;
};

type PurchaseData = {
  key: number;
  title: string;
  startDate: string;
  endDate: string;
  documents: Document[];
};

type PurchaseTableProps = {
  data?: PurchaseData[];
  onChange: (data: PurchaseData[]) => void;
};

const PurchaseTable: React.FC<PurchaseTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<PurchaseData[]>(data);
  const [count, setCount] = useState(data.length);
  const [isUrlModalVisible, setIsUrlModalVisible] = useState(false);
  const [currentDocIndex, setCurrentDocIndex] = useState<number | null>(null);
  const [currentPurchaseIndex, setCurrentPurchaseIndex] = useState<number | null>(null);
  const [urls, setUrls] = useState<{ filename: string; url: string; type: string }[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);

  const openFileSelectionDialog = async (purchaseIndex: number, docIndex: number) => {
    setCurrentPurchaseIndex(purchaseIndex);
    setCurrentDocIndex(docIndex);
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
    if (currentDocIndex !== null && currentPurchaseIndex !== null) {
      const updatedData = dataSource.map((purchase, pIndex) => {
        if (pIndex === currentPurchaseIndex) {
          const updatedDocs = purchase.documents.map((doc, dIndex) => {
            if (dIndex === currentDocIndex) {
              return { ...doc, url };
            }
            return doc;
          });
          return { ...purchase, documents: updatedDocs };
        }
        return purchase;
      });
      setDataSource(updatedData);
      onChange(updatedData);
    }
    setIsUrlModalVisible(false);
  };

  const handleAddPurchase = () => {
    const newData: PurchaseData = {
      key: count,
      title: '',
      startDate: '',
      endDate: '',
      documents: [],
    };
    const updatedData = [...dataSource, newData];
    setDataSource(updatedData);
    onChange(updatedData);
    setCount(count + 1);
  };

  const handleDeletePurchase = (key: number) => {
    const updatedData = dataSource.filter((item) => item.key !== key);
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
    field: keyof PurchaseData
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

  const handleAddDocument = (purchaseIndex: number) => {
    const updatedData = dataSource.map((purchase, index) => {
      if (index === purchaseIndex) {
        const newDocument: Document = {
          key: purchase.documents.length,
          name: '',
          url: '',
        };
        return { ...purchase, documents: [...purchase.documents, newDocument] };
      }
      return purchase;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleDeleteDocument = (purchaseIndex: number, docKey: number) => {
    const updatedData = dataSource.map((purchase, pIndex) => {
      if (pIndex === purchaseIndex) {
        const updatedDocs = purchase.documents.filter((doc) => doc.key !== docKey);
        return { ...purchase, documents: updatedDocs };
      }
      return purchase;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleDocFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    purchaseIndex: number,
    docKey: number,
    field: keyof Document
  ) => {
    const updatedData = dataSource.map((purchase, pIndex) => {
      if (pIndex === purchaseIndex) {
        const updatedDocs = purchase.documents.map((doc) => {
          if (doc.key === docKey) {
            return { ...doc, [field]: e.target.value };
          }
          return doc;
        });
        return { ...purchase, documents: updatedDocs };
      }
      return purchase;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const columns = [
    {
      title: 'Наименование закупки',
      dataIndex: 'title',
      key: 'title',
      render: (_: string, record: PurchaseData) => (
        <Input
          value={record.title}
          onChange={(e) => handleFieldChange(e, record.key, 'title')}
        />
      ),
    },
    {
      title: 'Дата размещения закупки',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (_: string, record: PurchaseData) => (
        <Input
          value={record.startDate}
          onChange={(e) => handleFieldChange(e, record.key, 'startDate')}
        />
      ),
    },
    {
      title: 'Дата окончания подачи предложений',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (_: string, record: PurchaseData) => (
        <Input
          value={record.endDate}
          onChange={(e) => handleFieldChange(e, record.key, 'endDate')}
        />
      ),
    },
    {
      title: 'Документы',
      key: 'documents',
      render: (_: string, record: PurchaseData, index: number) => (
        <>
          <Button onClick={() => handleAddDocument(index)} type="dashed" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
            Добавить документ
          </Button>
          {record.documents.map((doc, docIndex) => (
            <Space key={doc.key} direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="Название документа"
                value={doc.name}
                onChange={(e) => handleDocFieldChange(e, index, doc.key, 'name')}
              />
              <Space>
                <Input
                  placeholder="Выберите файл"
                  value={doc.url}
                  onClick={() => openFileSelectionDialog(index, docIndex)}
                  readOnly
                />
                {doc.url && (
                  <>
                    <Button icon={<EyeOutlined />} href={doc.url} target="_blank" />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteDocument(index, doc.key)} />
                  </>
                )}
              </Space>
            </Space>
          ))}
        </>
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: PurchaseData) => (
        <Button
          danger
          onClick={() => handleDeletePurchase(record.key)}
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
            onClick={handleAddPurchase}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Добавить новую закупку
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

export default PurchaseTable;
