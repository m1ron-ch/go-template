import React, { useState } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';

type ContactData = {
  key: number;
  officeName?: string;
  address?: string;
  phones?: string[];
  fax?: string;
  email?: string;
  workingHours?: string[];
  latitude?: string;
  longitude?: string;
};

type ContactTableProps = {
  data?: ContactData[];
  onChange: (data: ContactData[]) => void;
};

const ContactTable: React.FC<ContactTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<ContactData[]>(data);
  const [count, setCount] = useState(data.length);

  const columns = [
    {
      title: 'Офисы и подразделения',
      dataIndex: 'officeName',
      key: 'officeName',
      render: (_: string, record: ContactData) => (
        <Input
          value={record.officeName}
          onChange={e => handleFieldChange(e, record.key, 'officeName')}
        />
      ),
    },
    {
      title: 'Контактные данные',
      dataIndex: 'contactInfo',
      key: 'contactInfo',
      render: (_: string, record: ContactData) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Адрес"
            value={record.address}
            onChange={e => handleFieldChange(e, record.key, 'address')}
          />
          <Space direction="vertical">
            {record.phones?.map((phone, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Input
                  placeholder={`Телефон ${index + 1}`}
                  value={phone}
                  onChange={e => handlePhoneChange(e, record.key, index)}
                />
                <Button
                  type="link"
                  icon={<MinusCircleOutlined />}
                  onClick={() => removePhone(record.key, index)}
                />
              </Space>
            ))}
            <Button type="dashed" onClick={() => addPhone(record.key)}>
              Добавить телефон
            </Button>
          </Space>
          <Input
            placeholder="Факс"
            value={record.fax}
            onChange={e => handleFieldChange(e, record.key, 'fax')}
          />
          <Input
            placeholder="Электронная почта"
            value={record.email}
            onChange={e => handleFieldChange(e, record.key, 'email')}
          />
          <Space direction="vertical">
            {record.workingHours?.map((hour, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Input
                  placeholder={`Рабочее время ${index + 1}`}
                  value={hour}
                  onChange={e => handleWorkingHoursChange(e, record.key, index)}
                />
                <Button
                  type="link"
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeWorkingHour(record.key, index)}
                />
              </Space>
            ))}
            <Button type="dashed" onClick={() => addWorkingHour(record.key)}>
              Добавить рабочее время
            </Button>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Координаты',
      key: 'coordinates',
      render: (_: string, record: ContactData) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Широта"
            value={record.latitude}
            onChange={e => handleFieldChange(e, record.key, 'latitude')}
          />
          <Input
            placeholder="Долгота"
            value={record.longitude}
            onChange={e => handleFieldChange(e, record.key, 'longitude')}
          />
        </Space>
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: ContactData) => (
        <Button danger onClick={() => handleDelete(record.key)} icon={<DeleteOutlined />} />
      ),
    },
  ];

  const handleAdd = () => {
    const newData: ContactData = {
      key: count,
      officeName: '',
      address: '',
      phones: [],
      fax: '',
      email: '',
      workingHours: [],
      latitude: '',
      longitude: '',
    };
    const updatedData = [...dataSource, newData];
    setDataSource(updatedData);
    onChange(updatedData);
    setCount(count + 1);
  };

  const handleDelete = (key: number) => {
    const updatedData = dataSource.filter(item => item.key !== key);
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
    field: keyof ContactData
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

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
    index: number
  ) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        const updatedPhones = [...(item.phones || [])];
        updatedPhones[index] = e.target.value;
        return { ...item, phones: updatedPhones };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleWorkingHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
    index: number
  ) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        const updatedHours = [...(item.workingHours || [])];
        updatedHours[index] = e.target.value;
        return { ...item, workingHours: updatedHours };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const addPhone = (key: number) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        const updatedPhones = [...(item.phones || []), ''];
        return { ...item, phones: updatedPhones };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const removePhone = (key: number, index: number) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        const updatedPhones = item.phones?.filter((_, i) => i !== index) || [];
        return { ...item, phones: updatedPhones };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const addWorkingHour = (key: number) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        const updatedHours = [...(item.workingHours || []), ''];
        return { ...item, workingHours: updatedHours };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const removeWorkingHour = (key: number, index: number) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        const updatedHours = item.workingHours?.filter((_, i) => i !== index) || [];
        return { ...item, workingHours: updatedHours };
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

export default ContactTable;
