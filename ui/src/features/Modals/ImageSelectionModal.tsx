import { FC } from 'react';
import { Modal, Spin, List } from 'antd';
import type { ModalProps } from 'antd/es/modal';

type FileData = {
  filename: string;
  url: string;
};

type ImageSelectionModalProps = {
  visible: boolean;
  loading: boolean;
  data?: FileData[];
  onCancel: () => void;
  onSelect: (url: string) => void;
} & ModalProps;

const ImageSelectionModal: FC<ImageSelectionModalProps> = ({
  visible,
  loading,
  data = [],
  onCancel,
  onSelect,
  ...modalProps
}) => {
  return (
    <Modal
      title="Выберите изображение"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      {...modalProps}
    >
      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <List
          grid={{ gutter: 24, column: 5 }}
          dataSource={data}
          renderItem={(urlData) => (
            <List.Item
              key={urlData.filename}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
              }}
              onClick={() => onSelect(urlData.url)}
            >
              <div
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img
                  src={urlData.url}
                  alt={urlData.filename}
                  style={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default ImageSelectionModal;
