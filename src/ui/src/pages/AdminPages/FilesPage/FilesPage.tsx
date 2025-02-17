import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Spin, message, Input, Space } from 'antd';
import { ReloadOutlined, LoadingOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import moment from 'moment';
import { AppSettings } from '@/shared';

interface User {
  id: number;
  name: string;
  login: string;
  role_id: number;
  status_id: number;
  password: string;
}

interface Leaked {
  id: number;
  status: number;
  blog: string;
  company_name: string;
  description: string;
  website: string;
  user: User;
  logo_url: string;
  screenshots: any;
  urls: any;
  payout: number;
  payout_unit: number;
  builder: number;
  publish: number;
  is_accept: number;
  created_at: string;
  expires: string;
}

interface FileRecord {
  id: number;
  user: User;
  leaked: Leaked;
  folder_name: string;
  archive_number: string;
  status: string;
  creted_at: string; // Если в JSON опечатка, замените на "created_at"
}

export const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}/files`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data: FileRecord[] = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      message.error('Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтруем файлы по глобальному поиску (folder, archive, status, user login, leaked company)
  const filteredFiles = useMemo(() => {
    if (!searchText) return files;
    const lowercasedSearch = searchText.toLowerCase();
    return files.filter(file =>
      file.folder_name.toLowerCase().includes(lowercasedSearch) ||
      file.archive_number.toLowerCase().includes(lowercasedSearch) ||
      file.status.toLowerCase().includes(lowercasedSearch) ||
      file.user.login.toLowerCase().includes(lowercasedSearch) ||
      file.leaked.company_name.toLowerCase().includes(lowercasedSearch)
    );
  }, [files, searchText]);

  // Определяем колонки таблицы с сортировкой и подсветкой найденного текста
  const columns = useMemo(
    () => [
      {
        title: 'Folder Name',
        dataIndex: 'folder_name',
        key: 'folder_name',
        sorter: (a: FileRecord, b: FileRecord) =>
          a.folder_name.localeCompare(b.folder_name),
        render: (text: string) => (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text || ''}
          />
        ),
      },
      {
        title: 'Archive Number',
        dataIndex: 'archive_number',
        key: 'archive_number',
        sorter: (a: FileRecord, b: FileRecord) =>
          a.archive_number.localeCompare(b.archive_number),
        render: (text: string) => (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text || ''}
          />
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        sorter: (a: FileRecord, b: FileRecord) =>
          a.status.localeCompare(b.status),
        render: (text: string) => (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text || ''}
          />
        ),
      },
      {
        title: 'Created At',
        dataIndex: 'creted_at',
        key: 'creted_at',
        sorter: (a: FileRecord, b: FileRecord) =>
          moment.utc(a.creted_at).valueOf() - moment.utc(b.creted_at).valueOf(),
        render: (text: string) =>
          moment.utc(text).local().format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: 'User Login',
        dataIndex: ['user', 'login'],
        key: 'user_login',
        sorter: (a: FileRecord, b: FileRecord) =>
          a.user.login.localeCompare(b.user.login),
        render: (text: string) => (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text || ''}
          />
        ),
      },
      {
        title: 'Leaked Company',
        dataIndex: ['leaked', 'company_name'],
        key: 'leaked_company',
        sorter: (a: FileRecord, b: FileRecord) =>
          a.leaked.company_name.localeCompare(b.leaked.company_name),
        render: (text: string) => (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text || ''}
          />
        ),
      },
      {
        title: 'Download (decryptor)',
        dataIndex: 'download_file',
        key: 'download_file',
        render: (_: any, fileRecord: FileRecord) => (
          <div style={{display: "flex", alignItems: "center"}}>
              <Button
                icon={<DownloadOutlined />}
                onClick={()=> {}}
                style={{ marginRight: 8 }}
              >
                {fileRecord.folder_name}  
              </Button>
          </div>
        ),
      }
    ],
    [searchText]
  );

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by folder, archive, status, etc."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchFiles}
        >
          Refresh
        </Button>
      </Space>

      <Table
        dataSource={filteredFiles}
        columns={columns}
        rowKey="id"
        loading={{
          spinning: isLoading,
          indicator: <Spin indicator={<LoadingOutlined spin />} size="large" />,
        }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
