import { useState } from 'react';
import { Form, Input, Button, Modal, Typography, message } from 'antd';
import s from './ForgotPasswordModal.module.scss';

const { Text } = Typography;

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ visible, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Функция для отправки запроса на восстановление пароля
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      message.error('Введите адрес электронной почты');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('API_URL/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to send forgot password request');
      }

      message.success('Инструкции по восстановлению пароля отправлены на вашу почту.');
      onClose(); // Закрытие модального окна после успешной отправки
    } catch (err) {
      message.error('Ошибка при отправке запроса на восстановление пароля: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      visible={visible}
      onCancel={onClose}
      footer={null}
      centered
      className={s.forgotPasswordModal}
    >
      <div className={s.modalContent}>
        <Text className={s.modalTitle}>Восстановление пароля</Text>
        <Text className={s.modalDescription}>
          На ваш номер телефона отправлено SMS-сообщение с кодом подтверждения для восстановления пароля.
        </Text>
        <Form layout="vertical" className={s.form}>
          <Form.Item className={s.formItem} label="Твой номер телефона">
            <Input
              placeholder="+7********89"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              className={s.input}
            />
          </Form.Item>
          <Button
            type="primary"
            loading={isLoading}
            className={s.confirmButton}
            onClick={handleForgotPassword}
            block
          >
            Подтвердить смену пароля
          </Button>
          <div className={s.resendInfo}>
            <Text type="secondary">Выслать код повторно через 00:01</Text>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
