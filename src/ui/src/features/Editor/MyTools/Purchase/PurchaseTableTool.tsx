import { API, BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';
import ReactDOM from 'react-dom/client';
import PurchaseTable from './PurchaseTable';

type Document = {
  key: number;
  name: string;
  url: string;
};

type PurchaseData = {
  key: number;
  title: string;
  startDate: string;
  endDate: string;
  documents: Document[];
};

export interface PurchaseTableBlockData {
  purchases: PurchaseData[];
}

class PurchaseTableTool implements BlockTool {
  data: PurchaseTableBlockData;
  api: API;
  wrapper: HTMLElement;

  constructor({ data, api }: BlockToolConstructorOptions<PurchaseTableBlockData>) {
    this.api = api;
    this.data = data || { purchases: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Purchase Table',
      icon: '<svg width="20" height="20"><path d="M10 20C15.52 20 20 15.52 20 10S15.52 0 10 0 0 4.48 0 10s4.48 10 10 10zm1-17h-2v6l5.25 3.15.75-1.23-4.5-2.67V3z"></path></svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <PurchaseTable
        data={this.data.purchases}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  updateData(updatedData: PurchaseData[]) {
    this.data.purchases = updatedData;
  }

  save() {
    return this.data;
  }

  static render({ data, lang }: { data: PurchaseTableBlockData, lang: string}): string {
    const getLinkDetails = (lang: string): { prefix: string; titles: string[] } => {
      switch (lang) {
        case 'by':
          return { prefix: '/by', titles: ['Назва закупкі', 'Дата размяшчэння закупкі', 'Дата заканчэння падачы прапаноў', 'Дакументы', 'Найменне дакумента']};
        case 'en':
          return { prefix: '/en', titles: ['Procurement Name', 'Date of Procurement Placement', 'Submission Deadline', 'Documents', 'Document name'] };
        default:
          return { prefix: '', titles: ['Наименование закупки', 'Дата размещения закупки', 'Дата окончания подачи предложений', 'Документы', 'Наименование документа'] };
      }
    };
  
    const { prefix: _, titles: linkTitles } = getLinkDetails(lang);

    const rows = data.purchases
      .map(
        purchase => `
      <tr class="table-row">
        <td>
          <div class="purchase-table-title">${purchase.title}</div>
        </td>
        <td>
          <div class="purchase-table-start-date">
            <span>${purchase.startDate}</span>
          </div>
        </td>
        <td>
          <div class="purchase-table-end-date">
            <span>${purchase.endDate}</span>
          </div>
        </td>
        <td>
          <div class="purchase-table-doc-button">
            <button data-selector="${purchase.key}" class="button doc-btn">${linkTitles[3]}</button>
          </div>
        </td>
      </tr>
    `
      )
      .join('')

    return `
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr class="table-head-row">
              <th>${linkTitles[0]}</th>
              <th>${linkTitles[1]}</th>
              <th>${linkTitles[2]}</th>
              <th>${linkTitles[3]}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      ${data.purchases
        .map(
          purchase => `
        <div class="modal" data-selector="${purchase.key}">
          <div class="modal-box">
            <div class="modal-header">
              <h2>${linkTitles[3]}</h2>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path
                    d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z">
                  </path>
                </svg>
              </button>
            </div>
            <div class="modal-content">
              <div class="purchase-docs">
                <header class="purchase-docs-header">
                  <span>${linkTitles[4]}</span><span>${linkTitles[3]}</span>
                </header>
                ${purchase.documents
                  .map(
                    doc => `
                  <div class="purchase-doc-item">
                    <p>${doc.name}</p>
                    <div>
                      <button class="dwnld-btn" onclick="window.open('${doc.url}', '_blank')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                          <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    `
  }
}

export const purchaseRender = (block: { data: PurchaseTableBlockData }, lang: string ) =>
  PurchaseTableTool.render({ data:block.data, lang: lang });

export default PurchaseTableTool;
