import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';
import ReactDOM from 'react-dom/client';
import AboutTable from './AboutTable';

export interface AboutData {
  image?: string;
  title?: string;
  description?: string;
  link?: string;
}

class AboutTool implements BlockTool {
  private data: AboutData;
  private wrapper: HTMLElement;

  constructor({ data }: BlockToolConstructorOptions<AboutData>) {
    this.data = data || {};
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'About Block',
      icon: '<svg width="20" height="20"><path d="..."></path></svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <AboutTable
        data={this.data}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: AboutData) {
    this.data = updatedData;
  }

  static render({ data, lang }: { data: AboutData, lang: string }): string {
        const getLinkDetails = (lang: string): { prefix: string; text: string } => {
            switch (lang) {
            case 'by':
                return { prefix: '/by', text: 'Падрабязней' };
            case 'en':
                return { prefix: '/en', text: 'Read more' };
            default:
                return { prefix: '', text: 'Подробнее' };
            }
        };
        
        const { prefix: linkPrefix, text: linkText } = getLinkDetails(lang);

        const fullLink = data.link ? `${linkPrefix}${data.link}` : '#';
      
        return `
        <div class="preview-card">
            <div class="preview-card-cover">
                <img src="${data.image || ''}" alt="${data.title || ''}">
            </div>
            <div class="preview-card-info">
                <h2 class="preview-card-title">${data.title || ''}</h2>
                <p class="preview-card-description">${data.description || ''}</p>
                <a class="preview-card-link" href="${fullLink}.html">${linkText}</a>
            </div>
        </div>`;
  }
}

export const aboutToolRender = (block: { data: AboutData }, lang: string) =>
    AboutTool.render({ data: block.data, lang: lang });

export default AboutTool;
