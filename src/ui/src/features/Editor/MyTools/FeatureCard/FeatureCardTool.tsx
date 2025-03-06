import ReactDOM from 'react-dom/client'
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs'
import FeatureCardTable from './FeatureCardTable'

type FeatureCardData = {
  key: number
  title: string
  description: string
  link: string
  image: string
}

export type FeatureCardTableData = {
  featureCards: FeatureCardData[]
}

class FeatureCardTool implements BlockTool {
  data: FeatureCardTableData
  wrapper: HTMLElement
  api: API

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api
    this.data = data || { featureCards: [] }
    this.wrapper = document.createElement('div')
  }

  static get toolbox() {
    return {
      title: 'Feature Card',
      icon: '<svg>...</svg>',
    }
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper)
    root.render(
      <FeatureCardTable
        data={this.data.featureCards || []}
        onChange={updatedData => this.updateData(updatedData)}
      />
    )
    return this.wrapper
  }

  save() {
    return this.data
  }

  updateData(updatedData: FeatureCardData[]) {
    this.data.featureCards = updatedData
  }

  static render({ data, lang }: { data: FeatureCardTableData, lang: string }): string {
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
  
    const { prefix: linkPrefix, text: linkText } = getLinkDetails(lang);

    return `
    <div class="flex-cards">
      ${data.featureCards
        .map(
          card => `
        <div class="feature-card">
          <div class="feature-card-cover">
            <img src="${card.image}" alt="${card.title}" />
          </div>
          <div class="feature-card-info">
            <h2 class="feature-card-title">${card.title}</h2>
            <p class="feature-card-description">
              ${card.description ? card.description : ''}
            </p>
            <a class="feature-card-link" href="${linkPrefix}${card.link}.html">${linkText}</a>
          </div>
        </div>
      `
        )
        .join('')}
    </div>`
  }
}

export const featureCardRender = (block: { data: FeatureCardTableData }, lang: string) =>
  FeatureCardTool.render({ data: block.data, lang: lang });

export default FeatureCardTool
