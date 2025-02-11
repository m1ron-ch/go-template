import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import HistoryTimeline from './HistoryTimeline';

type HistoryCardData = {
  key: string;
  year: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
};

export type HistoryTimelineData = {
  cards: HistoryCardData[];
};

class HistoryTimelineTool implements BlockTool {
  data: HistoryTimelineData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { cards: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'History Timeline',
      icon: '<svg>...</svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <HistoryTimeline
        data={this.data.cards}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: HistoryCardData[]) {
    this.data.cards = updatedData;
  }

  static render({ data, lang }: { data: HistoryTimelineData, lang: string }): string {
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
          <div class="history-card-cover">
            <img src="${card.image}" alt="Фон Республика Беларусь" />
            <span>${card.year}</span>
          </div>
          <div class="history-card-info">
            <div class="history-content">
              <div class="history-short-content">
                <div class="history-content-description">
                  ${card.shortDescription}
                </div>
              </div>
              <div class="history-full-content">
                <div class="history-content-description">
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

export const historyTimelineRender = (block: { data: HistoryTimelineData }, lang: string) =>
  HistoryTimelineTool.render({ data: block.data, lang: lang });

export default HistoryTimelineTool;
