// UrlSelectionModal.tsx
import React from 'react';
import { Modal, Spin, List } from 'antd';

type UrlData = {
  filename: string;
  url: string;
};

interface UrlSelectionModalProps {
  visible: boolean;
  loading: boolean;
  data: UrlData[];
  onCancel: () => void;
  onSelect: (url: string) => void;
}

const UrlSelectionModal: React.FC<UrlSelectionModalProps> = ({
  visible,
  loading,
  data,
  onCancel,
  onSelect,
}) => {
  return (
    <Modal
      title="Выберите ссылку"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {loading ? (
        <Spin />
      ) : (
        <List
          bordered
          dataSource={data}
          renderItem={(urlData) => (
            <List.Item
              key={urlData.filename}
              onClick={() => onSelect(urlData.url)}
              style={{ cursor: 'pointer' }}
            >
              {urlData.url}
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default UrlSelectionModal;
