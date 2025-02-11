import { API, BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { Card, List, Modal, Spin } from 'antd';

interface MediaItem {
  upload_date: string;
  filename: string;
  s_url: string;
  url: string;      // Полный URL к картинке
  type: string;     // "image"
}

interface TinyMCEParagraphData {
  text: string;
}
class TinyMCEParagraph implements BlockTool {
  data: TinyMCEParagraphData;
  api: API;
  wrapper: HTMLElement;

  constructor({ data, api }: BlockToolConstructorOptions<TinyMCEParagraphData>) {
    this.data = data || { text: '' };
    this.api = api;
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Text Editor',
      icon: '<svg width="20" height="20"><path d="M10 20C15.52 20 20 15.52 20 10S15.52 0 10 0 0 4.48 0 10s4.48 10 10 10zm1-17h-2v6l5.25 3.15.75-1.23-4.5-2.67V3z"></path></svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(<TinyMCEComponent data={this.data} onChange={(data) => this.data = data} />);
    return this.wrapper;
  }

  save() {
    return this.data;
  }
}

type TinyMCEComponentProps = {
  data: TinyMCEParagraphData;
  onChange: (data: TinyMCEParagraphData) => void;
};

const TinyMCEComponent: React.FC<TinyMCEComponentProps> = ({ data, onChange }) => {
  const [content, setContent] = useState(data.text);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [editorLoading, setEditorLoading] = useState(true);

  // Храним колбэк TinyMCE, чтобы потом вызвать cb(url) при выборе картинки
  const [filePickerCallback, setFilePickerCallback] = useState<
    ((url: string, meta?: { alt?: string }) => void) | null
  >(null);

  // Загружаем список изображений с бэкенда
  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setMediaList(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки списка изображений', error);
    }
    setLoadingMedia(false);
  };

  // При первом открытии модалки грузим список изображений
  useEffect(() => {
    if (isModalOpen) {
      fetchMedia();
    }
  }, [isModalOpen]);

  // Когда пользователь кликает по изображению:
  const handleSelectImage = (url: string) => {
    if (filePickerCallback) {
      // передаём ссылку обратно в TinyMCE
      filePickerCallback(url, { alt: 'Моё описание' });
    }
    setIsModalOpen(false);
  };

  const handleEditorChange = (content: string) => {
    setContent(content);
    onChange({ text: content });
  };

  return (
    <div style={{ padding: 20 }}>
      {editorLoading && <div>Loading...</div>}

      <TinyMCEEditor
        value={content}
        onEditorChange={handleEditorChange}
        apiKey="lod7ami5l487v4dicgwuzhv5158yhlafgfowjs00ukavdutq"
        onInit={() => {
          setEditorLoading(false);
        }}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
            'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
            'media', 'table', 'emoticons', 'help', 'autoresize',
          ],
          toolbar: 'undo redo | bold italic | image | link | ...',

          // 1) Основная магия: при клике "добавить изображение" 
          //    открываем свою модалку, а не стандартный file-picker.
          file_picker_callback: (cb, _, meta) => {
            if (meta.filetype === 'image') {
              // Сохраняем колбэк TinyMCE, чтобы после выбора картинки вернуть туда URL
              setFilePickerCallback(() => cb);
              // Открываем модалку
              setIsModalOpen(true);
            }
          },

          init_instance_callback: () => {
            // Тут ваш код, убираем лоадер
            setEditorLoading(false);
          },

          // // 2) При вставке изображения через drag'n'drop 
          // //    (или кнопку Upload) можно задать images_upload_handler, если нужно
          // images_upload_handler: async (
          //   blobInfo, 
          //   progress, 

          // ) => {
          //   try {
          //     const formData = new FormData();
          //     formData.append('file', blobInfo.blob(), blobInfo.filename());
          
          //     const res = await fetch('/api/upload-image', {
          //       method: 'POST',
          //       body: formData,
          //     });
          
          //     if (!res.ok) {
          //       throw new Error('Ошибка загрузки на сервер');
          //     }
          
          //     const { url } = await res.json();
          //   } catch (err: any) {

          //   }
          // },
        }}
      />

      <Modal
        title="Выберите изображение"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        zIndex={99999}
      >
        {loadingMedia ? (
          <Spin tip="Загрузка изображений..." />
        ) : (
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={mediaList}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={item.filename}
                      src={item.url}  // полная ссылка
                      style={{ objectFit: 'cover', height: 120 }}
                    />
                  }
                  onClick={() => handleSelectImage(item.url)}
                >
                  <Card.Meta
                    title={item.filename}
                    description={item.upload_date}
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default TinyMCEParagraph;