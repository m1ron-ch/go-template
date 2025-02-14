import React, { useState, useEffect, useRef } from 'react'
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Table,
  Space,
  Tag,
  Spin,
  Col,
  Row,
  Upload,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  UploadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { AppSettings } from '@/shared'
import { Editor } from '../../../features/Editor/Editor'
import s from './NewsPage.module.scss'
import { Spacer } from '@/shared/Spacer'
import moment from 'moment/min/moment-with-locales'
import 'moment/locale/en-gb'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)
moment.locale('en')

interface News {
  id: number
  entity_id: number
  title: string
  user: User
  type: number
  create_at: string
  update_at: string
  is_visibility: boolean
  image: string
  publish_date: string
  date: string
  time: string
  json: string
  preview: string
  content: string
}

interface User {
  login: string
  user_id: number
}

interface ImageData {
  upload_date: string
  filename: string
  url: string
  type: string
}

/** Editor data (single language, without separate by/en) */
interface EditorData {
  image: string
  publish_date: string
  is_visibility: boolean
  entity_id: number
  type: number
  create_at: string
  /** title, preview, content (html/json) */
  title: string
  preview: string
  content: string
  json: string
}

interface EditorHandle {
  save: () => Promise<{ html: string; json: any } | null>
  render: (data: any) => Promise<void>
}

