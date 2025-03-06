import { API, BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';
import ReactDOM from 'react-dom/client';
import HistoryTable from './HistoryTable';

export interface HistoryBlockData {
  year: string;
  shortDescription: string;
  fullDescription: string;
  additionalDetails: string[];
  showFullDescription: boolean;
}

class HistoryTool implements BlockTool {
  data: HistoryBlockData;
  api: API;
  wrapper: HTMLElement;

  constructor({ data, api }: BlockToolConstructorOptions<HistoryBlockData>) {
    this.data = data || {
      year: '',
      shortDescription: '',
      fullDescription: '',
      additionalDetails: [],
      showFullDescription: false,
    };
    this.api = api;
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'History Block',
      icon: '<svg width="20" height="20"><path d="M10 20C15.52 20 20 15.52 20 10S15.52 0 10 0 0 4.48 0 10s4.48 10 10 10zm1-17h-2v6l5.25 3.15.75-1.23-4.5-2.67V3z"></path></svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <HistoryTable
        data={this.data}
        onChange={(updatedData) => this.onDataChange(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  onDataChange(updatedData: HistoryBlockData) {
    this.data = updatedData;
  }

  static render({ data, lang }: { data: HistoryBlockData, lang: string }): string {
        const getLinkDetails = (lang: string): { prefix: string; text: string } => {
            switch (lang) {
            case 'by':
                return { prefix: '/by', text: 'Чытаць далей' };
            case 'en':
                return { prefix: '/en', text: 'Read more' };
            default:
                return { prefix: '', text: 'Читать далее' };
            }
        };
        
        const { prefix: _, text: linkText } = getLinkDetails(lang);

        return `
        <div class="history-card">
            <div class="history-card-cover">
            <img src="/images/history_1987.jpg" alt="History Background" />
            <span>${data.year}</span>
            </div>
            <div class="history-card-info">
            <div class="history-content">
                <div class="history-short-content">
                <div class="history-content-description">
                    ${data.shortDescription}
                </div>
                </div>
                ${
                data.showFullDescription
                    ? `<div class="history-full-content">
                        <div class="history-content-description">
                            ${data.fullDescription}
                        </div>
                    </div>`
                    : ''
                }
            </div>
            ${
                data.showFullDescription
                ? `<button class="show-more-button">${linkText}</button>`
                : ''
            }
            </div>
        </div>
        `;
  }
}

export const historyRender = (block: { data: HistoryBlockData }, lang: string) =>
    HistoryTool.render({ data: block.data, lang: lang });

export default HistoryTool;
