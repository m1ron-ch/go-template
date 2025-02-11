import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import VacancyTable from './VacancyTable';

type Vacancy = {
  text: string;
  link?: string;
};

export type VacancyData = {
  header: string;
  vacancies: Vacancy[];
};

class VacancyListTool implements BlockTool {
  data: VacancyData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data && data.vacancies ? data : { header: 'Список вакансий предприятия г. Минск', vacancies: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Vacancy',
      icon: '<svg>...</svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <VacancyTable
        data={this.data.vacancies}
        header={this.data.header}
        onChange={(updatedVacancies: Vacancy[], updatedHeader: string) => this.updateData(updatedVacancies, updatedHeader)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedVacancies: Vacancy[], updatedHeader: string) {
    this.data = {
      header: updatedHeader,
      vacancies: [...updatedVacancies],
    };
  }

  static render({ data, lang }: { data: VacancyData; lang: string }): string {
    const getLinkDetails = (lang: string): { prefix: string; text: string } => {
      switch (lang) {
        case 'by':
          return { prefix: '/by', text: 'Перайсці да вакансіі' };
        case 'en':
          return { prefix: '/en', text: 'Go to vacancy' };
        default:
          return { prefix: '', text: 'Перейти к вакансии' };
      }
    };
  
    const { prefix: linkPrefix, text: linkText } = getLinkDetails(lang);

    const renderVacancyList = (vacancies: Vacancy[]): string =>
      vacancies
        .map(item => {
          const fullLink = item.link ? `${linkPrefix}${item.link}.html` : '#';
  
          return `
            <li class="vacancy-list-item">
              <h3 class="vacancy-list-item-title">${item.text}</h3>
              <a href="${fullLink}" class="vacancy-list-item-link">
                <span>${linkText}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path
                    d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"
                  ></path>
                </svg>
              </a>
            </li>`;
        })
        .join('');
  
    return `
      <div class="vacancy-container">
        <h3 class="vacancy-header">${data.header}</h3>
        <ul class="vacancy-list">
          ${renderVacancyList(data.vacancies)}
        </ul>
      </div>`;
  }
}

export const vacancyRender = (block: { data: VacancyData }, lang: string) =>
  VacancyListTool.render({ data: block.data, lang: lang });

export default VacancyListTool;
