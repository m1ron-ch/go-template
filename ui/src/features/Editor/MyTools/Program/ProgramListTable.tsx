import React, { useState } from 'react';
import { Table, Button} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';

type ProgramData = {
  key: number;
  text: string;
};

type ProgramListTableProps = {
  data?: ProgramData[];
  onChange: (data: ProgramData[]) => void;
};

const ProgramListTable: React.FC<ProgramListTableProps> = ({ data = [], onChange }) => {
  const [dataSource, setDataSource] = useState<ProgramData[]>(data);
  const [count, setCount] = useState(data.length);

  const handleFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>, key: number) => {
    const updatedData = dataSource.map(item => {
      if (item.key === key) {
        return { ...item, text: e.target.value };
      }
      return item;
    });
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const handleAddProgram = () => {
    const newProgram: ProgramData = { key: count, text: '' };
    const updatedData = [...dataSource, newProgram];
    setDataSource(updatedData);
    onChange(updatedData);
    setCount(count + 1);
  };

  const handleDeleteProgram = (key: number) => {
    const updatedData = dataSource.filter(item => item.key !== key);
    setDataSource(updatedData);
    onChange(updatedData);
  };

  const columns = [
    {
      title: 'Описание программы',
      dataIndex: 'text',
      key: 'text',
      render: (_: string, record: ProgramData) => (
        <TextArea
          value={record.text}
          onChange={e => handleFieldChange(e, record.key)}
          placeholder="Введите описание программы"
        />
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      width: '5%',
      render: (_: string, record: ProgramData) => (
        <Button
          danger
          onClick={() => handleDeleteProgram(record.key)}
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
        rowKey="key"
        pagination={false}
        locale={{ emptyText: 'Нет программ. Добавьте новую программу.' }}
        footer={() => (
          <Button
            type="dashed"
            onClick={handleAddProgram}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Добавить программу
          </Button>
        )}
      />
    </div>
  );
};

export default ProgramListTable;
