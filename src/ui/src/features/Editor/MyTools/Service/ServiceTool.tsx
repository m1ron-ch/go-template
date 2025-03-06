import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import ServiceT from './Service';

type Service = {
  key: string;
  title: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
};

export type ServiceData = {
  cards: Service[];
};

class ServiceTool implements BlockTool {
  data: ServiceData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { cards: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Service',
      icon: '<svg>...</svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <ServiceT
        data={this.data.cards}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: Service[]) {
    this.data.cards = updatedData;
  }

  static render({ data, lang }: { data: ServiceData; lang: string }): string {
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
      <div class="history-card-wrapper">
        ${data.cards
          .map(
            card => `
          <div class="history-card">
            <div class="service-card-cover">
              <img src="${card.image}" alt="Фон ${card.title}" />
            </div>
          <div class="history-card-info" style="margin-right: 0px;">
            <div class="history-content" style="margin-left: 0px;">
              <h2 class="preview-card-title" style="margin-bottom: 40px;">${card.title}</h2>
                <div class="history-short-content">
                  <div class="preview-card-description">
                    ${card.shortDescription}
                  </div>
                </div>
                <div class="history-full-content">
                  <div class="preview-card-description">
                      ${
                        card.fullDescription
                          ? `${card.shortDescription} <br/> ${card.fullDescription}`
                          : ''
                      }                           
                  </div>
                </div>
              </div>
              ${
                card.fullDescription
                  ? `<button class="show-more-button">${linkText}</button>`
                  : ''
              }
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `
  }
}

export const serviceRender = (block: { data: ServiceData }, lang: string ) =>
  ServiceTool.render({ data: block.data, lang: lang });

export default ServiceTool;
