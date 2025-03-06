import React, { useState } from 'react';
import { Table, Button, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

type VacancyDescription = {
  key: number;
  text: string;
};

type VacancyData = {
  key: number;
  title?: string;
  descriptions: VacancyDescription[];
};

type VacancyTableProps = {
  data?: VacancyData[];
  onChange: (data: VacancyData[]) => void;
};

const VacancyDescriptionTable: React.FC<VacancyTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<VacancyData[]>(
    data.map(item => ({
      ...item,
      descriptions: item.descriptions.length ? item.descriptions : [{ key: 0, text: '' }],
    }))
  );
  const [count, setCount] = useState(data.length);

  const handleAddDescription = (vacancyKey: number) => {
    const updatedData = dataSource.map((vacancy) => {
      if (vacancy.key === vacancyKey) {
        const newDescription: VacancyDescription = {
          key: vacancy.descriptions.length,
          text: '',
        };
        return {
          ...vacancy,
          descriptions: [...vacancy.descriptions, newDescription],
        };
      }
      return vacancy;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleDeleteDescription = (vacancyKey: number, descriptionKey: number) => {
    const updatedData = dataSource.map((vacancy) => {
      if (vacancy.key === vacancyKey) {
        const updatedDescriptions = vacancy.descriptions.filter(
          (desc) => desc.key !== descriptionKey
        );
        return {
          ...vacancy,
          descriptions: updatedDescriptions.length ? updatedDescriptions : [{ key: 0, text: '' }],
        };
      }
      return vacancy;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleAddVacancy = () => {
    const newData: VacancyData = {
      key: count,
      title: '',
      descriptions: [{ key: 0, text: '' }],
    };
    const updatedData = [...dataSource, newData];
    setDataSource(updatedData);
    onChange(updatedData);
    setCount(count + 1);
  };

  const handleDeleteVacancy = (key: number) => {
    const updatedData = dataSource.filter((item) => item.key !== key);
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    vacancyKey: number,
    descriptionKey: number | null,
    field: 'title' | 'description'
  ) => {
    const updatedData = dataSource.map((vacancy) => {
      if (vacancy.key === vacancyKey) {
        if (field === 'title') {
          return { ...vacancy, title: e.target.value };
        } else if (field === 'description' && descriptionKey !== null) {
          const updatedDescriptions = vacancy.descriptions.map((desc) => {
            if (desc.key === descriptionKey) {
              return { ...desc, text: e.target.value };
            }
            return desc;
          });
          return { ...vacancy, descriptions: updatedDescriptions };
        }
      }
      return vacancy;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const columns = [
    {
      title: 'О вакансии',
      dataIndex: 'title',
      key: 'title',
      render: (_: string, record: VacancyData) => (
        <Input
          value={record.title}
          onChange={(e) => handleFieldChange(e, record.key, null, 'title')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'descriptions',
      key: 'descriptions',
      render: (_: string, record: VacancyData) => (
        <div style={{ width: '100%' }}>
          {record.descriptions.map((desc) => (
            <div key={desc.key} style={{ display: 'flex', marginBottom: 8, width: '100%' }}>
              <Input
                value={desc.text}
                onChange={(e) =>
                  handleFieldChange(e, record.key, desc.key, 'description')
                }
                style={{ flex: 1 }}
              />
              {record.descriptions.length > 1 && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteDescription(record.key, desc.key)}
                  style={{ marginLeft: 8 }}
                />
              )}
            </div>
          ))}
          <Button
            type="dashed"
            onClick={() => handleAddDescription(record.key)}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Добавить строку описания
          </Button>
        </div>
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: string, record: VacancyData) => (
        <Button
          danger
          onClick={() => handleDeleteVacancy(record.key)}
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
            onClick={handleAddVacancy}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Добавить новую строку
          </Button>
        )}
      />
    </div>
  );
};

export default VacancyDescriptionTable;
