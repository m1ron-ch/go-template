import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  Input,
  Upload,
  Tabs,
  Descriptions,
  message,
  Modal,
  Space,
  Popconfirm,
  Select,
  Row,
  Col,
  DatePicker,
  Empty,
  Tag,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment"; // or dayjs
import { AppSettings } from "@/shared";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// -------------------------
// Interfaces
// -------------------------
interface User {
  user_id: number;
  name: string;
  login: string;
  role_id: number;
  status_id: number;
}

interface Screenshot {
  id: number;
  image_url: string;
}

interface UrlItem {
  id: number;
  url: string;
}

interface Leaked {
  id: number;
  status: number | string;
  blog: string | string;
  created_at: string;
  company_name: string;
  description: string;
  website: string | null;
  user: User;
  expires: string | null;
  logo_url: string;
  screenshots: Screenshot[];
  urls: UrlItem[];
  payout: number;
  payout_unit: number;
  publish: number;
  is_accept: number;
}

// -------------------------
// Main component
// -------------------------
export const LeakedPageTabs: React.FC = () => {
  const [leakeds, setLeakeds] = useState<Leaked[]>([]);
  const [selectedLeaked, setSelectedLeaked] = useState<Leaked | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [form] = Form.useForm();

  // "Create Blog" tab:
  const [createBlogForm] = Form.useForm();
  const [disclosures, setDisclosures] = useState<UrlItem[]>([]);
  const [localLogoUrl, setLocalLogoUrl] = useState<string>("");
  const [localScreenshots, setLocalScreenshots] = useState<Screenshot[]>([]);

  const [user, setUser] = useState<User | null>(null);
  // const now = useMemo(() => moment(), []);

  useEffect(() => {
    fetchLeakedData();
  }, []);

  const fetchLeakedData = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}/leakeds`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch leaked data");
  
      // Получаем данные с сервера
      const data: Leaked[] = await response.json();
  
      // Преобразуем поле expires для каждого элемента
      const transformedData = data.map((item) => ({
        ...item,
        expires: item.expires
          ? moment.utc(item.expires).local().format("YYYY-MM-DD HH:mm:ss")
          : null,
      }));
  
      setLeakeds(transformedData);
    } catch (error) {
      console.error("Error fetching leaked data:", error);
      message.error("Failed to fetch leaked data.");
    }
  };

  useEffect(() => {
    // Example: fetch current user data
    fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  // -------------------------
  // View / Add / Edit / Delete
  // -------------------------
  const handleViewLeaked = (item: Leaked) => {
    setSelectedLeaked(item);
    setIsViewMode(true);
    setIsModalVisible(true);
    resetCreateBlogTab(item);
  };

  const handleAddLeaked = () => {
    setSelectedLeaked(null);
    setIsViewMode(false);
    setIsModalVisible(true);
    form.resetFields();
    resetCreateBlogTab(null);
  };

  const handleEditLeaked = (item: Leaked) => {
    setSelectedLeaked(item);
    setIsViewMode(false);
    setIsModalVisible(true);

    // Pre-fill the Edit tab
    form.setFieldsValue({
      company_name: item.company_name,
      website: item.website || "",
      expiration: item.expires ? dayjs(item.expires) : null,
      payout_value: item.payout,
      payout_unit: String(item.payout_unit),
    });

    // Pre-fill "Create Blog" tab
    resetCreateBlogTab(item);
  };

  const resetCreateBlogTab = (item: Leaked | null) => {
    if (!item) {
      createBlogForm.resetFields();
      setLocalLogoUrl("");
      setLocalScreenshots([]);
      setDisclosures([]);
      return;
    }

    createBlogForm.setFieldsValue({
      blogCompanyName: item.company_name,
      blogDescription: item.description,
      blogText: typeof item.blog === "string" ? item.blog : String(item.blog),
    });
    setLocalLogoUrl(item.logo_url);
    setLocalScreenshots(item.screenshots || []);
    const copiedUrls = item.urls.map((u) => ({ ...u }));
    setDisclosures(copiedUrls);
  };

  const handleDeleteLeaked = async (id: number) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}/leakeds/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete leak");
      message.success("Leak deleted successfully");
      fetchLeakedData();
    } catch (error) {
      console.error("Error deleting leak:", error);
      message.error("Error deleting leak");
    }
  };

  // --------------------------------------
  // Save (Create or Update) - SEND ALL FIELDS
  // --------------------------------------
  const handleSave = async () => {
    try {
      // Получаем значения из формы редактирования
      const mainValues = form.getFieldsValue();
      // Получаем значения из формы блога
      // Если нужно, можно провести валидацию createBlogForm, но можно и просто получить их.
      const blogValues = createBlogForm.getFieldsValue();
  
      const expiresStr = mainValues.expiration
        ? mainValues.expiration.toISOString()
        : null;
  
      // Собираем полный объект данных для отправки,
      // объединяя данные из обеих форм.
      let fullPayload = {
        id: selectedLeaked ? selectedLeaked.id : 0,
        status: selectedLeaked ? selectedLeaked.status : 0,
        blog: blogValues.blogText || selectedLeaked?.blog || "",
        created_at: selectedLeaked
          ? selectedLeaked.created_at
          : new Date().toISOString(),
        // Берём company_name либо из основной формы, либо из блога, если необходимо
        company_name:
          blogValues.blogCompanyName ||
          selectedLeaked?.company_name ||
          "",
        description:
          blogValues.blogDescription ||
          selectedLeaked?.description ||
          "",
        website: mainValues.website || null,
        user: { id: user?.user_id },
        expires: expiresStr,
        logo_url: localLogoUrl, // Лого теперь отправляется
        screenshots: localScreenshots, // Отправляем загруженные скриншоты
        urls: disclosures, // Отправляем disclosure ссылки
        payout: Number(mainValues.payout_value || 0),
        payout_unit: Number(mainValues.payout_unit || 0),
        is_accept: selectedLeaked?.is_accept || 2,
        publish: expiresStr != "" ? 0 : (selectedLeaked?.publish || 0)
      };
  
      console.log("Sending payload:", JSON.stringify(fullPayload, null, 2));
  
      const method = selectedLeaked ? "PUT" : "POST";
      const endpoint = selectedLeaked
        ? `${AppSettings.API_URL}/leakeds/${selectedLeaked.id}`
        : `${AppSettings.API_URL}/leakeds`;
  
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(fullPayload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save data");
      }
  
      message.success(
        selectedLeaked ? "Leak updated successfully" : "Leak added successfully"
      );
      setIsModalVisible(false);
      fetchLeakedData();
    } catch (error) {
      console.error("Error saving leak:", error);
      message.error("Error saving leak");
    }
  };
  

  // --------------------------------------
  // CREATE BLOG TAB
  // --------------------------------------
  const addDisclosure = () => {
    setDisclosures((prev) => [...prev, { id: Date.now(), url: "" }]);
  };

  const updateDisclosure = (id: number, value: string) => {
    setDisclosures((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url: value } : item))
    );
  };

  const removeDisclosure = (id: number) => {
    setDisclosures((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRemoveScreenshot = (scrId: number) => {
    setLocalScreenshots((prev) => prev.filter((s) => s.id !== scrId));
  };

  // 1) LOGO Upload: parse JSON with "files" array
  const handleLogoUpload = {
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          `${AppSettings.API_URL}/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        // Suppose server returns
        // {
        //   "success": 1,
        //   "files": [
        //     {
        //       "filename": "Screenshot 2023-10-11 211100_1738976076.png",
        //       "url": "http://localhost:8080/static/media/Screenshot..."
        //     }
        //   ]
        // }
        const data = res.data;
        if (data.success === 1 && data.files && data.files.length > 0) {
          // We'll take the first uploaded file as the "logo"
          const fileInfo = data.files[0];
          setLocalLogoUrl(fileInfo.url);
        }
        if (onSuccess) onSuccess(data, file);
      } catch (error) {
        if (onError) onError(error);
      }
    },
  };

  // 2) SCREENSHOTS Upload: parse JSON with "files" array
  const handleScreenshotUpload = {
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          `${AppSettings.API_URL}/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const data = res.data;
        if (data.success === 1 && data.files && data.files.length > 0) {
          // For each uploaded file, add a new screenshot
          // We'll generate a local ID, or use Date.now()
          data.files.forEach((fileInfo: any) => {
            const newScrId = Date.now(); // or a more robust unique ID
            setLocalScreenshots((prev) => [
              ...prev,
              {
                id: newScrId, // local ID for track
                image_url: fileInfo.url,
              },
            ]);
          });
        }
        if (onSuccess) onSuccess(data, file);
      } catch (error) {
        if (onError) onError(error);
      }
    },
  };

  const handlePublishBlog = async () => {
    if (!selectedLeaked) return;

    try {
      const blogValues = await createBlogForm.validateFields();
      const updated: Leaked = {
        ...selectedLeaked,
        blog: blogValues.blogText || "",
        description: blogValues.blogDescription || "",
        company_name: blogValues.blogCompanyName || selectedLeaked.company_name,
        logo_url: localLogoUrl,
        screenshots: localScreenshots,
        urls: disclosures,
        publish: 1,
      };

      const response = await fetch(
        `${AppSettings.API_URL}/leakeds/${selectedLeaked.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updated),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to publish blog updates.");
      }

      message.success("Blog published successfully!");
      fetchLeakedData();
    } catch (error: any) {
      message.error("Error publishing blog: " + error.message);
      console.error(error);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}/leakeds/${id}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaked_id: id }), // добавляем leakedID
      });
  
      if (!response.ok) throw new Error("Failed to accept");
  
      message.success("Accept!");
      fetchLeakedData(); // Обновляем список
    } catch (error) {
      message.error("Ошибка при принятии");
      console.error(error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}/leakeds/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaked_id: id }), // добавляем leakedID
      });
  
      if (!response.ok) throw new Error("Failed to reject");
  
      message.success("Reject!");
      fetchLeakedData(); // Обновляем список
    } catch (error) {
      message.error("Ошибка при отклонении");
      console.error(error);
    }
  };
  

  // --------------------------------------
  // RENDER
  // --------------------------------------
  return (
    <div style={{ padding: "24px" }}>
      <Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddLeaked}
          style={{ marginBottom: 16 }}
        >
          Add Leak
        </Button>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={fetchLeakedData}
          style={{ marginBottom: 16 }}
        >
          Refresh
        </Button>
      </Space>


      <Row gutter={[16, 16]}>
        {leakeds && leakeds.length > 0 ? (
          leakeds.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  item.logo_url ? (
                    <img
                      src={item.logo_url}
                      alt={item.company_name}
                      style={{ height: 220, objectFit: "cover" }}
                    />
                  ) : undefined
                }
                actions={[
                  <EyeOutlined key="view" onClick={() => handleViewLeaked(item)} />,
                  <EditOutlined key="edit" onClick={() => handleEditLeaked(item)} />,
                  <Popconfirm
                    key="delete"
                    title="Are you sure to delete this leak?"
                    onConfirm={() => handleDeleteLeaked(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <DeleteOutlined />
                  </Popconfirm>,
                ]}
              >
                <h3>{item.company_name}</h3>
                {/* <p>
                  <strong>Company name:</strong>{" "}
                  {item.company_name.length > 60
                    ? item.company_name.substring(0, 60) + "..."
                    : item.company_name}
                </p> */}
                <p>
                  <strong>Expires:</strong>{" "}
                  {item.expires
                    ? new Date(item.expires).toLocaleString()
                    : "No expiration"}
                </p>
                <p>
                  <strong>Payout:</strong> {item.payout} (
                  {["K", "M", "B"][item.payout_unit] || "?"})
                </p>
                <p>
                  <strong>Blog:</strong> {" "} 
                  {item.publish == 1 ? <Tag color={'green'}> {'Publish'} </Tag> : (item.publish == 0 && !item.expires) ? <Tag color={'grey'}> {'Draft'} </Tag> : <Tag color={'orange'}> {'Awaiting'} </Tag>}
                </p>
                {item.is_accept == 0 && item.user.role_id != 1 && (
                  <div>
                    <Space>
                      <Button type="primary" onClick={() => handleAccept(item.id)}>
                        Accepted
                      </Button>
                      <Button danger onClick={() => handleReject(item.id)}>
                        Reject
                      </Button>
                    </Space>
                  </div>
                )}
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24} style={{ textAlign: "center", padding: "50px 0" }}>
            <Empty description="Empty" />
          </Col>
        )}
      </Row>

      <Modal
        title={
          isViewMode
            ? "View Leak"
            : selectedLeaked
            ? "Edit Leak"
            : "Add Leak"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={
          isViewMode
            ? [
                <Button key="close" onClick={() => setIsModalVisible(false)}>
                  Close
                </Button>,
              ]
            : [
                <Button key="save" type="primary" onClick={handleSave}>
                  Save
                </Button>,
              ]
        }
      >
        <Tabs defaultActiveKey="overview">
          {/* 1. OVERVIEW TAB */}
          <TabPane tab="Overview" key="overview" disabled={!selectedLeaked}>
            {selectedLeaked ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="ID">{selectedLeaked.id}</Descriptions.Item>
                <Descriptions.Item label="Company Name">
                  {selectedLeaked.company_name}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedLeaked.description}
                </Descriptions.Item>
                <Descriptions.Item label="Expires">
                  {selectedLeaked.expires
                    ? new Date(selectedLeaked.expires).toLocaleString()
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Payout">
                  {selectedLeaked.payout} / Unit: {["K", "M", "B"][selectedLeaked.payout_unit] || "?"}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {new Date(selectedLeaked.created_at).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Logo URL">
                  {selectedLeaked.logo_url ? (
                    <img
                      src={selectedLeaked.logo_url}
                      alt="Logo"
                      style={{ maxWidth: 200 }}
                    />
                  ) : (
                    "N/A"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="URLs">
                  {selectedLeaked.urls?.length > 0 ? (
                    <ul>
                      {selectedLeaked.urls.map((u) => (
                        <li key={u.id}>
                          <a href={u.url} target="_blank" rel="noreferrer">
                            {u.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No URLs"
                  )}
                </Descriptions.Item>
                {selectedLeaked.screenshots?.length > 0 && (
                  <Descriptions.Item label="Screenshots">
                    {selectedLeaked.screenshots.map((scr) => (
                      <img
                        key={scr.id}
                        src={scr.image_url}
                        alt="Screenshot"
                        style={{ width: 120, marginRight: 8 }}
                      />
                    ))}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <p>No data to show.</p>
            )}
          </TabPane>

          {/* 2. EDIT TAB */}
          <TabPane tab="Edit" key="edit" disabled={isViewMode}>
            <Form form={form} layout="vertical">
              <Form.Item label="Website" name="website">
                <Input placeholder="E.g. https://example.com" />
              </Form.Item>

              <Form.Item label="Expiration" name="expiration">
              <DatePicker
                showTime
                // onChange={(date, dateString) => {
                //   form.setFieldsValue({ publish_date: date })
                // }}
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
              />
              </Form.Item>

              <Form.Item label="Target Payout (USD)">
                <Space>
                  <Form.Item
                    name="payout_value"
                    noStyle
                    rules={[{ pattern: /^[0-9]*$/, message: "Must be a number" }]}
                  >
                    <Input style={{ width: 100 }} placeholder="Amount" />
                  </Form.Item>
                  <Form.Item name="payout_unit" noStyle initialValue="0">
                    <Select style={{ width: 80 }}>
                      <Option value="0">K</Option>
                      <Option value="1">M</Option>
                      <Option value="2">B</Option>
                    </Select>
                  </Form.Item>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 3. CREATE BLOG TAB */}
          <TabPane tab="Create Blog" key="blog" disabled={isViewMode}>
            <Form layout="vertical" form={createBlogForm}>
              <Form.Item
                label="Company Name"
                name="blogCompanyName"
                rules={[{ required: true, message: "Please enter company name!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Logo">
                {localLogoUrl ? (
                  <div>
                    <img
                      src={localLogoUrl}
                      alt="Current Logo"
                      style={{ maxWidth: 200, display: "block", marginBottom: 8 }}
                    />
                    <Button
                      danger
                      onClick={() => setLocalLogoUrl("")}
                      style={{ marginBottom: 8 }}
                    >
                      Remove Logo
                    </Button>
                  </div>
                ) : (
                  <Upload {...handleLogoUpload}>
                    <Button icon={<UploadOutlined />}>Upload Logo</Button>
                  </Upload>
                )}
              </Form.Item>

              <Form.Item label="Description" name="blogDescription">
                <TextArea rows={3} placeholder="Enter short description..." />
              </Form.Item>

              <Form.Item label="Blog" name="blogText">
                <TextArea rows={5} placeholder="We hacked CrowdStrike..." />
              </Form.Item>

              {/* Disclosures */}
              <Form.Item label="Disclosures">
                <Button
                  type="dashed"
                  onClick={addDisclosure}
                  style={{ marginBottom: 8 }}
                >
                  + Add Disclosure Link
                </Button>
                {disclosures.map((d) => (
                  <Space key={d.id} style={{ display: "flex", marginBottom: 8 }}>
                    <Input
                      style={{ width: "500px" }}
                      placeholder="Enter disclosure link"
                      value={d.url}
                      onChange={(e) => updateDisclosure(d.id, e.target.value)}
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeDisclosure(d.id)}
                    />
                  </Space>
                ))}
              </Form.Item>

              {/* Screenshots */}
              <Form.Item label="Screenshots">
                <Upload {...handleScreenshotUpload} multiple showUploadList={false}>
                  <Button icon={<UploadOutlined />}>Upload Screenshots</Button>
                </Upload>

                {/* Галерея загруженных скриншотов */}
                <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {localScreenshots.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        position: "relative",
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        overflow: "hidden",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        transition: "transform 0.2s",
                      }}
                    >
                      {/* Увеличение при наведении */}
                      <img
                        src={s.image_url}
                        alt="Screenshot"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      />

                      {/* Кнопка удаления в правом верхнем углу */}
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveScreenshot(s.id)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handlePublishBlog}>
                  Publish
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};
