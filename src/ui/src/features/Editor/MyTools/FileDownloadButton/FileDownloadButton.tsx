import React, { useState, useEffect } from 'react';
import { Button, Modal, List, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { AppSettings } from '@/shared';

type FileDownloadButtonProps = {
  initialFileUrl?: string;
  initialFileName?: string;
  onFileSelect: (fileUrl: string, fileName: string) => void;
};

const FileDownloadButton: React.FC<FileDownloadButtonProps> = ({ initialFileUrl, initialFileName, onFileSelect }) => {
  const [isUrlModalVisible, setIsUrlModalVisible] = useState(false);
  const [urls, setUrls] = useState<{ filename: string; url: string }[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(initialFileUrl || null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(initialFileName || null);

  useEffect(() => {
    if (initialFileUrl) {
      setSelectedFile(initialFileUrl);
      setSelectedFileName(initialFileName || null);
    }
  }, [initialFileUrl, initialFileName]);

  const openFileSelectionDialog = async () => {
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

  const handleUrlSelect = (url: string, filename: string) => {
    setSelectedFile(url);
    setSelectedFileName(filename);
    setIsUrlModalVisible(false);
    onFileSelect(url, filename);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={openFileSelectionDialog}
        style={{ width: '100%' }}
      >
        Скачать анкету
      </Button>

      <Modal
        title="Выберите файл для скачивания"
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
                onClick={() => handleUrlSelect(urlData.url, urlData.filename)}
                style={{ cursor: 'pointer' }}
              >
                {urlData.filename}
              </List.Item>
            )}
          />
        )}
      </Modal>

      {selectedFile && selectedFileName && (
        <Button
          type="link"
          href={selectedFile}
          target="_blank"
          style={{ marginTop: 16 }}
        >
          {selectedFileName}
        </Button>
      )}
    </div>
  );
};

export default FileDownloadButton;
