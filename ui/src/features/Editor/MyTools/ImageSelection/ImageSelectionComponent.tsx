import React, { useState } from 'react'
import { Button, Modal, Upload, List, Spin, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { AppSettings } from '@/shared'

export type ImageData = {
  key: number
  url: string
  alt: string
}

const ImageSelectionComponent: React.FC<{
  data: ImageData | null
  onChange: (data: ImageData | null) => void
}> = ({ data, onChange }) => {
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)
  const [loadingUrls, setLoadingUrls] = useState(false)
  const [urls, setUrls] = useState<{ filename: string; url: string }[]>([])
  const [image, setImage] = useState<ImageData | null>(data)

  const openImageSelectionDialog = async () => {
    setIsImageModalVisible(true)
    setLoadingUrls(true)

    try {
      const response = await fetch(`${AppSettings.API_URL}media`, {
        credentials: 'include',
      })
      const data = await response.json()
      const files = data.data || data
      const filteredData = files.filter((item: { type: string }) => item.type === 'image')
      setUrls(filteredData)
    } catch (error) {
      console.error('Error fetching URLs:', error)
    } finally {
      setLoadingUrls(false)
    }
  }

  const handleUrlSelect = (url: string, filename: string) => {
    const newImage: ImageData = { key: Date.now(), url, alt: filename }
    setImage(newImage)
    onChange(newImage)
    setIsImageModalVisible(false)
  }

  const handleUploadChange = async (info: any) => {
    console.log('Upload event triggered:', info)

    const file = info.file.originFileObj || info.file

    if (!file) {
      console.error('Файл не определен')
      return
    }

    console.log('Uploading file:', file.name)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${AppSettings.API_URL}media/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла')
      }

      const result = await response.json()

      if (result.success) {
        const newImage = {
          key: Date.now(),
          url: result.file.url,
          alt: file.name,
        }
        console.log('Загружено изображение:', newImage)
        message.success('Файл успешно загружен')
      } else {
        throw new Error('Не удалось загрузить изображение')
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error)
      message.error(`Ошибка загрузки файла: ${file.name}`)
    }
  }

  return (
    <div>
      {image ? (
        <div className="image-block">
          <img src={image.url} alt={image.alt} />
          <Button type="dashed" onClick={openImageSelectionDialog} style={{ marginTop: '10px' }}>
            Change Image
          </Button>
        </div>
      ) : (
        <Button type="dashed" onClick={openImageSelectionDialog} style={{ marginBottom: '10px' }}>
          Select Image
        </Button>
      )}
      <Upload
        accept="image/*"
        beforeUpload={file => {
          handleUploadChange({ file })
          return false
        }}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Upload from PC</Button>
      </Upload>

      <Modal
        title="Select Image"
        open={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        width={1200}
      >
        {loadingUrls ? (
          <Spin />
        ) : (
          <List
            grid={{ gutter: 16, column: 6 }}
            bordered
            dataSource={urls}
            renderItem={urlData => (
              <List.Item
                key={urlData.filename}
                onClick={() => handleUrlSelect(urlData.url, urlData.filename)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <img
                    src={urlData.url}
                    alt={urlData.filename}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}
                  />
                  {urlData.filename}
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  )
}

export default ImageSelectionComponent
