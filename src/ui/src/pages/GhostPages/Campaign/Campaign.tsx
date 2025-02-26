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
  Modal
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  ReloadOutlined,
  EyeOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

import { AppSettings } from "@/shared/const/appSettings";
import { ChatsWithTabs } from "../ChatPage/ChatsWithTabs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);

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
  created_at: Dayjs;
  description?: string;
  website: string;
  user?: User;
  expires: Dayjs;
  logo_url?: string;
  screenshots: Screenshot[];
  urls: UrlItem[];
  payout?: number;
  payout_unit?: number;
  builder: number;
  company_name?: string;
  lastLogin?: string;
  publish?: number;
  is_accept: number;
}

const CampaignsDashboard: React.FC = () => {
  const navigate = useNavigate()

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const [form] = Form.useForm();
  const [createBlogForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [_, setUser] = useState<User | null>(null);

  const [disclosures, setDisclosures] = useState<UrlItem[]>([]);
  const [localLogoUrl, setLocalLogoUrl] = useState<string>("");
  const [localScreenshots, setLocalScreenshots] = useState<Screenshot[]>([]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}/campaign`, {
        credentials: "include",
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      const data = await response.json();

      if (!Array.isArray(data)) {
        setCampaigns([]);
        return;
      }      

      const parsedData: Campaign[] = data.map((item: any) => ({
        ...item,
        created_at: item.created_at
          ? dayjs.utc(item.created_at, "YYYY-MM-DD HH:mm:ss").local()
          : null,
        expires: item.expires
          ? dayjs.utc(item.expires, "YYYY-MM-DD HH:mm:ss").local()
          : null,
      }));

      setCampaigns(parsedData);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      message.error("Failed to fetch campaigns.");
    }
  };

  useEffect(() => {
    fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          navigate('/')
          setUser(null);
        }
      })
      .catch(() => {
        navigate('/')
        setUser(null);
      });
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // При клике на строку в таблице — показываем карточку с подробностями
  const handleRowClick = (record: Campaign) => {
    // record.expires = record.expires 
    // ? dayjs(record.expires)
    // : undefined;
    setSelectedCampaign(record);
  };

  // ==============================
  // Модальное окно (Add / Edit)
  // ==============================
  const handleAddCampaign = () => {
    setSelectedCampaign(null);
    setIsViewMode(false);
    editForm.resetFields();
    setIsModalVisible(true);
  };

  // const handleViewCampaign = (record: Campaign) => {
  //   setSelectedCampaign(record);
  //   setIsViewMode(true);
  //   editForm.setFieldsValue({
  //     company_name: record.company_name || "",
  //     website: record.website || "",
  //     description: record.description || "",
  //   });
  //   setIsModalVisible(true);
  // };

  const handleModalSave = async () => {
    try {
      const values = await editForm.validateFields();
      const isEditing = !!selectedCampaign;

      const payload: Partial<Campaign> = {
        company_name: values.company_name,
        website: values.website,
        description: values.description,
        is_accept: 2,
      };

      let method = "POST";
      let url = `${AppSettings.API_URL}/campaign`;

      if (isEditing && selectedCampaign) {
        method = "PUT";
        url = `${AppSettings.API_URL}/leakeds/${selectedCampaign.id}`;
        payload.id = selectedCampaign.id;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save campaign");
      }

      message.success(
        isEditing ? "Campaign updated successfully!" : "Campaign created successfully!"
      );
      setIsModalVisible(false);
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      message.error("Error saving campaign: " + error.message);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    try {
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

  // ==============================
  // Заполнение форм при выборе кампании
  // ==============================
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

  function fillEditForm(c: Campaign) {
    console.log(c.expires);

    form.setFieldsValue({
      website: c.website || "",
      expiration: c.expires ? dayjs(c.expires) : null,
      payout_value: c.payout || 0,
      payout_unit: c.payout_unit?.toString() ?? "0",
    });
  }

  function fillBlogForm(c: Campaign) {
    createBlogForm.setFieldsValue({
      blogCompanyName: c.company_name || "",
      blogDescription: c.description || "",
      blogText: c.blog || "",
    });
    setLocalLogoUrl(c.logo_url || "");
    setLocalScreenshots(c.screenshots || []);
    setDisclosures(c.urls || []);
  }

  // ==============================
  // Сохранение из вкладки «Edit»
  // ==============================
  const handleSave = async () => {
    if (!selectedCampaign) return;

    try {
      // Данные из «Edit»-формы
      const mainValues = form.getFieldsValue();
      const blogValues = createBlogForm.getFieldsValue(); // можно тоже подхватить
      const expiresStr = mainValues.expiration
        ? mainValues.expiration.toISOString()
        : null;

      console.log(expiresStr);

      const fullPayload: Campaign = {
        ...selectedCampaign,
        company_name: blogValues.blogCompanyName || selectedCampaign.company_name || "",
        description: blogValues.blogDescription || selectedCampaign.description || "",
        blog: blogValues.blogText || selectedCampaign.blog || "",

        website: mainValues.website || null,
        payout: Number(mainValues.payout_value || 0),
        payout_unit: Number(mainValues.payout_unit || 0),
        logo_url: localLogoUrl,
        screenshots: localScreenshots,
        urls: disclosures,
        is_accept: selectedCampaign.is_accept || 2,
        publish: selectedCampaign.publish || 0,
        ...(expiresStr ? { expires: dayjs(expiresStr) } : {}),
      };

      const response = await fetch(`${AppSettings.API_URL}/leakeds/${selectedCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(fullPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      message.success("Campaign updated successfully");
      fetchCampaigns();
    } catch (error) {
      console.error("Error saving leak:", error);
      message.error("Error saving leak");
    }
  };

  // ==============================
  // Новая кнопка «Save Draft» во вкладке «Create Blog»
  // ==============================
  const handleSaveBlog = async () => {
    if (!selectedCampaign) return;
  
    try {
      const blogValues = createBlogForm.getFieldsValue();
      const mainValues = form.getFieldsValue();
  
      const expiresStr = mainValues.expiration
        ? mainValues.expiration.toISOString()
        : null;
  
      console.log(expiresStr);
  
      const updatedCampaign: Campaign = {
        ...selectedCampaign,
        company_name: blogValues.blogCompanyName || "",
        description: blogValues.blogDescription || "",
        blog: blogValues.blogText || "",
        logo_url: localLogoUrl,
        screenshots: localScreenshots,
        urls: disclosures,
        website: mainValues.website || null,
        payout: Number(mainValues.payout_value || 0),
        payout_unit: Number(mainValues.payout_unit || 0),
        is_accept: selectedCampaign.is_accept || 2,
        ...(expiresStr ? { expires: dayjs(expiresStr) } : {}),
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
        throw new Error("Failed to save blog draft.");
      }
      message.success("Blog draft saved successfully!");
      fetchCampaigns();
    } catch (error: any) {
      message.error("Error saving blog draft: " + error.message);
      console.error(error);
    }
  };

  // ==============================
  // Кнопка «Publish» во вкладке «Create Blog»
  // ==============================
  const handlePublishBlog = async () => {
    if (!selectedCampaign) return;

    try {
      // Берём данные из форм «Create Blog» и «Edit» (поля payout, т.д.)
      const blogValues = await createBlogForm.validateFields();
      const mainValues = form.getFieldsValue();
      const expiresStr = mainValues.expiration
        ? mainValues.expiration.toISOString()
        : null;

      const updatedCampaign: Campaign = {
        ...selectedCampaign,
        company_name: blogValues.blogCompanyName || "",
        description: blogValues.blogDescription || "",
        blog: blogValues.blogText || "",
        logo_url: localLogoUrl,
        screenshots: localScreenshots,
        urls: disclosures,

        // из «Edit»-формы
        website: mainValues.website || null,
        expires: dayjs(expiresStr || undefined),
        payout: Number(mainValues.payout_value || 0),
        payout_unit: Number(mainValues.payout_unit || 0),

        // При публикации
        is_accept: 0, // Pending
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
  // Генерация сборок (Builder)
  // ==============================
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBuilds = async () => {
    if (!selectedCampaign) {
      message.error("No campaign selected!");
      return;
    }
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

      // Пытаемся вытащить имя файла из заголовков
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

  const getFullPayoutValue = (payout: number, payoutUnit: number) => {
    // 0 => x1, 1 => x1000, 2 => x1_000_000, 3 => x1_000_000_000
    const unitValues = [1000, 1_000_000, 1_000_000_000];
    const multiplier = unitValues[payoutUnit] || 1;
    return payout * multiplier;
  }; 

  // Колонки таблицы
  const columns: ColumnsType<Campaign> = [
    {
      title: "Logo",
      dataIndex: "logo_url",
      key: "logo_url",
      render: (_, c: Campaign) =>
        c.logo_url ? (
          <img style={{ maxWidth: "80px" }} src={c.logo_url} alt="logo" />
        ) : (
          <span>No logo</span>
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
      render: (value: Dayjs) =>
        value
          ? getTimeRemaining(value) === "Expired"
            ? <Tag color="green">Expired</Tag>
            : `${value.format("YYYY-MM-DD HH:mm:ss")} (${getTimeRemaining(value)})`
          : "N/A",
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (value: Dayjs) =>
        value ? value.format("YYYY-MM-DD HH:mm:ss") : "N/A",
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
              // handleViewCampaign(record);
            }}
          />
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

  const getTimeRemaining = (expires: dayjs.Dayjs) => {
    const now = dayjs().valueOf();
    const expiryTime = expires.valueOf();
    const diff = expiryTime - now;
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
    } else {
      return "Expired";
    }
  };

  // Пример счётчика времени до истечения
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (selectedCampaign?.expires) {
      const updateTime = () => {
        const now = dayjs().valueOf();
        const expiryTime = selectedCampaign.expires.valueOf();
        const diff = expiryTime - now;

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
        } else {
          setTimeRemaining("Expired");
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeRemaining("N/A");
    }
  }, [selectedCampaign]);

  // ==============================
  // UI
  // ==============================
  return (
    <div style={{ padding: 24 }}>
      <Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCampaign}
          style={{ marginBottom: 16, background: "rgb(0, 150, 20)" }}
        >
          Add Campaign
        </Button>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchCampaigns}
          style={{ marginBottom: 16, background: "rgb(17, 182, 39)" }}
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
          <div
            style={{ textAlign: "center", fontSize: "1.5rem", margin: "16px 0" }}
          >
            Expires: {timeRemaining}
          </div>

          <Card title={selectedCampaign.company_name} style={{ marginTop: 24 }}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Overview" key="1">
                {selectedCampaign ? (
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">
                      {selectedCampaign.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Company Name">
                      {selectedCampaign.company_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Description">
                      {selectedCampaign.description}
                    </Descriptions.Item>
                    <Descriptions.Item label="Expires">
                      {selectedCampaign.expires
                        ? selectedCampaign.expires.format("YYYY-MM-DD HH:mm:ss")
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Payout">
                      <Space>
                        <DollarCircleOutlined style={{ color: "#52c41a" }} />
                        {new Intl.NumberFormat().format(
                          getFullPayoutValue(
                            selectedCampaign.payout || 0,
                            selectedCampaign.payout_unit || 0
                          )
                        )}
                        $
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                      {selectedCampaign.created_at
                        ? selectedCampaign.created_at.format(
                            "YYYY-MM-DD HH:mm:ss"
                          )
                        : "N/A"}
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

              <TabPane tab="Edit" key="edit">
                <Form form={form} layout="vertical">
                  <Form.Item label="Website" name="website">
                    <Input placeholder="E.g. https://example.com" />
                  </Form.Item>

                  <Form.Item label="Expiration" name="expiration">
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Form.Item label="Target Payout (USD)">
                    <Space>
                    <Form.Item
                      name="payout_value"
                      noStyle
                      rules={[
                        {
                          pattern: /^\d*\.?\d*$/,
                          message: "Must be a valid number",
                        },
                      ]}
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
                <Button
                  key="save"
                  type="primary"
                  style={{ marginTop: 25 }}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </TabPane>

              <TabPane tab="Create Blog" key="blog">
                <Form layout="vertical" form={createBlogForm}>
                  <Form.Item
                    label="Company Name"
                    name="blogCompanyName"
                    rules={[
                      { required: true, message: "Please enter company name!" },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item label="Logo">
                    {localLogoUrl ? (
                      <div>
                        <img
                          src={localLogoUrl}
                          alt="Current Logo"
                          style={{
                            maxWidth: 200,
                            display: "block",
                            marginBottom: 8,
                          }}
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
                      <Upload
                        {...{
                          customRequest: async (options: any) => {
                            const { file, onSuccess, onError } = options;
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const res = await axios.post(
                                `${AppSettings.API_URL}/upload`,
                                formData,
                                {
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
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
                        }}
                      >
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

                  <Form.Item label="Disclosures">
                    <Button
                      type="dashed"
                      onClick={() =>
                        setDisclosures((prev) => [
                          ...prev,
                          { id: Date.now(), url: "" },
                        ])
                      }
                      style={{ marginBottom: 8 }}
                    >
                      + Add Disclosure Link
                    </Button>
                    {disclosures.map((d) => (
                      <Space
                        key={d.id}
                        style={{ display: "flex", marginBottom: 8 }}
                      >
                        <Input
                          style={{ width: "500px" }}
                          placeholder="Enter disclosure link"
                          value={d.url}
                          onChange={(e) =>
                            setDisclosures((prev) =>
                              prev.map((item) =>
                                item.id === d.id
                                  ? { ...item, url: e.target.value }
                                  : item
                              )
                            )
                          }
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            setDisclosures((prev) =>
                              prev.filter((item) => item.id !== d.id)
                            )
                          }
                        />
                      </Space>
                    ))}
                  </Form.Item>

                  <Form.Item label="Screenshots">
                    <Upload
                      multiple
                      showUploadList={false}
                      customRequest={async (options: any) => {
                        const { file, onSuccess, onError } = options;
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await axios.post(
                            `${AppSettings.API_URL}/upload`,
                            formData,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            }
                          );
                          const data = res.data;
                          if (
                            data.success === 1 &&
                            data.files?.length > 0
                          ) {
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
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Upload Screenshots</Button>
                    </Upload>
                    <div
                      style={{
                        marginTop: 16,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
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
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              setLocalScreenshots((prev) =>
                                prev.filter((x) => x.id !== s.id)
                              )
                            }
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

                  {/* Кнопки Save Draft и Publish */}
                  <Form.Item>
                    <Space>
                      <Button onClick={handleSaveBlog}>Save Draft</Button>
                      <Button type="primary" onClick={handlePublishBlog}>
                        Publish
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="Chats" key="chats">
                <ChatsWithTabs leaked_id={selectedCampaign.id} />
              </TabPane>
            </Tabs>
          </Card>
        </>
      )}

      {/* ========== Модальное окно для добавления/редактирования ========== */}
      <Modal
        title={
          isViewMode
            ? "View Campaign"
            : selectedCampaign
            ? "Edit Campaign"
            : "Add Campaign"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        footer={
          isViewMode
            ? [
                <Button key="close" onClick={() => setIsModalVisible(false)}>
                  Close
                </Button>,
              ]
            : [
                <Button key="save" type="primary" onClick={handleModalSave}>
                  Save
                </Button>,
              ]
        }
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Company Name"
            name="company_name"
            rules={[{ required: true, message: "Please enter company name" }]}
          >
            <Input placeholder="Acme Inc." />
          </Form.Item>

          <Form.Item
            label="Website"
            name="website"
            rules={[{ required: true, message: "Please enter website" }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Short description..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CampaignsDashboard;
