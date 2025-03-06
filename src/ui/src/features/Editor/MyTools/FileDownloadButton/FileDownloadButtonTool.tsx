import { API, BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';
import ReactDOM from 'react-dom/client';
import FileDownloadButton from './FileDownloadButton';

export type FileDownloadData = {
  fileUrl: string
  fileName: string
}

class FileDownloadButtonTool implements BlockTool {
  data: FileDownloadData;
  api: API;
  wrapper: HTMLElement;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.data = data || { fileUrl: '', fileName: '' };
    this.api = api;
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'File Download Button',
      icon: '<svg width="20" height="20"><path d="M10 20C15.52 20 20 15.52 20 10S15.52 0 10 0 0 4.48 0 10s4.48 10 10 10zm1-17h-2v6l5.25 3.15.75-1.23-4.5-2.67V3z"></path></svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <FileDownloadButton
        initialFileUrl={this.data.fileUrl}
        initialFileName={this.data.fileName}
        onFileSelect={(fileUrl, fileName) => this.updateData(fileUrl, fileName)}
      />
    );
    return this.wrapper;
  }

  updateData(fileUrl: string, fileName: string) {
    this.data.fileUrl = fileUrl;
    this.data.fileName = fileName;
  }

  save() {
    return {
      fileUrl: this.data.fileUrl,
      fileName: this.data.fileName,
    };
  }

  static render({ data, lang }: { data: FileDownloadData; lang: string }): string {
    const getLinkDetails = (lang: string): { prefix: string; download: string, texts: string[] } => {
      switch (lang) {
        case 'by':
          return { prefix: '/by', download: 'Спампаваць анкету', texts: ['Націскаючы кнопку «Спампаваць анкету», вы згаджаецеся з', 'палітыкай апрацоўкі персанальных дадзеных'] };
        case 'en':
          return { prefix: '/en', download: 'Download the questionnaire', texts: ['By clicking the “Download the questionnaire” button, you agree to', 'personal data processing policy'] };
        default:
          return { prefix: '', download: 'Скачать анкету', texts: ['Нажимая кнопку «Скачать анкету», вы соглашаетесь с', 'политикой обработки персональных данных'] };
      }
    };

    const { prefix: linkPrefix, download: linkDownload, texts: linkTexts} = getLinkDetails(lang);

    return `<button id="download-button" onclick="window.open('${data.fileUrl}', '_blank')" class="button">${linkDownload}</button>
      <p class="policy-text" style="margin-top:-30px">${linkTexts[0]} <a href="${linkPrefix}/politics.html" target="_blank" class="policy-link">${linkTexts[1]}</a>.</p>`
  }
}

export const fileDownloadButtonRender = (block: { data: FileDownloadData }, lang: string) =>
  FileDownloadButtonTool.render({ data: block.data, lang: lang });

export default FileDownloadButtonTool;
