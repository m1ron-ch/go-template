import { BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';

export interface HeaderData {
  text: string;
  level: number;
  alignment?: string;
}

export interface HeaderConfig {
  placeholder?: string;
  levels?: number[];
  defaultLevel?: number;
}

export default class Header implements BlockTool {
  private readOnly: boolean;
  private data: HeaderData;
  private config: HeaderConfig;
  private wrapper: HTMLElement;

  constructor({ data, config, readOnly }: BlockToolConstructorOptions<HeaderData, HeaderConfig>) {
    this.readOnly = readOnly;
    this.data = {
      text: data.text || '',
      level: data.level || 1,
      alignment: data.alignment || 'left',
    };
    this.config = config;
    this.wrapper = this.render();
  }

  render(): HTMLElement {
    const header = document.createElement(`h${this.data.level}`) as HTMLElement;
    header.contentEditable = String(!this.readOnly);
    header.dataset.placeholder = this.config.placeholder || 'Enter a header';
    header.innerHTML = this.data.text;
    header.style.textAlign = this.data.alignment || 'left';

    header.addEventListener('input', (event) => {
      const target = event.target as HTMLElement;
      this.data.text = target.innerHTML;
    });

    header.addEventListener('click', () => {
      this.toggleAlignment();
    });

    return header;
  }

  save(blockContent: HTMLElement): HeaderData {
    return {
      text: blockContent.innerHTML,
      level: parseInt(blockContent.tagName[1], 10),
      alignment: blockContent.style.textAlign || 'left',
    };
  }

  toggleAlignment(): void {
    const alignments = ['left', 'center', 'right', 'justify'];
    const currentAlignment = this.data.alignment || 'left';
    const nextAlignment = alignments[(alignments.indexOf(currentAlignment) + 1) % alignments.length];
    this.data.alignment = nextAlignment;
    (this.wrapper as HTMLElement).style.textAlign = nextAlignment;
  }

  static get toolbox() {
    return {
      title: 'Header',
      icon: '<svg>...</svg>',
    };
  }

  static get sanitize() {
    return {
      text: {},
      level: false,
      alignment: false,
    };
  }

  renderSettings(): HTMLDivElement {
    const settingsContainer = document.createElement('div');
    const levels = [1, 2, 3, 4, 5, 6];

    levels.forEach((level) => {
      const button = document.createElement('button');
      button.innerHTML = `H${level}`;
      button.addEventListener('click', () => {
        this.setLevel(level);
      });

      settingsContainer.appendChild(button);
    });

    return settingsContainer;
  }

  setLevel(level: number): void {
    this.data.level = level;
    const newHeader = document.createElement(`h${level}`) as HTMLElement;
    newHeader.innerHTML = this.wrapper.innerHTML;
    newHeader.contentEditable = String(!this.readOnly);
    newHeader.style.textAlign = this.data.alignment || 'left';

    this.wrapper.replaceWith(newHeader);
    this.wrapper = newHeader;
  }
}
