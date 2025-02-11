import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import ProgramListTable from './ProgramListTable';

type ProgramData = {
  key: number;
  text: string;
};

type ProgramListData = {
  programs: ProgramData[];
};

class ProgramListTool implements BlockTool {
  data: ProgramListData;
  wrapper: HTMLElement;
  api: API;
  private root: ReactDOM.Root | null = null;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { programs: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Программы',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M3 4h18v2H3V4zm0 6h18v2H3v-2zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/>
            </svg>`,
    };
  }

  render() {
    this.root = ReactDOM.createRoot(this.wrapper);
    this.root.render(
      <ProgramListTable
        data={this.data.programs || []}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: ProgramData[]) {
    this.data.programs = updatedData;
  }

  static render({ data }: { data: ProgramListData }) {
    const programs = data.programs
      .map(program => {
        return `
            <p class="semi-bold-paragraph programs-paragraph">
                ${program.text}
            </p>
        `;
      })
      .join('');

    return `<div class="page-text-wrapper">${programs}</div>`;
  }
}

export const programListRender = ProgramListTool.render;

export default ProgramListTool;
