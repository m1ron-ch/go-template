import { API, BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';
import ReactDOM from 'react-dom/client';
import SurveyTable from './SurveyTable';

interface SurveyLinkData {
    key: number;
    description: string;
    link: string;
}

export interface SurveyTableBlockData {
  surveys: SurveyLinkData[];
}

class SurveyTableTool implements BlockTool {
  data: SurveyTableBlockData;
  api: API;
  wrapper: HTMLElement;

  constructor({ data, api }: BlockToolConstructorOptions<SurveyTableBlockData>) {
    this.data = data || { surveys: [] };
    this.api = api;
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Survey Table',
      icon: '<svg width="20" height="20"><path d="M10 20C15.52 20 20 15.52 20 10S15.52 0 10 0 0 4.48 0 10s4.48 10 10 10zm1-17h-2v6l5.25 3.15.75-1.23-4.5-2.67V3z"></path></svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <SurveyTable
        data={this.data.surveys}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  updateData(updatedData: SurveyLinkData[]) {
    this.data.surveys = updatedData;
  }

  save() {
    return this.data;
  }

  static render({ data, lang }: { data: SurveyTableBlockData; lang: string }): string {
    const getLinkDetails = (lang: string): { prefix: string; texts: string[] } => {
      switch (lang) {
        case 'by':
          return { prefix: '/by', texts: ['Спампаваць анкету', 'Апісанне анкеты', 'Спасылка на анкету'] };
        case 'en':
          return { prefix: '/en', texts: ['Download the questionnaire', 'Description of the questionnaire', 'Link to the questionnaire'] };
        default:
          return { prefix: '', texts: ['Скачать анкету', 'Описание анкеты', 'Ссылка на анкету'] };
      }
    };
  
    const { prefix: _, texts: linkTexts } = getLinkDetails(lang);

    const rows = data.surveys.map(survey => {
      return `
        <tr class="table-row">
          <td>
            <p class="customer-table-description">
              ${survey.description}
            </p>
          </td>
          <td>
            <div class="customer-table-link-block">
              <span>${linkTexts[0]}</span>
              <a href="${survey.link}" class="customer-table-link" target="_blank">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="currentColor"
                >
                  <path
                    d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"
                  ></path>
                </svg>
              </a>
            </div>
          </td>
        </tr>
      `}).join('')

    return `
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr class="table-head-row">
              <th>${linkTexts[1]}</th>
              <th>${linkTexts[2]}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `
  }
}

export const surveyRender = (block: { data: SurveyTableBlockData }, lang: string) =>
  SurveyTableTool.render({ data: block.data, lang: lang });

export default SurveyTableTool;
