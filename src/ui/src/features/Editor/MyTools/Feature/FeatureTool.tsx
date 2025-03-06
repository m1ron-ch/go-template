import ReactDOM from 'react-dom/client'
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs'
import FeatureTable from './FeatureTable'

type FeatureRowData = {
  key: number
  title: string
  description: string
  richText: string
}

export type FeatureTableData = {
  features: FeatureRowData[]
}

class FeatureTool implements BlockTool {
  data: FeatureTableData
  wrapper: HTMLElement
  api: API

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api
    this.data = data || { features: [] }
    this.wrapper = document.createElement('div')
  }

  static get toolbox() {
    return {
      title: 'Feature Table',
      icon: '<svg>...</svg>',
    }
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper)
    root.render(
      <FeatureTable
        data={this.data.features || []}
        onChange={updatedData => this.updateData(updatedData)}
      />
    )
    return this.wrapper
  }

  save() {
    return this.data
  }

  updateData(updatedData: FeatureRowData[]) {
    this.data.features = updatedData
  }

  static render({ data, lang  }: { data: FeatureTableData, lang: string }): string {
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

    return `
    <div class="table-wrapper">
        <table class="table">
            <tbody>
                ${data.features
                  .map(
                    (feature, index) => `
                <tr class="table-row">
                    <td>
                        <div class="product-table-title">${feature.title}</div>
                    </td>
                    <td>
                        <div class="product-table-info">
                            <p class="product-table-description">${feature.description}</p>
                            ${
                              feature.richText
                                ? `<button id="modal-button-${index}" class="button product-button">${linkText}</button>`
                                : ''
                            }
                        </div>
                    </td>
                </tr>
                ${
                  feature.richText
                    ? `
                <div class="modal" id="modal-${index}">
                    <div class="modal-box">
                        <div class="modal-header">
                            <h2>${feature.title}</h2>
                            <button onclick="closeModal(${index})">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="modal-content">
                            <div class="page-text-wrapper">
                              <span class="custom-list">
                                ${feature.richText}
                              </span>
                            </div>
                        </div>
                    </div>
                </div>
                `
                    : ''
                }
                `
                  )
                  .join('')}
            </tbody>
        </table>
    </div>
    `
  }
}

export const featureRender = (block: {data: FeatureTableData}, lang: string) => 
  FeatureTool.render({ data: block.data, lang: lang });

export default FeatureTool
