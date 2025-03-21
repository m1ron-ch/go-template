import { API, BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { Card, List, Modal, Spin } from 'antd';
import { AppSettings } from '@/shared';

interface MediaItem {
  upload_date: string;
  filename: string;
  s_url: string;
  url: string;      // Full URL to the image
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

  // Store TinyMCE callback to call cb(url) after selecting an image
  const [filePickerCallback, setFilePickerCallback] = useState<
    ((url: string, meta?: { alt?: string }) => void) | null
  >(null);

  // Load the list of images from the backend
  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`${AppSettings.API_URL}/media`);
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setMediaList(data.data);
      }
    } catch (error) {
      console.error('Error loading image list', error);
    }
    setLoadingMedia(false);
  };

  // Load the image list when the modal is opened
  useEffect(() => {
    if (isModalOpen) {
      fetchMedia();
    }
  }, [isModalOpen]);

  // When the user clicks on an image:
  const handleSelectImage = (url: string) => {
    if (filePickerCallback) {
      // Pass the URL back to TinyMCE
      filePickerCallback(url, { alt: 'My description' });
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
          toolbar:
          'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | ltr rtl | showcomments addcomment',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
          quickbars_insert_toolbar: false,
          image_advtab: true,
          importcss_append: true,
          autoresize_bottom_margin: 20,
          autoresize_min_height: 500,

          file_picker_callback: (cb, _, meta) => {
            if (meta.filetype === 'image') {
              setFilePickerCallback(() => cb);
              setIsModalOpen(true);
            }
          },

          init_instance_callback: () => {
            setEditorLoading(false);
          },
        }}
      />

      <Modal
        title="Select an image"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        zIndex={99999}
      >
        {loadingMedia ? (
          <Spin tip="Loading images..." />
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
                      src={item.url}
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
