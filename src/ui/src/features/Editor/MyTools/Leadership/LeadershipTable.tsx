import React, { useState } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

type ContactData = {
  key: number;
  role?: string;
  fio?: string;
  address?: string;
  receptionPhone?: string;
  fax?: string;
  email?: string;
  receptionDays?: string;
  receptionTime?: string;
  receptionRecordPhone?: string;
};

type LeadershipTableProps = {
  data?: ContactData[];
  onChange: (data: ContactData[]) => void;
};

const LeadershipTable: React.FC<LeadershipTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<ContactData[]>(data);
  const [count, setCount] = useState(data.length);

  const columns = [
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (_: string, record: ContactData) => (
        <Input
          value={record.role}
          onChange={(e) => handleFieldChange(e, record.key, 'role')}
        />
      ),
    },
    {
      title: 'ФИО',
      dataIndex: 'fio',
      key: 'fio',
      render: (_: string, record: ContactData) => (
        <Input
          value={record.fio}
          onChange={(e) => handleFieldChange(e, record.key, 'fio')}
        />
      ),
    },
    {
      title: 'Контактная информация',
      dataIndex: 'contactInfo',
      key: 'contactInfo',
      render: (_: string, record: ContactData) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Адрес"
            value={record.address}
            onChange={(e) => handleFieldChange(e, record.key, 'address')}
          />
          <Input
            placeholder="Телефон (приемная)"
            value={record.receptionPhone}
            onChange={(e) => handleFieldChange(e, record.key, 'receptionPhone')}
          />
          <Input
            placeholder="Факс"
            value={record.fax}
            onChange={(e) => handleFieldChange(e, record.key, 'fax')}
          />
          <Input
            placeholder="Электронная почта"
            value={record.email}
            onChange={(e) => handleFieldChange(e, record.key, 'email')}
          />
          <Input
            placeholder="Дни приема"
            value={record.receptionDays}
            onChange={(e) => handleFieldChange(e, record.key, 'receptionDays')}
          />
          <Input
            placeholder="Время приема"
            value={record.receptionTime}
            onChange={(e) => handleFieldChange(e, record.key, 'receptionTime')}
          />
          <Input
            placeholder="Телефон для записи на прием"
            value={record.receptionRecordPhone}
            onChange={(e) => handleFieldChange(e, record.key, 'receptionRecordPhone')}
          />
        </Space>
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: ContactData) => (
        <Button
          danger
          onClick={() => handleDelete(record.key)}
          icon={<DeleteOutlined />}
        />
      ),
    },
  ];

  const handleAdd = () => {
    const newData: ContactData = {
      key: count,
      role: '',
      fio: '',
      address: '',
      receptionPhone: '',
      fax: '',
      email: '',
      receptionDays: '',
      receptionTime: '',
      receptionRecordPhone: '',
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

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, key: number, field: keyof ContactData) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        return { ...item, [field]: e.target.value };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

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
    </div>
  );
};

export default LeadershipTable;