export const NewsPage = () => {
  const [newsList, setNewsList] = useState<News[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isImageModalVisible, setImageIsModalVisible] = useState(false)
  const [selectedNews, setSelectedNews] = useState<News | null>(null)

  // All editor logic for a single language
  const [, setEditorData] = useState<EditorData | null>(null)
  const [title, setTitle] = useState<string>('') // Title
  const [preview, setPreview] = useState<string>('') // Preview (short description)
  const [content, setContent] = useState<{ html: string; json: any }>({ html: '', json: {} })
  const [isVisibility, setIsVisibility] = useState<number>(0)
  const [, setNewsType] = useState<number>(0)
  const [image, setImage] = useState<ImageData>({
    upload_date: '',
    filename: '',
    url: '',
    type: '',
  })
  const [searchText, setSearchText] = useState<string>('')

  const [isLoading, setIsLoading] = useState(true)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [mediaItems, _] = useState<ImageData[]>([])

  const editorRef = useRef<EditorHandle>(null)
  const [form] = Form.useForm()

  const [currUser, setCurrUser] = useState<User | null>(null)
  

  useEffect(() => {
    fetchNews()
    fetchMedia()

        fetch(`${AppSettings.API_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json()
              setCurrUser(data)
            } else {
              setCurrUser(null)
            }
          })
          .catch(() => {
            setCurrUser(null)
          })
  }, [])

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${AppSettings.API_URL}/news`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      const result: News[] = await response.json()
      setNewsList(result)
    } catch (error) {
      console.error('Error fetching news:', error)
      message.error('Failed to fetch news.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMedia = async () => {
    // Uncomment and implement if needed
    // try {
    //   const response = await fetch(`${AppSettings.API_URL}/media`)
    //   const data = await response.json()
    //   const images: ImageData[] = data.data.filter((item: ImageData) => item.type === 'image')
    //   setMediaItems(images)
    // } catch (error) {
    //   message.error('Error fetching media data')
    // }
  }

  const fetchCurrentNews = async (newsItem: News) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}/news/${newsItem.id}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch news data')
      }
      const data: EditorData = await response.json()

      setEditorData(data)
      setSelectedNews(newsItem)

      // Populate fields
      setTitle(data.title || '')
      setPreview(data.preview || '')
      setIsVisibility(data.is_visibility ? 1 : 0)
      setNewsType(data.type)
      setContent({
        html: data.content || '',
        json: data.json ? JSON.parse(data.json) : { blocks: [] },
      })
      setImage({
        url: `${data.image}`,
        upload_date: '',
        filename: data.image,
        type: '',
      })

      console.log(data);

      form.setFieldsValue({
        is_visibility: data.is_visibility ? 1 : 0,
        type: data.type,
        image: data.image || '',
        title: data.title || '',
        preview: data.preview || '',
        // publish_date (if needed)
      })

      showModal()
    } catch (error) {
      console.error('Error fetching news data:', error)
      message.error('Error fetching news data')
    }
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    Modal.confirm({
      title: 'Are you sure you want to close?',
      centered: true,
      content: 'All unsaved changes will be lost.',
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        setIsModalVisible(false)
      },
    })
  }

  const handleDeleteNews = (newsItem: News) => {
    Modal.confirm({
      title: 'Delete News',
      width: '500px',
      centered: true,
      content: (
        <p>
          Are you sure you want to delete the news item <b>{newsItem.title}</b>?
        </p>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleDeleteConfirm(newsItem),
    })
  }

  const handleDeleteConfirm = async (newsItem: News) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}news/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: newsItem.id, entity_id: newsItem.entity_id }),
      })
      if (!response.ok) {
        throw new Error('Failed to delete news')
      }

      message.success(`News item ${newsItem.title} deleted successfully`)
      fetchNews()
    } catch (error) {
      console.error('Error deleting news:', error)
      message.error('Error deleting news')
    } finally {
      setSelectedNews(null)
    }
  }

  const handleModalSave = async () => {
    setConfirmLoading(true)
    try {
      // Save data from the Editor
      let updatedContent = content
      if (editorRef.current) {
        const data = await editorRef.current.save()
        if (data) {
          updatedContent = data
        }
      }

      await handleSave(updatedContent)
      setIsModalVisible(false)
    } catch (error) {
      console.error('Error saving editor:', error)
      message.error('Error saving editor')
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleSave = async (usedContent: { html: string; json: any }) => {
    setConfirmLoading(true)

    try {
      const payload = {
        id: selectedNews?.id,
        is_visibility: form.getFieldValue('is_visibility') === 1,
        image: image.url,
        user_id: currUser?.user_id,
        title: form.getFieldValue('title') || '',
        preview: form.getFieldValue('preview') || '',
        content: usedContent.html,
        json: JSON.stringify(usedContent.json),
        user: {
          id :currUser?.user_id
        }
      }

      console.log(payload)

      let response
      if (selectedNews) {
        // Edit existing news
        response = await fetch(`${AppSettings.API_URL}/news/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      } else {
        // Create new news
        response = await fetch(`${AppSettings.API_URL}/news`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to save the news')
      }

      message.success(selectedNews ? 'News updated successfully' : 'News added successfully')
      fetchNews()
      setIsModalVisible(false)
    } catch (error) {
      console.error('Error saving news:', error)
      message.error('Error saving news')
    } finally {
      setConfirmLoading(false)
    }
  }

  const getDaysUntilPublish = (date: string) => {
    const currentDate = moment()
    const publishMoment = moment(date)
    return publishMoment.diff(currentDate, 'days')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const filteredNewsList = newsList.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  )

  const resetFormState = () => {
    setSelectedNews(null)
    setEditorData(null)
    setTitle('')
    setPreview('')
    setContent({ html: '', json: { blocks: [] } })
    setIsVisibility(0)
    setNewsType(0)
    setImage({ filename: '', url: '', type: '', upload_date: '' })

    form.setFieldsValue({
      title: '',
      preview: '',
      is_visibility: 0,
      type: 0,
      // publish_date: null,
      image: '',
    })
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (_: any, news: News) => {
        return (
          <img
            style={{ maxWidth: '100px' }}
            src={`${news.image}`}
            alt="news"
          />
        )
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    // {
    //   title: 'Section',
    //   dataIndex: 'type',
    //   key: 'type',
    //   sorter: (a: News, b: News) => Number(a.type) - Number(b.type),
    //   render: (_: any, newsItem: News) => <>{getType(newsItem.type)}</>,
    //   filters: [
    //     { text: 'Company News', value: 0 },
    //     { text: 'Country News', value: 1 },
    //   ],
    //   onFilter: (value: any, record: News) => record.type === value,
    // },
    {
      title: 'User',
      dataIndex: ['user', 'login'], // Using nested dataIndex
      key: 'user.login',
      render: (_: any, newsItem: News) => newsItem.user?.login || '—',
    },
    {
      title: 'Date',
      dataIndex: 'create_at',
      key: 'create_at',
      render: (_: any, n: News) => {
        return `${n.date} ${n.time}`
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_visibility',
      key: 'is_visibility',
      render: (_: any, { is_visibility, publish_date }: News) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {publish_date && (
            <Tooltip
              title={`Publish date: ${publish_date}, in ${getDaysUntilPublish(
                publish_date
              )} days`}
            >
              <ClockCircleOutlined style={{ marginRight: 8 }} />
            </Tooltip>
          )}
          <Tag color={is_visibility ? 'green' : 'gray'}>
            {is_visibility ? 'Publish' : 'Draft'}
          </Tag>
        </div>
      ),
      filters: [
        { text: 'Draft', value: false },
        { text: 'Published', value: true },
      ],
      onFilter: (value: any, record: News) => record.is_visibility === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, newsItem: News) => (
        <div className={s.actionIcons}>
          <Space size={0}>
            <Button
              icon={<EditOutlined />}
              onClick={() => fetchCurrentNews(newsItem)}
              style={{ marginRight: 8 }}
            />
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteNews(newsItem)} />
          </Space>
        </div>
      ),
    },
  ]

  const uploadProps = {
    name: 'file',
    action: `${AppSettings.API_URL}/upload`,
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`)
        const response = info.file.response;

        console.log(response);
        // Извлекаем URL из поля file.url, если оно есть, иначе пытаемся из response.url
        const fileUrl = (response && response.files && response.files[0].url) || response.files[0].url || '';
        console.log(fileUrl);
        // Обновляем состояние image
        setImage({
          filename: response.files[0].filename, // можно сохранить оригинальное имя
          url: fileUrl,
          type: '',
          upload_date: '',
        });
        // Устанавливаем значение в форме (если нужно)
        form.setFieldsValue({ image: fileUrl });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} error uploading file`)
      }
    },
  };

  return (
    <div>
      <Spacer />
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                resetFormState()
                showModal()
              }}
            >
              Add
            </Button>
            <Button type="default" icon={<ReloadOutlined />} onClick={fetchNews}>
              Refresh
            </Button>
          </Space>
        </Col>
        <Col>
          <Input
            placeholder="Search by title"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
        </Col>
      </Row>

      <Table
        dataSource={filteredNewsList}
        columns={columns}
        rowKey="id"
        loading={{
          spinning: isLoading,
          indicator: <Spin indicator={<LoadingOutlined spin />} size="large" />,
        }}
        onRow={record => ({
          onDoubleClick: () => fetchCurrentNews(record),
        })}
      />

      <Modal
        title={selectedNews ? 'Edit News' : 'Add News'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="save" type="primary" loading={confirmLoading} onClick={handleModalSave}>
            Save
          </Button>,
        ]}
        width={1200}
      >
        <Form form={form} onFinish={() => {}} /* nothing here, saving is handled by handleModalSave */>
          <Form.Item label="Visibility" name="is_visibility">
            <Select
              value={isVisibility}
              onChange={(val) => {
                setIsVisibility(val)
                form.setFieldsValue({ is_visibility: val })
              }}
            >
              <Select.Option value={0}>Draft</Select.Option>
              <Select.Option value={1}>Publish</Select.Option>
            </Select>
          </Form.Item>

          {/* <Form.Item label="Type" name="type">
            <Select
              value={newsType}
              onChange={value => {
                setNewsType(value)
                form.setFieldsValue({ type: value })
              }}
            >
              <Select.Option value={0}>Company News</Select.Option>
              <Select.Option value={1}>Country News</Select.Option>
            </Select>
          </Form.Item>

          <ConfigProvider locale={enUS}>
            <Form.Item label="Publish Date" name="publish_date">
              <DatePicker
                showTime
                // defaultValue={dayjs('2024-10-10 20:20:20', 'YYYY-MM-DD HH:mm:ss')}
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </ConfigProvider> */}

          <Form.Item label="Image" name="image">
            <Space>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Space>
            {image.url && (
              <img src={image.url} alt="news" style={{ maxWidth: '100%', marginTop: '10px' }} />
            )}
          </Form.Item>

          <Form.Item label="Title" name="title">
            <Input
              placeholder="Enter title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                form.setFieldsValue({ title: e.target.value })
              }}
            />
          </Form.Item>

          <Form.Item label="Preview" name="preview">
            <Input.TextArea
              rows={3}
              placeholder="Short description"
              value={preview}
              onChange={(e) => {
                setPreview(e.target.value)
                form.setFieldsValue({ preview: e.target.value })
              }}
            />
          </Form.Item>

          <h3>Content</h3>
          <Editor ref={editorRef} initialContent={content?.json} />
        </Form>
      </Modal>

      {/* Modal for selecting an image from the list */}
      <Modal
        title="Choose a Photo"
        open={isImageModalVisible}
        onOk={() => setImageIsModalVisible(false)}
        onCancel={() => setImageIsModalVisible(false)}
        width={'80%'}
      >
        <div className="image-selection-modal-content">
          {mediaItems.map((item, idx) => (
            <img
              key={idx}
              src={item.url}
              alt={item.filename}
              className="selectable-image"
              onClick={() => {
                setImage({
                  filename: item.filename,
                  url: item.url,
                  upload_date: '',
                  type: '',
                })
                form.setFieldsValue({ image: item.filename })
                setImageIsModalVisible(false)
              }}
              style={{ cursor: 'pointer', margin: 10, maxHeight: 100 }}
            />
          ))}
        </div>
      </Modal>
    </div>
  )
}
