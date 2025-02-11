import { BlockToolConstructorOptions } from '@editorjs/editorjs';
import './styles.css';

interface RichTextData {
  text: string;
  fontSize: string;
  backgroundColor: string;
}

class RichTextBlock {
  data: RichTextData;

  constructor({ data = { text: '', fontSize: '16px', backgroundColor: '#ffffff' } }: BlockToolConstructorOptions<RichTextData>) {
    this.data = data;
  }

  static get toolbox() {
    return {
      title: 'Rich Text',
      icon: '<svg width="20" height="20"><path d="M12.6727 1.61162L20.7999 9H17.8267L12 3.70302 6 9.15757V19.0001H11V21.0001H5C4.44772 21.0001 4 20.5524 4 20.0001V11.0001L1 11.0001L11.3273 1.61162C11.7087 1.26488 12.2913 1.26488 12.6727 1.61162Z"></path></svg>',
    };
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('rich-text-block');
    wrapper.style.backgroundColor = this.data.backgroundColor;

    const toolbar = this.createToolbar();
    wrapper.appendChild(toolbar);

    const fontSizeInput = document.createElement('input');
    fontSizeInput.type = 'number';
    fontSizeInput.value = parseInt(this.data.fontSize).toString();
    fontSizeInput.min = '8';
    fontSizeInput.max = '72';
    fontSizeInput.classList.add('font-size-input');
    fontSizeInput.title = 'Font Size';
    fontSizeInput.addEventListener('input', (event) => {
      const newSize = (event.target as HTMLInputElement).value + 'px';
      this.data.fontSize = newSize;
      content.style.fontSize = newSize;
    });
    toolbar.appendChild(fontSizeInput);

    const backgroundColorInput = document.createElement('input');
    backgroundColorInput.type = 'color';
    backgroundColorInput.value = this.data.backgroundColor;
    backgroundColorInput.classList.add('background-color-input');
    backgroundColorInput.title = 'Background Color';
    backgroundColorInput.addEventListener('input', (event) => {
      const newColor = (event.target as HTMLInputElement).value;
      this.data.backgroundColor = newColor;
      wrapper.style.backgroundColor = newColor;
    });
    toolbar.appendChild(backgroundColorInput);

    const content = document.createElement('div');
    content.classList.add('rich-text-content');
    content.contentEditable = 'true';
    content.innerHTML = this.data.text;
    content.style.fontSize = this.data.fontSize;
    content.addEventListener('input', () => {
      this.data.text = content.innerHTML;
    });
    wrapper.appendChild(content);

    return wrapper;
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.classList.add('rich-text-toolbar');

    const buttons = [
      { command: 'bold', icon: 'B', title: 'Bold' },
      { command: 'italic', icon: 'I', title: 'Italic' },
      { command: 'underline', icon: 'U', title: 'Underline' },
      { command: 'backColor', icon: 'BG', title: 'Background Color', value: 'yellow' },
      { command: 'foreColor', icon: 'FC', title: 'Text Color', value: 'red' },
    ];

    buttons.forEach(({ command, icon, title, value }) => {
      const button = document.createElement('button');
      button.innerHTML = icon;
      button.title = title;
      button.addEventListener('click', () => {
        if (command === 'backColor' || command === 'foreColor') {
          document.execCommand(command, false, value);
        } else {
          document.execCommand(command);
        }
      });
      toolbar.appendChild(button);
    });

    return toolbar;
  }

  save(blockContent: HTMLElement) {
    const content = blockContent.querySelector('.rich-text-content') as HTMLElement;
    const fontSize = content.style.fontSize || '16px';
    const backgroundColor = (blockContent.closest('.rich-text-block') as HTMLElement).style.backgroundColor || '#ffffff';

    return {
      text: content.innerHTML,
      fontSize,
      backgroundColor,
    };
  }

  static renderHTML(block: { data: RichTextData }) {
    const data = block.data;
    return `
      <div style="background-color: ${data.backgroundColor}; padding: 10px; border: 1px solid #ccc;">
        <div style="font-size: ${data.fontSize};">
          ${data.text}
        </div>
      </div>
    `;
  }
}

export default RichTextBlock;
