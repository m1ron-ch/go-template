import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import AchievementCardTable from './AchievementCardTable';

type AchievementCardData = {
  key: number;
  title: string;
  value: string;
  description: string;
  image: string;
};

type AchievementCardTableData = {
  achievementCards: AchievementCardData[];
};

class AchievementCardTool implements BlockTool {
  data: AchievementCardTableData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { achievementCards: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Achievement Card',
      icon: '<svg>...</svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <AchievementCardTable
        data={this.data.achievementCards || []}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: AchievementCardData[]) {
    this.data.achievementCards = updatedData;
  }

  static render({ data }: { data: AchievementCardTableData }) {
    return `${data.achievementCards
      .map(
        card => `
      <div class="preview-card">
        <div class="preview-card-cover">
          <img src="${card.image}" alt="${card.description}" />
        </div>
        <div class="preview-card-info">
          <h2 class="preview-card-title preview-card-title-centered">
            <span>${card.title}</span>
            <span>${card.description}</span>
          </h2>
        </div>
      </div>
    `).join('')}`
  }
}

export const achievementCardRender = AchievementCardTool.render;

export default AchievementCardTool;
