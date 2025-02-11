import React from 'react';
import { Table, Input } from 'antd';

type RekvizitData = {
  accountNumber?: string;
  regionalOffice?: string;
  bankName?: string;
  address?: string;
  bic?: string;
  unp?: string;
  okpo?: string;
};

type RekvizitTableProps = {
  data?: RekvizitData;
  onChange: (data: RekvizitData) => void;
};

const RekvizitTable: React.FC<RekvizitTableProps> = ({ data = {}, onChange }) => {
  const handleChange = (value: string, field: keyof RekvizitData) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="table-wrapper">
      <Table
        bordered
        pagination={false}
        dataSource={[
          { key: 'accountNumber', label: 'Р/с №', value: data.accountNumber },
          { key: 'regionalOffice', label: 'Региональная Дирекция', value: data.regionalOffice },
          { key: 'bankName', label: 'Банк', value: data.bankName },
          { key: 'address', label: 'Адрес', value: data.address },
          { key: 'bic', label: 'BIC', value: data.bic },
          { key: 'unp', label: 'УНП', value: data.unp },
          { key: 'okpo', label: 'ОКПО', value: data.okpo },
        ]}
        columns={[
          {
            title: 'Название',
            dataIndex: 'label',
            key: 'label',
            render: (text) => <strong>{text}</strong>,
          },
          {
            title: 'Значение',
            dataIndex: 'value',
            key: 'value',
            render: (value, record) => (
              <Input
                value={value}
                onChange={(e) => handleChange(e.target.value, record.key as keyof RekvizitData)}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default RekvizitTable;
