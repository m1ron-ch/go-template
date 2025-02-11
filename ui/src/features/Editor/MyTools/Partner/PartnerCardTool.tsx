import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import PartnerCardTable from './PartnerCardTable';

type PartnerCardData = {
  key: number;
  title: string;
  description: string;
  image: string;
  link: {
    href: string;
    text: string;
  };
};

export type PartnerCardTableData = {
  partnerCards: PartnerCardData[];
};

class PartnerCardTool implements BlockTool {
  data: PartnerCardTableData;
  wrapper: HTMLElement;
  api: API;
  private root: ReactDOM.Root | null = null;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { partnerCards: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Партнеры',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                       10-4.48 10-10S17.52 2 12 2zm-1 17.93
                       c-3.95-.49-7-3.95-7-7.93h2c0 2.76 2.24 5 5 5
                       s5-2.24 5-5-2.24-5-5-5H9c0-3.98 3.05-7.44
                       7-7.93V4h2v2.07c3.95.49 7 3.95 7 7.93h-2
                       c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5
                       5-2.24 5-5h2c0 3.98-3.05 7.44-7 7.93V20h-2v-0.07z"/>
            </svg>`,
    };
  }

  render() {
    this.root = ReactDOM.createRoot(this.wrapper);
    this.root.render(
      <PartnerCardTable
        data={this.data.partnerCards || []}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: PartnerCardData[]) {
    this.data.partnerCards = updatedData;
  }

  static render({ data, lang }: { data: PartnerCardTableData, lang: string }): string {
    const getLinkDetails = (lang: string): { prefix: string; text: string } => {
      switch (lang) {
        case 'by':
          return { prefix: '/by', text: 'Падрабязней' };
        case 'en':
          return { prefix: '/en', text: 'Read More' };
        default:
          return { prefix: '', text: 'Подробнее' };
      }
    };
  
    const { prefix: _, text: linkText } = getLinkDetails(lang);

    const cards = data.partnerCards
      .map(card => {
        return `
          <div class="partner-card">
                <div class="image-block" style="max-width:321px">
                    <img src="${card.image}" alt="Tenit" />
                </div>
                <div class="text-block">
                    <h3>${card.title}</h3>
                    <p class="preview-card-description">
                    ${card.description}
                    </p>
                    <a href="${card.link.href}" target="_blank">${linkText}</a>
                </div>
            </div>
        `;
      })
      .join('');

    return `<div class="partner-cards-container">${cards}</div>`;
  }
}

export const partnerCardRender = (block: { data: PartnerCardTableData }, lang: string) =>
  PartnerCardTool.render({ data:block.data, lang: lang });

export default PartnerCardTool;
