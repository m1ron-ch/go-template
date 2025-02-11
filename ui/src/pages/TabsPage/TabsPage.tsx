import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Button, Form, Input, Modal, Select, Row, Col, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AppSettings } from '@/shared';
import s from './TabsPage.module.scss';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, UpOutlined, DownOutlined, SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import { Spacer } from '@/shared/Spacer';

interface TabData {
  id: number;
  title_ru: string;
  id_ru: number;
  title_by: string;
  id_by: number;
  title_en: string;
  id_en: number;
  url: string;
  url_id: number;
  sequence: number;
  parent_id?: number;
  children?: TabData[];
}

const levelColors: string[] = [
  'blue',
  'green',
  'volcano',
  'orange',
  'purple',
  'red',
];

interface Url {
  uid: number;
  url: string;
  is_occupied: boolean;
}

const getHierarchyLevel = (tab: TabData, data: TabData[], level: number = 0): number => {
  if (!tab.parent_id) return level;
  const parentTab = data.find(item => item.id === tab.parent_id);
  if (!parentTab) return level;
  return getHierarchyLevel(parentTab, data, level + 1);
};

export const TabsPage: React.FC = () => {
  const [data, setData] = useState<TabData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmLoading, setConfirmIsLoading] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [urls, setUrls] = useState<Url[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<TabData>({
    id: 0,
    title_ru: '',
    id_ru: 0,
    title_by: '',
    id_by: 0,
    title_en: '',
    id_en: 0,
    url: '',
    url_id: 0,
    sequence: 0,
  });

  const [form] = Form.useForm();

  const fetchUrls = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}urls`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch urls');
      }
      const result: Url[] = await response.json();
      setUrls(result);
    } catch (error) {
      console.error('Error fetching urls:', error);
      message.error('Failed to fetch urls');
    }
  }

  const fetchTabs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}tabs`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tabs');
      }
      const result: TabData[] = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching tabs:', error);
      message.error('Failed to fetch tabs');
    } finally {
      setIsLoading(false);
    }
  };

  const addTab = async (tab: TabData) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}tabs/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(tab),
      });
      if (!response.ok) {
        throw new Error('Failed to add tab');
      }
      const newTab: TabData = await response.json();
      setData([...data, newTab]);
      message.success('Tab added successfully');
    } catch (error) {
      console.error('Error adding tab:', error);
      message.error('Failed to add tab');
    }
  };

  const editTab = async (tab: TabData) => {
    try {
      setConfirmIsLoading(true);

      tab.sequence = Number(tab.sequence);
      console.log(JSON.stringify(tab));
      const response = await fetch(`${AppSettings.API_URL}tab/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(tab),
      });
      if (!response.ok) {
        throw new Error('Failed to edit tab');
      }
      // const updatedTab: TabData = await response.json();
      // setData(data.map(item => (item.id === updatedTab.id ? updatedTab : item)));
      fetchTabs();
      message.success('Вкладка изменена успешно');
    } catch (error) {
      console.error('Error editing tab:', error);
      message.error('Failed to edit tab');
    } finally {
      setConfirmIsLoading(false);
    }
  };

  const saveTabs = async () => {
    try {
      setIsSave(true);
      const response = await fetch(`${AppSettings.API_URL}tab/sequence/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to save tabs');
      }
      message.success('Вкладки сохранены успешно');
    } catch (error) {
      console.error('Error saving tabs:', error);
      message.error('Failed to save tabs');
    } finally {
      setIsSave(false);
    }
  };

  useEffect(() => {
    fetchTabs();
    fetchUrls();
  }, []);

  const handleAddClick = () => {
    setFormData({
      id: 0,
      title_ru: '',
      id_ru: 0,
      title_by: '',
      id_by: 0,
      title_en: '',
      id_en: 0,
      url: '',
      url_id: 0,
      sequence: data.length + 1,
    });
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      if (formData.id === 0) {
        await addTab({ ...formData, ...values });
      } else {
        await editTab({ ...formData, ...values });
      }
      setModalVisible(false);
      setFormData({
        id: 0,
        title_ru: '',
        id_ru: 0,
        title_by: '',
        id_by: 0,
        title_en: '',
        id_en: 0,
        url: '',
        url_id: 0,
        sequence: data.length + 1,
      });
    } catch (error) {
      console.error('Failed to validate form:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleEditClick = (record: TabData) => {
    setFormData({
      id: 0,
      title_ru: '',
      id_ru: 0,
      title_by: '',
      id_by: 0,
      title_en: '',
      id_en: 0,
      url: '',
      url_id: 0,
      sequence: data.length + 1,
    });
    setFormData(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDeleteClick = (id: number) => {
    setData(data.filter(tab => tab.id !== id));
  };

  const moveTab = (id: number, direction: 'up' | 'down') => {
    setData((prevData) => {
      const newData = [...prevData];
      const tabIndex = newData.findIndex(tab => tab.id === id);
      if (tabIndex === -1) return prevData;

      const tabToMove = newData[tabIndex];
      const swapIndex = direction === 'up' ? tabIndex - 1 : tabIndex + 1;

      if (swapIndex < 0 || swapIndex >= newData.length) return prevData;

      const swapTab = newData[swapIndex];

      const tempSequence = tabToMove.sequence;
      tabToMove.sequence = swapTab.sequence;
      swapTab.sequence = tempSequence;

      newData[tabIndex] = swapTab;
      newData[swapIndex] = tabToMove;

      return newData;
    });
  };

  const columns: ColumnsType<TabData> = [
    {
      title: 'Последовательность',
      dataIndex: 'sequence',
      key: 'sequence',
      width: '200px',
      render: (sequence: number, record: TabData) => {
        const level = getHierarchyLevel(record, data);
        const color = levelColors[level % levelColors.length];
        return (
          <Tag color={color}>
            {sequence || `Sequence ${sequence}`}
          </Tag>
        );
      },
    },
    {
      title: 'Заголовок RU',
      dataIndex: 'title_ru',
      key: 'title_ru',
    },
    {
      title: 'Заголовок BY',
      dataIndex: 'title_by',
      key: 'title_by',
    },
    {
      title: 'Заголовок EN',
      dataIndex: 'title_en',
      key: 'title_en',
    },
    {
      title: 'Путь',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => <a href={url}>{url}</a>,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: '210px',
      render: (record: TabData) => (
        <div className={s.actionIcons}>
          <Button
            icon={<UpOutlined />}
            onClick={() => moveTab(record.id, 'up')}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DownOutlined />}
            onClick={() => moveTab(record.id, 'down')}
            style={{ marginRight: 30 }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record.id)}
            danger
          />
        </div>
      ),
    },
  ];

  return (
    <div className={s.container}>
      {/* <Title level={1}>Вкладки</Title> */}
      <Spacer />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddClick}
        style={{ marginBottom: 16 }}
      >
        Добавить
      </Button>
      <Button
        type="default"
        icon={<ReloadOutlined />}
        onClick={fetchTabs}
        style={{ marginBottom: 16, marginLeft: 8 }}
      >
        Обновить
      </Button>
      <Button
        type="default"
        icon={<SaveOutlined />}
        onClick={saveTabs}
        style={{ marginBottom: 16, marginLeft: 8 }}
        loading={isSave}
      >
        Сохранить
      </Button>
      
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        loading={{
          spinning: isLoading,
          indicator: <Spin indicator={<LoadingOutlined spin />} size="large" className={s.spinner}/>
        }}
      />
      <Modal
        title={formData.id === 0 ? "Добавить вкладку" : "Редактировать вкладку"}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Отмена
          </Button>,
          <Button loading={isConfirmLoading} key="save" type="primary" onClick={handleModalOk}>
            Сохранить
          </Button>,
        ]}
      >
        <Form form={form} initialValues={formData}>
          <Form.Item
            label="Заголовок RU"
            name="title_ru"
            rules={[{ required: true, message: 'Пожалуйста, введите заголовок на русском' }]}
          >
            <Input value={formData.title_ru} onChange={e => setFormData({ ...formData, title_ru: e.target.value })} />
          </Form.Item>
          <Form.Item
            label="Заголовок BY"
            name="title_by"
            rules={[{ required: false, message: 'Пожалуйста, введите заголовок на белорусском' }]}
          >
            <Input value={formData.title_by} onChange={e => setFormData({ ...formData, title_by: e.target.value })} />
          </Form.Item>
          <Form.Item
            label="Заголовок EN"
            name="title_en"
            rules={[{ required: false, message: 'Пожалуйста, введите заголовок на английском' }]}
          >
            <Input value={formData.title_en} onChange={e => setFormData({ ...formData, title_en: e.target.value })} />
          </Form.Item>
          <Form.Item
            label="Путь родителя"
            name="url_id"
          >
            <Select
              value={formData.url_id}
              onChange={value => setFormData({ ...formData, url_id: value })}
              style={{ width: '100%' }}
              placeholder="Путь"
            >
              <Select.Option value={undefined}>Не выбрано</Select.Option>
              {urls.map(item => (
                <Select.Option
                  key={item.uid}
                  value={item.uid}
                  // disabled={()=> {
                  //   if (formData.id == 0) {
                  //     return false;
                  //   }
                  //   return item.is_occupied && item.uid !== formData.url_id;
                  // }}
                >
                  {item.url}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Путь"
            name="url"
            rules={[{ required: true, message: 'Пожалуйста, введите путь' }]}
            hidden={formData.id !== 0}
          >
            <Row gutter={[0, 0]}>
              <Col flex="8%">
                <Input value={'/'} readOnly={true} style={{ backgroundColor: '#FAFAFA' }} />
              </Col>
              <Col flex="92%">
                <Input value={formData.url.split('/').filter(part => part !== '').pop() || ''} onChange={e => setFormData({ ...formData, url: e.target.value })} />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            label="Последовательность"
            name="sequence"
            rules={[{ required: true, message: 'Пожалуйста, введите последовательность' }]}
          >
            <Input value={formData.sequence} onChange={e => setFormData({ ...formData, sequence: Number(e.target.value) })}  />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
