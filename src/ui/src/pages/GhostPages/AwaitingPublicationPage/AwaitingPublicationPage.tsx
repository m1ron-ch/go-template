import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Descriptions,
  Modal,
  Image,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  List,
  Space,
} from "antd";
import {
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
  GlobalOutlined,
  DollarCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { AppSettings } from "@/shared";

const { Meta } = Card;
const { Title, Text, Paragraph } = Typography;

interface User {
  id: number;
  login: string;
}

interface Screenshot {
  id: number;
  image_url: string;
}

interface Url {
  id: number;
  url: string;
}

interface Leaked {
  id: number;
  company_name: string;
  description: string;
  website?: string;
  payout: number;
  payout_unit: number;
  created_at: string;
  views?: number;
  status: string;
  user: User;
  expires: string | null;
  logo_url: string;
  screenshots: Screenshot[];
  urls: Url[];
}

const AwaitingPublicationPage: React.FC = () => {
  const [leakeds, setLeakeds] = useState<Leaked[]>([]);
  const [selectedLeaked, setSelectedLeaked] = useState<Leaked | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    axios
      .get(`${AppSettings.API_URL}/leakeds_u`, { withCredentials: true })
      .then((res) => {
        setLeakeds(res.data ?? []);
      })
      .catch((err) => {
        console.error("Error fetching leakeds", err);
      });
  }, []);

  useEffect(() => {
    if (selectedLeaked?.expires) {
      const expiryTime = new Date(selectedLeaked.expires + 'Z').getTime();

      console.log(expiryTime)
  
      if (!isNaN(expiryTime)) {
        const updateTimeRemaining = () => {
          const now = new Date().getTime();
          const difference = expiryTime - now;
  
          if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
            setTimeRemaining(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
          } else {
            setTimeRemaining("Expired");
            clearInterval(interval);
          }
        };
  
        updateTimeRemaining();
  
        const interval = setInterval(updateTimeRemaining, 1000);
  
        return () => clearInterval(interval);
      } else {
        setTimeRemaining("Invalid date");
      }
    }
  }, [selectedLeaked]);  

  const handleCardClick = (leaked: Leaked) => {
    setSelectedLeaked(leaked);
    setIsModalVisible(true);
  };

  // Преобразуем payout в полное значение
  const getFullPayoutValue = (payout: number, payoutUnit: number) => {
    // 0 => x1, 1 => x1000, 2 => x1_000_000, 3 => x1_000_000_000
    const unitValues = [1000, 1_000_000, 1_000_000_000];
    const multiplier = unitValues[payoutUnit] || 1;
    return payout * multiplier;
  };

  return (
    <div style={{ margin: "0 auto", maxWidth: "1200px", padding: "24px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        {leakeds.map((leaked) => (
          <Card
            key={leaked.id}
            hoverable
            style={{ width: 350 }}
            cover={
              leaked.logo_url ? (
                <img
                  alt={leaked.company_name}
                  src={leaked.logo_url}
                  style={{
                    height: 220,
                    objectFit: "contain",
                    background: "linear-gradient(135deg,rgb(193, 223, 159), #a5d6a7)",
                  }}
                />
              ) : null
            }
            onClick={() => handleCardClick(leaked)}
          >
            <Meta
              title={leaked.company_name}
              description={leaked.website || "No website"}
            />
          </Card>
        ))}
      </div>

      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={900}
        centered
        bodyStyle={{ padding: "24px" }}
      >
        {selectedLeaked && (
          <div>
            <Row gutter={[16, 16]} align="middle">
              <Col flex="60px">
                {selectedLeaked.logo_url && (
                  <img
                    src={selectedLeaked.logo_url}
                    alt="Logo"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "1px solid #ddd",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Col>
              <Col flex="auto">
                <Title level={3} style={{ marginBottom: 0 }}>
                  {selectedLeaked.company_name}
                </Title>
                <Tag color={selectedLeaked.status ? "green" : "red"}>
                  {selectedLeaked.status ? "Active" : "Locked"}
                </Tag>
              </Col>
              {selectedLeaked.expires && (
                <Col>
                  <Space>
                    <ClockCircleOutlined style={{ fontSize: 16, color: "#fa541c" }} />
                    <Text strong style={{ color: "#fa541c" }}>
                      {timeRemaining}
                    </Text>
                  </Space>
                </Col>
              )}
            </Row>

            <Divider />

            <Title level={4}>Description</Title>
            <Paragraph style={{ whiteSpace: "pre-line" }}>
              {selectedLeaked.description}
            </Paragraph>

            <Divider />

            <Descriptions
              bordered
              column={2}
              labelStyle={{ fontWeight: "bold" }}
              size="middle"
            >
              <Descriptions.Item label="Website">
                {selectedLeaked.website ? (
                  <a
                    href={selectedLeaked.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Space>
                      <GlobalOutlined />
                      <span>{selectedLeaked.website}</span>
                    </Space>
                  </a>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="User">
                <Space>
                  <UserOutlined />
                  <Text>{selectedLeaked.user.login}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Payout">
                <Space>
                  <DollarCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>
                    {new Intl.NumberFormat().format(
                      getFullPayoutValue(
                        selectedLeaked.payout,
                        selectedLeaked.payout_unit
                      )
                    )}
                    $
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Date of Publication">
                {new Date(selectedLeaked.created_at).toLocaleDateString()}
              </Descriptions.Item>

              <Descriptions.Item label="Views">
                <Space>
                  <EyeOutlined />
                  <Text>{selectedLeaked.views?.toLocaleString() || "N/A"}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Expires">
                {selectedLeaked.expires
                  ? new Date(`${selectedLeaked.expires}Z`).toLocaleString()
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>

            {selectedLeaked.urls.length > 0 && (
              <>
                <Divider />
                <Title level={4}>Leaked URLs</Title>
                <List
                  dataSource={selectedLeaked.urls}
                  renderItem={(url) => (
                    <List.Item>
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Space>
                          <LinkOutlined />
                          <Text>{url.url}</Text>
                        </Space>
                      </a>
                    </List.Item>
                  )}
                />
              </>
            )}

            {selectedLeaked.screenshots.length > 0 && (
              <>
                <Divider />
                <Title level={4}>Screenshots</Title>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {selectedLeaked.screenshots.map((screenshot) => (
                    <Image
                      key={screenshot.id}
                      src={screenshot.image_url}
                      alt="Screenshot"
                      style={{
                        width: 150,
                        cursor: "pointer",
                        borderRadius: 8,
                        border: "1px solid #f0f0f0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AwaitingPublicationPage;
