import React, { useState } from 'react';
import { Table, Button, Input, Modal, Spin, List } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';

type Vacancy = {
  text: string;
  link?: string;
};

type VacancyTableProps = {
  data?: Vacancy[];
  header?: string;
  onChange: (data: Vacancy[], header: string) => void;
};

const VacancyTable: React.FC<VacancyTableProps> = ({ data = [], header = 'Список вакансий предприятия г. Минск', onChange }) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>(Array.isArray(data) ? data : [{ text: '', link: '' }]);
  const [currentHeader, setCurrentHeader] = useState<string>(header);
  const [isUrlModalVisible, setIsUrlModalVisible] = useState(false);
  const [currentLinkInputIndex, setCurrentLinkInputIndex] = useState<number | null>(null);
  const [urls, setUrls] = useState<{ uid: number; url: string }[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeader = e.target.value;
    setCurrentHeader(newHeader);
    onChange(vacancies, newHeader);
  };

  const handleTitleChange = (value: string, index: number) => {
    const updatedVacancies = vacancies.map((vacancy, i) =>
      i === index ? { ...vacancy, text: value } : vacancy
    );
    setVacancies(updatedVacancies);
    onChange(updatedVacancies, currentHeader);
  };

  const handleLinkChange = (value: string, index: number) => {
    const updatedVacancies = vacancies.map((vacancy, i) =>
      i === index ? { ...vacancy, link: value } : vacancy
    );
    setVacancies(updatedVacancies);
    onChange(updatedVacancies, currentHeader);
  };

  const openUrlSelectionDialog = async (index: number) => {
    setCurrentLinkInputIndex(index);
    setIsUrlModalVisible(true);
    setLoadingUrls(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}urls`, {
        credentials: 'include',
      });
      const data = await response.json();
      setUrls(data);
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

  const handleAddVacancy = () => {
    const newVacancy = { text: '', link: '' };
    const updatedVacancies = [...vacancies, newVacancy];
    setVacancies(updatedVacancies);
    onChange(updatedVacancies, currentHeader);
  };

  const handleDeleteVacancy = (index: number) => {
    const updatedVacancies = vacancies.filter((_, i) => i !== index);
    setVacancies(updatedVacancies);
    onChange(updatedVacancies, currentHeader);
  };

  const columns = [
    {
      title: 'Название вакансии',
      dataIndex: 'text',
      key: 'text',
      render: (text: string, _: Vacancy, index: number) => (
        <Input
          value={text}
          onChange={(e) => handleTitleChange(e.target.value, index)}
          placeholder="Название вакансии"
        />
      ),
    },
    {
      title: 'Ссылка на вакансию',
      dataIndex: 'link',
      key: 'link',
      render: (text: string, _: Vacancy, index: number) => (
        <Input
          value={text}
          onClick={() => openUrlSelectionDialog(index)}
          placeholder="Ссылка на вакансию"
          readOnly
        />
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: any, _record: Vacancy, index: number) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteVacancy(index)}
          disabled={vacancies.length === 1} // Prevent deletion of the last record
        />
      ),
    },
  ];

  return (
    <div>
      <Input
        value={currentHeader}
        onChange={handleHeaderChange}
        placeholder="Введите заголовок"
        style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}
      />
      <Table
        dataSource={vacancies.map((vacancy, index) => ({ ...vacancy, key: index }))}
        columns={columns}
        pagination={false}
        bordered
      />
      <Button
        type="dashed"
        onClick={handleAddVacancy}
        icon={<PlusOutlined />}
        style={{ marginTop: 16, width: '100%' }}
      >
        Добавить вакансию
      </Button>

      <Modal
        title="Select a URL"
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
                key={urlData.uid}
                onClick={() => handleUrlSelect(urlData.url)}
                style={{ cursor: 'pointer' }}
              >
                {urlData.url}
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default VacancyTable;
