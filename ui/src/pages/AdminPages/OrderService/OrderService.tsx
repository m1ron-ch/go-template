import React, { useEffect, useState, useRef } from 'react'
import { Button, Form } from 'antd'
import { Editor, EditorHandle } from '@/features/Editor/Editor'
import { AppSettings } from '@/shared'

export const OrderService: React.FC = () => {
  const [form] = Form.useForm()
  const editorRef = useRef<EditorHandle>(null)

  // Состояния для превью и для начального содержимого редактора
  const [renderedHTML, setRenderedHTML] = useState('')
  const [initialEditorContent, setInitialEditorContent] = useState({ blocks: [] })

  // При монтировании делаем запрос к /contact_ud и устанавливаем данные
  useEffect(() => {
    fetch(`${AppSettings.API_URL}/order_service`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then((data: { content: string; json: string | object }) => {
        // Ставим HTML для предпросмотра
        setRenderedHTML(data.content)

        // Если data.json — строка, попробуем её распарсить
        try {
          const parsed =
            typeof data.json === 'string' ? JSON.parse(data.json) : data.json
          setInitialEditorContent(parsed)
        } catch (e) {
          console.error('Ошибка парсинга JSON из ответа:', e)
        }
      })
      .catch(console.error)
  }, [])

  // Функция сохранения. Получаем данные из редактора и отправляем на сервер.
  const handleSave = async () => {
    const data = await editorRef.current?.save()
    if (data) {
      setRenderedHTML(data.html)
      console.log('HTML:', data.html)
      console.log('JSON:', data.json)
  
      const bodyData = JSON.stringify({ content: data.html, json: JSON.stringify(data.json) })
      console.log('Отправляем:', bodyData)
  
      fetch(`${AppSettings.API_URL}/order_service/update`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: bodyData
      })
        .then(res => res.text()) // получаем ответ как текст
        .then(text => {
          if (text) {
            try {
              const response = JSON.parse(text)
              console.log('Данные успешно сохранены', response)
            } catch (e) {
              console.error('Ошибка парсинга ответа:', e)
            }
          } else {
            console.log('Ответ пустой, сохранение прошло успешно')
          }
        })
        .catch(error => {
          console.error('Ошибка при сохранении:', error)
        })
    }
  }

  return (
    <Form form={form} onFinish={() => {}}>
      {/* Рендерим редактор с начальным содержимым, полученным с сервера */}
      <Editor ref={editorRef} initialContent={initialEditorContent} />

      <Button type="primary" style={{ marginTop: 16 }} onClick={handleSave}>
        Сохранить
      </Button>

      {/* Превью полученного HTML */}
      {renderedHTML && (
        <div style={{ marginTop: 16 }}>
          <h3>Предпросмотр:</h3>
          <div
            style={{ padding: '16px' }}
            dangerouslySetInnerHTML={{ __html: renderedHTML }}
          />
        </div>
      )}
    </Form>
  )
}
