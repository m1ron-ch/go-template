import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import RekvizitTable from './RekvizitTable';

export type RekvizitData = {
  accountNumber?: string;
  regionalOffice?: string;
  bankName?: string;
  address?: string;
  bic?: string;
  unp?: string;
  okpo?: string;
};

class RekvizitTableTool implements BlockTool {
  data: RekvizitData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || {};
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Rekvizit Table',
      icon: '<svg>...</svg>', // Добавьте SVG иконку сюда
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <RekvizitTable
        data={this.data}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: RekvizitData) {
    this.data = {
      ...this.data,
      ...updatedData
    };

    console.log(this.data);
  }

  static render({ data, lang }: { data: RekvizitData, lang: string }): string {
    const getLinkDetails = (lang: string): { prefix: string; title: string, texts: string[] } => {
      switch (lang) {
        case 'by':
          return { prefix: '/by', title: 'Банкаўскія рэквізіты', texts: ['Р/р', 'УНП', 'АКПА'] };
        case 'en':
          return { prefix: '/en', title: 'Bank details', texts: ['A/C', 'UNP', 'OKPO'] };
        default:
          return { prefix: '', title: 'Банковские реквизиты', texts: ['Р/с', 'УНП', 'ОКПО'] };
      }
    };
  
    const { prefix: _, title: linkTitle, texts: linkTexts } = getLinkDetails(lang);

    return `
      <div class="table-wrapper">
        <table class="table">
          <tbody>
            <tr class="table-row">
              <td>
                <div class="contact-table-title">${linkTitle}</div>
              </td>
              <td>
                <div class="contact-table-info reckvisit-info">
                  ${
                    data.accountNumber
                      ? `<p class="contact-table-info-item">${linkTexts[0]} № ${data.accountNumber}</p>`
                      : ''
                  }
                  ${
                    data.regionalOffice
                      ? `<p class="contact-table-info-item">${data.regionalOffice}</p>`
                      : ''
                  }
                  ${
                    data.bankName
                      ? `<p class="contact-table-info-item">${data.bankName}</p>`
                      : ''
                  }
                  ${
                    data.address
                      ? `<p class="contact-table-info-item">${data.address}</p>`
                      : ''
                  }
                  ${
                    data.bic
                      ? `<p class="contact-table-info-item">BIC: ${data.bic}</p>`
                      : ''
                  }
                  ${
                    data.unp ? `<p class="contact-table-info-item">${linkTexts[1]} ${data.unp}</p>` : ''
                  }
                  ${
                    data.okpo
                      ? `<p class="contact-table-info-item">${linkTexts[2]} ${data.okpo}</p>`
                      : ''
                  }
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  }
}

export const rekvizitRender = (block: { data: RekvizitData }, lang: string) =>
  RekvizitTableTool.render({ data: block.data, lang: lang });

export default RekvizitTableTool;
