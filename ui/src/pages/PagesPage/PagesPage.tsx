// PagesPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Button,
  Modal,
  Tabs,
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
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { AppSettings } from '@/shared'
import { Editor } from '../../features/Editor/Editor'
import s from './PagesPage.module.scss'
import { Spacer } from '@/shared/Spacer'
import { AddLinkModal } from '@/features/Modals/AddLinkModal'

interface Page {
  id: number
  entity_id: number
  title: string
  langs: string
  user: string
  user_id: number
  url: string
  create_at: string
  update_at: string
  is_visibility: boolean
}

interface PagesResponse {
  total: number
  data: Page[]
}

interface LanguageContent {
  id: number
  title: string
  html: string
  content_json: string
}

interface EditorData {
  is_visibility: boolean
  url_id: number
  entity_id: number
  ru: LanguageContent
  by?: LanguageContent
  en?: LanguageContent
}

interface Url {
  uid: number
  url: string
  is_occupied: boolean
}

interface User {
  id: number
  f_name: string
  l_name: string
}

type Lang = 'ru' | 'by' | 'en'

interface ContentData {
  html: string
  json: any
}

type Contents = Record<Lang, ContentData>

interface EditorHandle {
  save: () => Promise<{ html: string; json: EditorJS.OutputData } | null>
  render: (data: EditorJS.OutputData) => Promise<void>
}

