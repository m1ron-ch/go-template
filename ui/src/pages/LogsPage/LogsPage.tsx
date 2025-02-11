import React, { useState, useEffect } from 'react';
import { Table, Form, Modal, Spin, Button, message, Space } from 'antd';
import styles from './LogsPage.module.scss';
import { AppSettings } from '@/shared';
import { EyeOutlined, FileOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import { Spacer } from '@/shared/Spacer';

interface Log {
  datetime: string;
  uid: number;
  log_level_id: number;
  log_level_name: string;
  user_id: number;
  username: string;
  short_msg: string;
  full_msg: string;
  event_type_id: number;
  event_type: string;
  ipv4: string;
  is_successful: number;
}

interface LogResponse {
  total: number;
  data: Log[];
}

interface User {
  id: number;
  f_name: string;
  l_name: string;
}

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}users`, {
        credentials: 'include',
      });
      const result = await response.json();
      setUsers(result.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}logs`, {
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result: LogResponse = await response.json();
      console.log(result);
      setLogs(result.data);
    } catch (error) {
      message.error("" + error);
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowDoubleClick = (record: Log) => {
    setSelectedLog(record);
  };

  const handleModalClose = () => {
    setSelectedLog(null);
  };

  const generateHTML = () => {
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Отчет по логам</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h2>Отчет по логам</h2>
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Пользователь</th>
                <th>Сообщение</th>
                <th>Полное сообщение</th>
                <th>IPv4</th>
                <th>Успешно</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td>${log.datetime}</td>
                  <td>${log.log_level_name}</td>
                  <td>${log.username}</td>
                  <td>${log.short_msg}</td>
                  <td>${log.full_msg}</td>
                  <td>${log.ipv4}</td>
                  <td>${log.is_successful ? 'Да' : 'Нет'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'logs-report.html';
    link.click();
  };

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'datetime',
      key: 'datetime',
    },
    {
      title: 'Тип',
      dataIndex: 'log_level_name',
      key: 'log_level_name',
      render: (text: string) => (
        <span style={{ color: getColorByLogLevel(text) }}>{text}</span>
      ),
      filters: [
        { text: 'INFO', value: 1 },
        { text: 'WARNING', value: 2 },
        { text: 'ERROR', value: 3 },
        { text: 'DEBUG', value: 4 },
      ],
      onFilter: (value: any, record: Log) => record.log_level_id === value,
    },
    {
      title: 'Пользователь',
      dataIndex: 'username',
      key: 'username',
      filters: users.map((user) => ({
        text: `${user.f_name} ${user.l_name}`,
        value: user.id,
      })),
      onFilter: (value: any, record: Log) => record.user_id === value,
    },
    {
      title: 'Короткое сообщение',
      dataIndex: 'short_msg',
      key: 'short_msg',
    },
    {
      title: 'IPv4',
      dataIndex: 'ipv4',
      key: 'ipv4',
    },
    {
      title: 'Успешно',
      dataIndex: 'is_successful',
      key: 'is_successful',
      render: (is_successful: number) => (is_successful ? 'Да' : 'Нет'),
      filters: [
        { text: 'Да', value: 1 },
        { text: 'Нет', value: 0 },
      ],
      onFilter: (value: any, record: Log) => record.is_successful === value,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: '1%',
      render: (_: any, log: Log) => (
        <div className={styles.actionIcons}>
          <Space size={0}>
            <Button icon={<EyeOutlined />} onClick={() => handleRowDoubleClick(log)} />
          </Space>
        </div>
      ),
    }
  ];

  const getColorByLogLevel = (logLevel: string) => {
    switch (logLevel) {
      case 'INFO':
        return '#4CAF50';
      case 'ERROR':
        return '#F44336';
      case 'WARNING':
        return '#FFEB3B';
      case 'DEBUG':
        return '#212121';
      default:
        return 'inherit';
    }
  };

  return (
    <div className={styles.container}>
      <Spacer />

      <Form layout="inline" className={styles.filters}>
        <Form.Item>
          <Button
            type="primary"
            icon={<FileOutlined />}
            onClick={generateHTML}
            style={{ marginBottom: 16, marginLeft: 8 }}
          >
            Создать отчет
          </Button>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={fetchLogs}
            style={{ marginBottom: 16, marginLeft: 8 }}
          >
            Обновить
          </Button>
        </Form.Item>
      </Form>

      <Table
        dataSource={logs}
        columns={columns}
        rowKey="uid"
        loading={{
          spinning: isLoading,
          indicator: <Spin indicator={<LoadingOutlined spin />} size="large" className={styles.spinner} />
        }}
        pagination={{
          pageSize: 15
        }}
        onRow={(record) => ({
          onDoubleClick: () => handleRowDoubleClick(record),
        })}
      />

      <Modal
        title="Полное сообщение"
        open={!!selectedLog}
        onOk={handleModalClose}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        <div style={{ whiteSpace: 'pre-wrap' }}>
        <p>{selectedLog?.full_msg}</p>
        </div>
      </Modal>
    </div>
  );
};
