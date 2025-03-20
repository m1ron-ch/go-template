import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';

type TinyMCEEditorModalProps = {
  visible: boolean;
  initialValue: string;
  onSave: (content: string) => void;
  onCancel: () => void;
};

const TinyMCEEditorModal: React.FC<TinyMCEEditorModalProps> = ({ visible, initialValue, onSave, onCancel }) => {
  const [content, setContent] = useState(initialValue);

  // Update content when initialValue or visibility changes
  useEffect(() => {
    if (visible) {
      setContent(initialValue);
    }
  }, [initialValue, visible]);

  const handleEditorChange = (content: string) => {
    setContent(content);
  };

  const handleOk = () => {
    onSave(content);
  };

  return (
    <Modal
      title="Редактирование текста"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={1000}
    >
      <TinyMCEEditor
        value={content}
        onEditorChange={handleEditorChange}
        apiKey='lod7ami5l487v4dicgwuzhv5158yhlafgfowjs00ukavdutq'
        init={{
          menubar: true,
          plugins: [
              'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
              'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
              'media', 'table', 'emoticons', 'help', 'autoresize'
          ],
          toolbar:
            'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | ltr rtl | showcomments addcomment',
          content_style: 'body { font-family:system-ui, Helvetica, Arial, sans-serif; font-size:14px }',
          font_formats:
            'System-UI=system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;' +
            'Arial=arial,helvetica,sans-serif;' +
            'Courier New=courier new,courier,monospace;' +
            'Georgia=georgia,palatino,serif;' +
            'Tahoma=tahoma,arial,helvetica,sans-serif;' +
            'Times New Roman=times new roman,times,serif;' +
            'Verdana=verdana,geneva,sans-serif;' +
            'Poppins=Poppins,sans-serif;',
          quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
          quickbars_insert_toolbar: false,
          image_advtab: true,
          importcss_append: true,
          autoresize_bottom_margin: 20,
          autoresize_min_height: 500,
        }}
      />
    </Modal>
  );
};

export default TinyMCEEditorModal;
