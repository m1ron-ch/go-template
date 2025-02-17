import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { AppSettings } from '@/shared';
import s from './Login.module.scss';
// import Cookies from 'js-cookie';

interface LoginFormValuesType {
  login: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined;
    
    if (resendDisabled) {
      timerInterval = setInterval(() => {
        setResendTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(timerInterval);
            setResendDisabled(false);
            setResendTimer(30);
            setCanResend(true);
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [resendDisabled]);

  const onFinish = async (values: LoginFormValuesType) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => ""); // Пробуем получить текст ошибки
      
        const errorMessage = errorText || `Ошибка: ${response.status} ${response.statusText}`;
      
        throw new Error(errorMessage);
      }
      

      // const data = await response.json();

      // Cookies.set('token', data.token, { expires: 1, path: '/', sameSite: 'Strict' })
      // Cookies.set('refresh_token', data.refresh_token, { expires: 1, path: '/', sameSite: 'Strict' })
      // Cookies.set('user_id', data.user_id, { expires: 1,  path: '/', sameSite: 'Strict' })
      // Cookies.set('role_id', data.role_id, { expires: 1,  path: '/', sameSite: 'Strict' })

      // Cookies.set('token', data.token, { expires: 1, secure: true, path: '/', sameSite: 'None' });
      // Cookies.set('refresh_token', data.refresh_token, { expires: 1, secure: true, path: '/', sameSite: 'None'});
      // Cookies.set('user_id', data.user_id, { expires: 1, secure: true, path: '/', sameSite: 'None'});
      // Cookies.set('role_id', data.role_id, { expires: 1, secure: true, path: '/', sameSite: 'None' });

      // Cookies.set('token', data.token, { expires: 1, secure: true, path: '/', sameSite: 'None' });

      message.success('Успешный вход!');
      navigate('/');
    } catch (err) {
      message.error('Ошибка авторизации: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      message.error('Введите адрес электронной почты');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send forgot password request');
      }

      message.success('Письмо с новым паролем отправлено на вашу почту.');

      setCanResend(false);
      setResendDisabled(true);
    } catch (err) {
      message.error('Ошибка при отправке запроса на восстановление пароля: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={s.loginFormContainer}>
      <Form name="login" className={s.form} initialValues={{ remember: true }} onFinish={onFinish}>
        <Form.Item>
          <Typography.Title level={2}>Login</Typography.Title>
        </Form.Item>
        <Form.Item
          name="login"
          rules={[{ required: true, message: 'Введите логин пользователя!' }]}
          className={s.formItem}
        >
          <Input placeholder="Login" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Введите пароль!' }]}
          className={s.formItem}
        >
          <Input.Password
            placeholder="Password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        {/* <Form.Item name="remember" valuePropName="checked" className={s.formItem}>
          <Checkbox>Запомнить меня</Checkbox>
        </Form.Item> */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} className={s.loginButton}>
            Login
          </Button>
        </Form.Item>
        {/* <Form.Item>
          <Link onClick={() => setForgotPasswordModalVisible(true)} className={s.forgotPasswordLink}>
            Забыли пароль?
          </Link>
        </Form.Item> */}
      </Form>

      <Modal
        title="Восстановление пароля"
        visible={isForgotPasswordModalVisible}
        onCancel={() => setForgotPasswordModalVisible(false)}
        footer={null}
        centered
      >
        <div className={s.modalContent}>
          <Typography.Paragraph className={s.modalDescription}>
            Введите адрес электронной почты, на который будут отправлены инструкции по
            восстановлению пароля (<b>если почта была указана <u>ранее</u></b>).
          </Typography.Paragraph>
          <Form layout="vertical" className={s.form}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Введите почту!' }]}
            >
              <Input
                placeholder="Введите почту"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
              />
            </Form.Item>
            <Button
              type="primary"
              loading={isLoading}
              className={s.confirmButton}
              onClick={handleForgotPassword}
              block
              disabled={!canResend || isLoading}
            >
              {canResend ? 'Восстановить пароль' : `Отправить повторно через ${resendTimer} секунд`}
            </Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
