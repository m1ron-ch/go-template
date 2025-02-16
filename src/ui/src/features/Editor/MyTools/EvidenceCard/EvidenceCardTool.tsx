import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import EvidenceCardTable from './EvidenceCardTable';

type EvidenceCardData = {
  key: number;
  title: string;
  description: string;
  images: string[];
};

export type EvidenceCardTableData = {
  evidenceCards: EvidenceCardData[];
};

class EvidenceCardTool implements BlockTool {
  data: EvidenceCardTableData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { evidenceCards: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Evidence Card',
      icon: '<svg>...</svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <EvidenceCardTable
        data={this.data.evidenceCards || []}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: EvidenceCardData[]) {
    this.data.evidenceCards = updatedData;
  }

  static render({ data, lang }: { data: EvidenceCardTableData, lang: string }) {
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
  
    const { prefix: _, text: linkText } = getLinkDetails(lang);

    const cards = data.evidenceCards
      .map(card => {
        const images = card.images
          ? card.images
              .map(
                image => `
        <img src="${image}" class="slider-image">
      `
              )
              .join('')
          : ''

        const sliderControls = images
          ? `
        <button class="prev-control controls">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path>
          </svg>
        </button>
        <button class="close-pop-up">&times;</button>
        <button class="next-control controls">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>
          </svg>
        </button>`
          : ''

        return `
        <div class="feature-card">
          <div class="feature-card-info license-info">
            <h3 class="feature-card-title">
            ${card.title}
            </h3>
            ${
              card.description
                ? `<p class="feature-card-description">${card.description}</p>`
                : ``
            }
            <button
              data-select="gos-reg"
              class="show-license-button feature-card-link"
              data-images="${
                card.images ? card.images.map(image => image).join(',') : ''
              }"
            >
            ${linkText}
            </button>
          </div>
          ${
            images
              ? `<div class="pop-up" data-select="gos-reg">${sliderControls}${images}</div>`
              : ''
          }
        </div>
      `
      })
      .join('')

    return `<div class="flex-cards">${cards}</div>`
  }
}

export const evidenceCardRender = (block: { data:EvidenceCardTableData }, lang: string) =>
  EvidenceCardTool.render({ data: block.data, lang: lang });

export default EvidenceCardTool;
