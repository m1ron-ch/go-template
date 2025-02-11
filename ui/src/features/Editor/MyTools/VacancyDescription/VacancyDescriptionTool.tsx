import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import VacancyDescriptionTable from './VacancyDescriptionTable';

type VacancyDescription = {
  key: number;
  text: string;
};

type VacancyData = {
  key: number;
  title?: string;
  descriptions: VacancyDescription[];
};

export type VacancyTableData = {
  vacancies: VacancyData[];
};

class VacancyDescriptionTool implements BlockTool {
  data: VacancyTableData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { vacancies: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Vacancy Description',
      icon: '<svg>...</svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <VacancyDescriptionTable
        data={this.data.vacancies || []}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: VacancyData[]) {
    this.data.vacancies = updatedData;
  }

  static render({ data, lang }: { data: VacancyTableData, lang: string }): string {

    const getLinkDetails = (lang: string): { prefix: string; about: string; description: string } => {
      switch (lang) {
        case 'by':
          return { prefix: '/by', about: 'Аб вакансіі', description: 'Апісанне' };
        case 'en':
          return { prefix: '/en', about: 'About the vacancy', description: 'Go to vacancy' };
        default:
          return { prefix: '', about: 'Описание', description: 'Описание' };
      }
    };
  
    const { prefix: _, description: linkDescription, about: linkAbout } = getLinkDetails(lang);

    const renderVacancyDescription = (vacancies: VacancyData[]): string =>
      vacancies
        .map(vacancy => {
          return `
            <tr class="table-row">
              <td>
                <div class="vacancy-table-row-title">${vacancy.title}</div>
              </td>
              <td>
                <div class="vacancy-table-row-description">
                  <ul>
                    <li>${vacancy.descriptions
                      .map(description => `<p>${description.text}</p>`)
                      .join('')}</li>
                  </ul>
                </div>
              </td>
            </tr>`;
        })
        .join('');

    return `
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr class="table-head-row">
              <th>${linkAbout}</th>
              <th>${linkDescription}</th>
            </tr>
          </thead>
          <tbody>
            ${renderVacancyDescription(data.vacancies)}
          </tbody>
        </table>
      </div>`
  }
}

export const vacancyDescriptionRender = (block: { data: VacancyTableData }, lang: string) =>
  VacancyDescriptionTool.render({ data: block.data, lang: lang });

export default VacancyDescriptionTool;
