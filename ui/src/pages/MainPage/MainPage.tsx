import React, { useState, useEffect } from 'react'
import { Tabs, Input, Button, Row, Col, Space, Card, Typography, message, Spin } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { Spacer } from '@/shared/Spacer'
import { AppSettings } from '@/shared'
import { CopyOutlined, LoadingOutlined, SaveOutlined } from '@ant-design/icons'

const { TabPane } = Tabs
const { Title } = Typography

type Language = 'ru' | 'by' | 'en'

interface EditableField {
  key: string
  text: string
  url: string
}

interface EditableContactField {
  key: string
  label: string
  values: Record<Language, string>
}

interface MainPageData {
  [language: string]: {
    [key: string]: string
  }
}

export const MainPage: React.FC = () => {
  const [activeLanguage, setActiveLanguage] = useState<Language>('ru')

  const [data, setData] = useState<Record<Language, EditableField[]>>({
    ru: [],
    by: [],
    en: [],
  })

  const [footerData, setFooterData] = useState<Record<Language, EditableField[]>>({
    ru: [],
    by: [],
    en: [],
  })

  const [contactData, setContactData] = useState<EditableContactField[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${AppSettings.API_URL}main_page`, {
          method: 'GET',
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('HTTP error! Status: ${response.status}')
        }
        const jsonData: MainPageData = await response.json()
        processData(jsonData)
      } catch (error) {
        console.error('Ошибка при получении данных:', error)
        message.error('Не удалось загрузить данные.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processData = (jsonData: MainPageData): void => {
    const updatedData: Record<Language, EditableField[]> = {
      ru: [],
      by: [],
      en: [],
    }

    const updatedFooterData: Record<Language, EditableField[]> = {
      ru: [],
      by: [],
      en: [],
    }

    const contactsMap: { [key: string]: EditableContactField } = {}

    ;(Object.keys(jsonData) as Language[]).forEach((language: Language) => {
      const langData = jsonData[language]

      Object.keys(langData).forEach((key: string) => {
        const value = langData[key]

        if (key.startsWith('cell')) {
          const isUrl = key.endsWith('_url')
          const baseKey = isUrl ? key.slice(0, -4) : key

          let fieldIndex = updatedData[language].findIndex(field => field.key === baseKey)
          if (fieldIndex === -1) {
            updatedData[language].push({ key: baseKey, text: '', url: '' })
            fieldIndex = updatedData[language].length - 1
          }

          if (isUrl) {
            updatedData[language][fieldIndex].url = value
          } else {
            updatedData[language][fieldIndex].text = value
          }
        } else if (key.startsWith('policy-')) {
          const isUrl = key.endsWith('_url')
          const baseKey = isUrl ? key.slice(0, -4) : key

          let fieldIndex = updatedFooterData[language].findIndex(field => field.key === baseKey)
          if (fieldIndex === -1) {
            updatedFooterData[language].push({ key: baseKey, text: '', url: '' })
            fieldIndex = updatedFooterData[language].length - 1
          }

          if (isUrl) {
            updatedFooterData[language][fieldIndex].url = value
          } else {
            updatedFooterData[language][fieldIndex].text = value
          }
        } else {
          if (!contactsMap[key]) {
            let label = ''
            switch (key) {
              case 'address':
                label = 'Адрес'
                break
              case 'phone':
                label = 'Телефон'
                break
              case 'fax':
                label = 'Факс'
                break
              case 'email':
                label = 'Электронная почта'
                break
              default:
                label = key
            }

            contactsMap[key] = {
              key: key,
              label: label,
              values: {
                ru: '',
                by: '',
                en: '',
              },
            }
          }

          contactsMap[key].values[language] = value
        }
      })
    })

    const updatedContactData: EditableContactField[] = Object.values(contactsMap)

    setData(updatedData)
    setFooterData(updatedFooterData)
    setContactData(updatedContactData)
  }

  const handleInputChange = (
    language: Language,
    index: number,
    key: keyof EditableField,
    value: string
  ): void => {
    setData(prevData => {
      const updatedFields = [...prevData[language]]
      updatedFields[index][key] = value
      return { ...prevData, [language]: updatedFields }
    })
  }

  const handleFooterInputChange = (
    language: Language,
    index: number,
    key: keyof EditableField,
    value: string
  ): void => {
    setFooterData(prevData => {
      const updatedFields = [...prevData[language]]
      updatedFields[index][key] = value
      return { ...prevData, [language]: updatedFields }
    })
  }

  const handleContactInputChange = (language: Language, index: number, value: string): void => {
    setContactData(prevData => {
      const updatedData = [...prevData]
      updatedData[index].values[language] = value
      return updatedData
    })
  }

  const renderPseudoTable = (fields: EditableField[], language: Language): JSX.Element => {
    return (
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} md={8}>
          <Card bordered style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%', padding: '12% 0' }}>
              <TextArea
                rows={3}
                value={fields[0]?.text || ''}
                onChange={e => handleInputChange(language, 0, 'text', e.target.value)}
                placeholder="Введите текст"
                style={{ width: '100%' }}
              />
              <Input
                value={fields[0]?.url || ''}
                onChange={e => handleInputChange(language, 0, 'url', e.target.value)}
                addonBefore="/"
                placeholder="Введите URL"
                style={{ width: '100%' }}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Row gutter={[16, 16]} style={{ height: '100%' }}>
            {fields.slice(1).map((field: EditableField, index: number) => (
              <Col xs={24} sm={12} key={field.key}>
                <Card bordered style={{ height: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%', height: '100%' }}>
                    <Input
                      value={field.text}
                      onChange={e => handleInputChange(language, index + 1, 'text', e.target.value)}
                      placeholder="Введите название"
                      style={{ flexGrow: 1 }}
                    />
                    <Input
                      value={field.url}
                      onChange={e => handleInputChange(language, index + 1, 'url', e.target.value)}
                      addonBefore="/"
                      placeholder="Введите URL"
                    />
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    )
  }

  const renderFooterFields = (
    fields: EditableField[],
    _: Language,
    handleChange: (index: number, key: keyof EditableField, value: string) => void
  ): JSX.Element => {
    return (
      <Row gutter={[16, 16]}>
        {fields.map((field: EditableField, index: number) => (
          <Col xs={24} md={12} key={field.key}>
            <Card bordered>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  value={field.text}
                  onChange={e => handleChange(index, 'text', e.target.value)}
                  placeholder="Введите название"
                />
                <Input
                  value={field.url}
                  onChange={e => handleChange(index, 'url', e.target.value)}
                  addonBefore="/"
                  placeholder="Введите URL"
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  const renderContactFields = (
    contacts: EditableContactField[],
    language: Language
  ): JSX.Element => {
    return (
      <Row gutter={[16, 16]}>
        {contacts.map((contact: EditableContactField, index: number) => (
          <Col xs={24} md={12} key={contact.key}>
            <Card bordered>
              <Space direction="vertical" style={{ width: '100%' }}>
                <b>{contact.label}</b>
                <Input
                  value={contact.values[language]}
                  onChange={e => {
                    const newValue = e.target.value
                    handleContactInputChange(language, index, newValue)
                  }}
                  placeholder={`Введите ${contact.label}`}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('Тег "<br>" успешно скопирован в буфер обмена!')
      })
      .catch(() => {
        message.error('Не удалось скопировать тег.')
      })
  }

  const handleSave = async (): Promise<void> => {
    const payload: MainPageData = {
      ru: {},
      by: {},
      en: {},
    }

    Object.keys(data).forEach((languageKey: string) => {
      const language = languageKey as Language
      data[language].forEach((field: EditableField) => {
        payload[language][field.key] = field.text
        payload[language][`${field.key}_url`] = field.url
      })
    })

    Object.keys(footerData).forEach((languageKey: string) => {
      const language = languageKey as Language
      footerData[language].forEach((field: EditableField) => {
        payload[language][field.key] = field.text
        payload[language][`${field.key}_url`] = field.url
      })
    })

    contactData.forEach((contact: EditableContactField) => {
      Object.keys(contact.values).forEach((languageKey: string) => {
        const language = languageKey as Language
        payload[language][contact.key] = contact.values[language]
      })
    })

    console.log(JSON.stringify(payload))

    try {
      setIsSaveLoading(true)
      const response = await fetch(`${AppSettings.API_URL}main_page/update`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (response.ok && responseData.success) {
        message.success('Данные успешно сохранены')
      } else {
        message.error(
          `Ошибка при сохранении данных: ${responseData.message || 'Неизвестная ошибка'}`
        )
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error)
      message.error('Произошла ошибка при сохранении данных.')
    } finally {
      setIsSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <Row justify="center" style={{ marginTop: 100 }}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </Row>
    )
  }

  return (
    <>
      <Tabs
        activeKey={activeLanguage}
        onChange={(key: string) => setActiveLanguage(key as Language)}
        type="card"
        size="large"
        style={{ marginBottom: 40 }}
      >
        <TabPane tab="ru" key="ru">
          {renderPseudoTable(data.ru, 'ru')}
        </TabPane>
        <TabPane tab="by" key="by">
          {renderPseudoTable(data.by, 'by')}
        </TabPane>
        <TabPane tab="en" key="en">
          {renderPseudoTable(data.en, 'en')}
        </TabPane>
      </Tabs>

      <Card
        style={{
          backgroundColor: '#f1f9ff',
          borderLeft: '5px solid #1890ff',
          padding: '20px',
          marginTop: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
        }}
        onClick={() => handleCopyToClipboard('<br/>')}
        hoverable
      >
        <Typography.Paragraph
          style={{
            fontSize: '16px',
            margin: 0,
            color: '#333',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CopyOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#1890ff' }} />
          <strong>Подсказка:</strong> Если нужно перенести данные на новою строку, используйте тег{' '}
          {<code>{'<br/>'}</code>}. <br />
          <em style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            Нажмите, чтобы скопировать тег.
          </em>
        </Typography.Paragraph>
      </Card>

      {/* <Card
        style={{
          backgroundColor: '#f1f9ff',
          borderLeft: '5px solid #1890ff',
          padding: '20px',
          marginTop: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
        }}
      >
        <Typography.Paragraph
          style={{
            fontSize: '16px',
            margin: 0,
            color: '#333',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CopyOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#1890ff' }} />
          <strong>Подсказка:</strong> Когда все страницы для BY или EN будут переведены и готовы к
          публикации, подключитесь к серверу по SSH. <br />
          <em style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            Выполните команду <code>ssh 192.168.9.2</code> и перейдите в директорию
            <code> /var/www/cms-server/cmd/templates/</code>. <br />
            Откройте файл <code>header.tmp.html</code> и внесите изменения в пути:
          </em>
          <ul style={{ marginLeft: '24px', fontSize: '14px', color: '#666' }}>
            <li>
              Для BY: замените в строке 32 на <code>href="/by"</code>
            </li>
            <li>
              Для EN: замените в строке 37 на <code>href="/en"</code>
            </li>
          </ul>
          <br />
          <em style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            После внесения изменений перейдите на сайте во вкладку <strong>Настройки</strong>,{' '}
            <br />
            затем нажмите сначала <strong>Перегенерировать все страницы</strong>, <br />а затем{' '}
            <strong>Синхронизация файлов</strong>.
          </em>
        </Typography.Paragraph>
      </Card> */}

      <Title level={3} style={{ marginBottom: 20 }}>
        Редактирование политики обработки данных
      </Title>
      {renderFooterFields(
        footerData[activeLanguage],
        activeLanguage,
        (index: number, key: keyof EditableField, value: string) =>
          handleFooterInputChange(activeLanguage, index, key, value)
      )}

      <Title level={3} style={{ marginTop: 40, marginBottom: 20 }}>
        Редактирование контактных данных
      </Title>
      {renderContactFields(contactData, activeLanguage)}

      <Row justify="center" style={{ marginTop: 40 }}>
        <Button icon={<SaveOutlined/>} loading={isSaveLoading} type="primary" size="large" onClick={handleSave}>
          Сохранить изменения
        </Button>
      </Row>

      <Spacer />
    </>
  )
}