export const PagesPage = () => {
  const [pages, setPages] = useState<Page[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [editorData, setEditorData] = useState<EditorData>()
  const [activeTab, setActiveTab] = useState('ru')
  const [titles, setTitles] = useState<{ [key: string]: string }>({ ru: '', by: '', en: '' })
  const [contents, setContents] = useState<Contents>({
    ru: { html: '', json: null },
    by: { html: '', json: null },
    en: { html: '', json: null },
  })
  const [form] = Form.useForm()
  const [urlId, setUrlId] = useState<number>(0)
  const [isVisibility, setIsVisibility] = useState<number>(0)
  const [urls, setUrls] = useState<Url[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchText, setSearchText] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [isAddLinkModalVisible, setIsAddLinkModalVisible] = useState(false)
  // const [copyFromLang, setCopyFromLang] = useState<Lang | null>(null)
  const editorRefs: Record<Lang, React.RefObject<EditorHandle>> = {
    ru: useRef<EditorHandle>(null),
    by: useRef<EditorHandle>(null),
    en: useRef<EditorHandle>(null),
  }
  const langs: Lang[] = ['ru', 'by', 'en']

  useEffect(() => {
    fetchPages()
    fetchUsers()
    fetchUrls()
  }, [])

  const fetchPages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${AppSettings.API_URL}pages/table-format`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch pages')
      }
      const result: PagesResponse = await response.json()
      setPages(result.data)
    } catch (error) {
      console.error('Error fetching pages:', error)
      message.error('Не удалось получить страницы.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPage = async (page: Page) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}page/${page.entity_id}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch page data')
      }
      const data: EditorData = await response.json()
      setEditorData(data)
      setSelectedPage(page)
      setTitles({
        ru: data.ru?.title || '',
        by: data.by?.title || '',
        en: data.en?.title || '',
      })
      setContents({
        ru: {
          html: data.ru?.html || '',
          json: data.ru?.content_json ? JSON.parse(data.ru.content_json) : { blocks: [] },
        },
        by: {
          html: data.by?.html || '',
          json: data.by?.content_json ? JSON.parse(data.by.content_json) : { blocks: [] },
        },
        en: {
          html: data.en?.html || '',
          json: data.en?.content_json ? JSON.parse(data.en.content_json) : { blocks: [] },
        },
      })
      setUrlId(data.url_id)
      setIsVisibility(data.is_visibility ? 1 : 0)
  
      form.setFieldsValue({
        is_visibility: data.is_visibility ? 1 : 0,
        url_id: data.url_id,
        title_ru: data.ru?.title || '',
        title_by: data.by?.title || '',
        title_en: data.en?.title || ''
      });
  
      showModal()
    } catch (error) {
      console.error('Error fetching page data:', error)
      message.error('Ошибка получения данных страницы')
    }
  }

  const fetchUrls = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}urls`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch urls')
      }
      const result: Url[] = await response.json()
      setUrls(result)
    } catch (error) {
      console.error('Error fetching urls:', error)
      message.error('Failed to fetch urls')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${AppSettings.API_URL}users`, {
        credentials: 'include',
      })
      const result = await response.json()
      setUsers(result.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    Modal.confirm({
      title: 'Вы уверены, что хотите закрыть?',
      centered: true,
      content: 'Все несохраненные изменения будут потеряны.',
      okText: 'Да',
      cancelText: 'Нет',
      onOk() {
        setIsModalVisible(false)
      },
    })
  }

  const handleSave = async (usedContents: Contents = contents) => {
    setConfirmLoading(true)
    try {
      const payload = {
        is_visibility: isVisibility === 1,
        url_id: urlId,
        entity_id: editorData?.entity_id || 0,
        ru: {
          id: editorData?.ru?.id || 0,
          title: titles.ru || null,
          html: usedContents.ru.html || null,
          content_json: JSON.stringify(usedContents.ru.json),
        },
        by:
          titles.by && usedContents.by.html
            ? {
                id: editorData?.by?.id || 0,
                title: titles.by,
                html: usedContents.by.html,
                content_json: JSON.stringify(usedContents.by.json),
              }
            : null,
        en:
          titles.en && usedContents.en.html
            ? {
                id: editorData?.en?.id || 0,
                title: titles.en,
                html: usedContents.en.html,
                content_json: JSON.stringify(usedContents.en.json),
              }
            : null,
      }

      console.log(payload)

      let response
      if (selectedPage) {
        response = await fetch(`${AppSettings.API_URL}page/edit`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch(`${AppSettings.API_URL}page/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to save the page')
      }

      message.success(selectedPage ? 'Страница изменена успешно' : 'Страница добавлена успешно')
      fetchPages()
      setIsModalVisible(false)
    } catch (error) {
      console.error('Error saving page:', error)
      message.error('Ошибка сохранения страницы')
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleDeletePage = (page: Page) => {
    Modal.confirm({
      title: 'Удалить страницу',
      width: '500px',
      centered: true,
      content: (
        <p>
          Вы точно хотите удалить страницу <b>{page.title}</b> ({page.url})?
        </p>
      ),
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: () => handleDeleteConfirm(page),
    })
  }

  const handleDeleteConfirm = async (page: Page) => {
    try {
      const response = await fetch(`${AppSettings.API_URL}page/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: page.id, entity_id: page.entity_id }),
      })
      if (!response.ok) {
        throw new Error('Failed to delete page')
      }

      message.success(`Страница ${page.title} удалена успешно`)
      fetchPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      message.error('Ошибка удаления страницы')
    } finally {
      setSelectedPage(null)
    }
  }

  const handleModalSave = async () => {
    setConfirmLoading(true)
    try {
      const updatedContents = { ...contents }

      for (const lang of langs) {
        const editorRef = editorRefs[lang]
        if (editorRef.current) {
          const data = await editorRef.current.save();
          if (data) {
            updatedContents[lang] = {
              html: data.html,
              json: JSON.parse(JSON.stringify(data.json)),
            };
          }
        }
      }

      await handleSave(updatedContents)
      setIsModalVisible(false)
    } catch (error) {
      console.error('Error saving editors:', error)
      message.error('Ошибка сохранения редактора')
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleDeleteLanguageContent = async (lang: Lang) => {
    const localizationId = editorData && editorData[lang]?.id
    if (!localizationId) {
      message.error('Нет контента для удаления')
      return
    }

    Modal.confirm({
      title: `Удалить контент для языка ${lang.toUpperCase()}?`,
      content: 'Вы действительно хотите удалить контент для этого языка?',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          const response = await fetch(`${AppSettings.API_URL}localization/delete`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ id: localizationId }),
          })

          if (!response.ok) {
            throw new Error('Failed to delete localization')
          }

          message.success(`Контент для языка ${lang.toUpperCase()} удален успешно`)

          setEditorData(prevEditorData => {
            if (prevEditorData) {
              const newEditorData = { ...prevEditorData }
              delete newEditorData[lang]
              return newEditorData
            }
            return prevEditorData
          })

          setTitles(prevTitles => {
            const newTitles = { ...prevTitles }
            newTitles[lang] = ''
            return newTitles
          })

          setContents(prevContents => {
            const newContents = { ...prevContents }
            newContents[lang] = { html: '', json: null }
            return newContents
          })

          fetchPages()
          setIsModalVisible(false)
        } catch (error) {
          console.error('Error deleting localization:', error)
          message.error('Ошибка удаления контента')
        }
      },
    })
  }

  const handleDuplicateContent = (targetLang: Lang) => {
    let selectedLang: Lang

    Modal.confirm({
      title: 'Дублировать контент с другого языка',
      content: (
        <Select
          placeholder="Выберите язык"
          onChange={value => {
            selectedLang = value as Lang
          }}
          style={{ width: '100%' }}
        >
          {langs
            .filter(lang => lang !== targetLang)
            .map(lang => (
              <Select.Option key={lang} value={lang}>
                {lang.toUpperCase()}
              </Select.Option>
            ))}
        </Select>
      ),
      okText: 'Дублировать',
      cancelText: 'Отмена',
      onOk: async () => {
        if (!selectedLang) {
          message.error('Пожалуйста, выберите язык для копирования')
          return
        }
        try {
          const sourceEditorRef = editorRefs[selectedLang]
          if (sourceEditorRef.current) {
            const data = await sourceEditorRef.current.save()
            if (data) {
              const targetEditorRef = editorRefs[targetLang]
              if (targetEditorRef.current) {
                await targetEditorRef.current.render(data.json)
                setContents(prevContents => ({
                  ...prevContents,
                  [targetLang]: {
                    html: data.html,
                    json: JSON.parse(JSON.stringify(data.json)),
                  },
                }));
                setTitles(prevTitles => ({
                  ...prevTitles,
                  [targetLang]: titles[selectedLang],
                }))
                message.success(
                  `Контент успешно скопирован с ${selectedLang.toUpperCase()} на ${targetLang.toUpperCase()}`
                )
              } else {
                message.error(`Редактор для языка ${targetLang.toUpperCase()} не инициализирован`)
              }
            } else {
              message.error(`Нет контента для копирования из ${selectedLang.toUpperCase()}`)
            }
          } else {
            message.error(`Редактор для языка ${selectedLang.toUpperCase()} не инициализирован`)
          }
        } catch (error) {
          console.error('Error duplicating content:', error)
          message.error('Ошибка при дублировании контента')
        }
      },
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const filteredPages = pages.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  )

  const resetFormState = () => {
    setSelectedPage(null)
    setEditorData(undefined)
    setTitles({ ru: '', by: '', en: '' })
    setContents({
      ru: { html: '', json: { blocks: [] } },
      by: { html: '', json: { blocks: [] } },
      en: { html: '', json: { blocks: [] } },
    })
    setUrlId(0)
    setIsVisibility(0)

    form.setFieldsValue({
      title_ru: '',
      title_by: '',
      title_en: '',
      url_id: null,
      is_visibility: 0,
    })
  }

  const columns = [
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Локализация',
      dataIndex: 'langs',
      key: 'langs',
      width: '12%',
      render: (
        _: any,
        { langs }: { langs: string; }
      ) => {
        let parsedLangs: string[] = []
        try {
          parsedLangs = JSON.parse(langs)
        } catch (error) {
          console.error('Error parsing langs:', error)
        }

        return (
          <>
            {Array.isArray(parsedLangs) ? (
              parsedLangs.map(lang => (
                <Tag color="geekblue" key={lang}>
                  <a
                    href={
                      ''
                    }
                    // href={`${AppSettings.CLIENT_URL}${lang.toLowerCase() == 'ru' ? '' : lang.toLowerCase()}${url}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {lang.toUpperCase()}
                  </a>
                </Tag>
              ))
            ) : (
              <Tag color="red">Invalid data</Tag>
            )}
          </>
        )
      },
      filters: [
        { text: 'RU', value: 'ru' },
        { text: 'BY', value: 'by' },
        { text: 'EN', value: 'en' },
      ],
      onFilter: (value: any, record: Page) => record.langs.includes(value),
    },
    {
      title: 'Путь страницы',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: 'Автор',
      dataIndex: 'user',
      key: 'user',
      sorter: (a: Page, b: Page) => Number(a.user_id) - Number(b.user_id),
      filters: users.map(user => ({
        text: `${user.f_name} ${user.l_name}`,
        value: user.id,
      })),
      onFilter: (value: any, record: Page) => record.user_id === value,
    },
    {
      title: 'Дата создания / Дата обновления',
      dataIndex: 'create_at',
      key: 'create_at',
      sorter: (a: Page, b: Page) => {
        const dateA = new Date(a.update_at).getTime()
        const dateB = new Date(b.update_at).getTime()
        return dateA - dateB
      },
      render: (_: any, page: Page) => {
        if (page.create_at === page.update_at) {
          return (
            <span>
              Создано <br />
              {page.update_at}
            </span>
          )
        } else {
          return (
            <span>
              Обновлено <br />
              {page.update_at}
            </span>
          )
        }
      },
    },
    {
      title: 'Статус',
      dataIndex: 'is_visibility',
      key: 'is_visibility',
      sorter: (a: Page, b: Page) => Number(a.is_visibility) - Number(b.is_visibility),
      render: (is_visibility: boolean) => (
        <Tag color={is_visibility ? 'green' : 'gray'}>
          {is_visibility ? 'Опубликовано' : 'Черновик'}
        </Tag>
      ),
      filters: [
        { text: 'Черновик', value: false },
        { text: 'Опубликовано', value: true },
      ],
      onFilter: (value: any, record: Page) => record.is_visibility === value,
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, page: Page) => (
        <div className={s.actionIcons}>
          <Space size={0}>
            <Button
              icon={<EditOutlined />}
              onClick={() => fetchPage(page)}
              style={{ marginRight: 8 }}
            />
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDeletePage(page)} />
          </Space>
        </div>
      ),
    },
  ]

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
              Добавить
            </Button>
            <Button type="default" icon={<ReloadOutlined />} onClick={fetchPages}>
              Обновить
            </Button>
          </Space>
        </Col>
        <Col>
          <Input
            placeholder="Поиск по заголовку"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
        </Col>
      </Row>

      <Table
        dataSource={filteredPages}
        columns={columns}
        rowKey="entity_id"
        loading={{
          spinning: isLoading,
          indicator: <Spin indicator={<LoadingOutlined spin />} size="large" />,
        }}
        onRow={record => ({
          onDoubleClick: () => fetchPage(record),
        })}
      />

      <Modal
        title={selectedPage ? 'Редактировать страницу' : 'Добавить страницу'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="save" loading={confirmLoading} onClick={handleModalSave}>
            Превью
          </Button>,
          <Button key="save" type="primary" loading={confirmLoading} onClick={handleModalSave}>
            Сохранить
          </Button>,
        ]}
        width={1200}
      >
        <Form form={form} onFinish={handleSave} className={s.editorWrapper}>
          <Form.Item
            label="Доступ"
            name="is_visibility"
            rules={[{ required: true, message: 'Please select visibility!' }]}
          >
            <Select defaultValue={isVisibility ? isVisibility : 0} onChange={setIsVisibility}>
              <Select.Option value={0}>Черновик</Select.Option>
              <Select.Option value={1}>Опубликовать</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex' }}>
            <Form.Item
              label="Путь"
              name="url_id"
              rules={[{ required: true, message: 'Please select a path!' }]}
              style={{ flex: 1, marginRight: '8px' }}
              initialValue={selectedPage?.url ? selectedPage?.url : null}
            >
              <Select
                placeholder="Выберите путь"
                value={urlId}
                onChange={setUrlId}
                style={{ width: '100%' }}
              >
                {urls.map(item => (
                  <Select.Option key={item.uid} value={item.uid} disabled={item.is_occupied}>
                    {item.url}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Button
              onClick={() => setIsAddLinkModalVisible(true)}
              type="primary"
              icon={<PlusOutlined />}
            >
              Добавить новую ссылку
            </Button>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab} destroyInactiveTabPane={false}>
            {langs.map(lang => (
              <Tabs.TabPane
                tab={
                  <span>
                    {`${lang.toUpperCase()} ${
                      contents[lang]?.json?.blocks?.length > 0 ? '(~)' : ''
                    }`}
                  </span>
                }
                key={lang}
              >
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => handleDuplicateContent(lang)}
                  style={{ marginBottom: 16 }}
                >
                  Дублировать контент
                </Button>

                {lang !== 'ru' && editorData && editorData[lang] && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteLanguageContent(lang)
                    }}
                    style={{ marginLeft: '7px' }}
                  >
                    Удалить контент
                  </Button>
                )}

                <Form.Item
                  label="Заголовок"
                  name={`title_${lang}`}
                  rules={[{ required: lang === 'ru', message: 'Please enter a title!' }]}
                  initialValue={titles[lang]}
                >
                  <Input
                    placeholder="Введите заголовок"
                    onChange={e =>
                      setTitles(prevTitles => ({ ...prevTitles, [lang]: e.target.value }))
                    }
                  />
                </Form.Item>
                <Editor ref={editorRefs[lang]} initialContent={contents[lang].json}/>
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Form>
      </Modal>

      <AddLinkModal
        visible={isAddLinkModalVisible}
        onCancel={() => setIsAddLinkModalVisible(false)}
        onSuccess={() => {
          fetchUrls()
        }}
        urls={urls}
      />
    </div>
  )
}
