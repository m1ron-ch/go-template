import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { AppSettings } from '@/shared';
import s from './Login.module.scss';

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
        const errorText = await response.text().catch(() => ""); // Try to get error text
      
        const errorMessage = errorText || `Error: ${response.status} ${response.statusText}`;
      
        throw new Error(errorMessage);
      }
      
      message.success('Login successful!');
      navigate('/');
    } catch (err) {
      message.error('Login failed: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      message.error('Please enter your email address');
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
        throw new Error('Failed to send password reset request');
      }

      message.success('A password reset email has been sent to your email.');

      setCanResend(false);
      setResendDisabled(true);
    } catch (err) {
      message.error('Error sending password reset request: ' + err);
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
          rules={[{ required: true, message: 'Enter your login!' }]}
          className={s.formItem}
        >
          <Input placeholder="Login" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Enter your password!' }]}
          className={s.formItem}
        >
          <Input.Password
            placeholder="Password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} className={s.loginButton}>
            Login
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Password Recovery"
        open={isForgotPasswordModalVisible}
        onCancel={() => setForgotPasswordModalVisible(false)}
        footer={null}
        centered
      >
        <div className={s.modalContent}>
          <Typography.Paragraph className={s.modalDescription}>
            Enter your email address to receive password recovery instructions (<b>only if the email was provided <u>previously</u></b>).
          </Typography.Paragraph>
          <Form layout="vertical" className={s.form}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Enter your email!' }]}
            >
              <Input
                placeholder="Enter your email"
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
              {canResend ? 'Reset Password' : `Resend in ${resendTimer} seconds`}
            </Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
