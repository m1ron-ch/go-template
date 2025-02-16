import { BlockToolConstructorOptions } from '@editorjs/editorjs';

interface HeaderBlockData {
  text: string;
  alignment: 'left' | 'center' | 'right';
  size: 'small' | 'medium' | 'large';
}

class HeaderBlock {
  data: HeaderBlockData;

  constructor({ data = {} }: BlockToolConstructorOptions<Partial<HeaderBlockData>>) {
    this.data = {
      text: data.text || '',
      alignment: data.alignment || 'left',
      size: data.size || 'medium',
    };
  }

  static get toolbox() {
    return {
      title: 'Header',
      icon: '<svg width="20" height="20"><path d="..."></path></svg>',
    };
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('header-block');
    
    const selectAlignment = document.createElement('select');
    selectAlignment.innerHTML = `
      <option value="left">Left</option>
      <option value="center">Center</option>
      <option value="right">Right</option>
    `;
    selectAlignment.value = this.data.alignment;
    selectAlignment.addEventListener('change', () => {
      this.data.alignment = selectAlignment.value as 'left' | 'center' | 'right';
      headerElement.style.textAlign = this.data.alignment;
    });

    const selectSize = document.createElement('select');
    selectSize.innerHTML = `
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
    `;
    selectSize.value = this.data.size;
    selectSize.addEventListener('change', () => {
      this.data.size = selectSize.value as 'small' | 'medium' | 'large';
      headerElement.style.fontSize = this.getSize();
    });

    const headerElement = document.createElement('h2');
    headerElement.contentEditable = 'true';
    headerElement.textContent = this.data.text;
    headerElement.style.textAlign = this.data.alignment;
    headerElement.style.fontSize = this.getSize();
    headerElement.addEventListener('input', () => {
      this.data.text = headerElement.textContent || '';
    });

    wrapper.appendChild(selectAlignment);
    wrapper.appendChild(selectSize);
    wrapper.appendChild(headerElement);

    return wrapper;
  }

  getSize() {
    switch (this.data.size) {
      case 'small':
        return '16px';
      case 'medium':
        return '24px';
      case 'large':
        return '32px';
      default:
        return '24px';
    }
  }

  save(blockContent: HTMLElement) {
    const text = blockContent.querySelector('h2')?.textContent || '';
    const alignment = this.data.alignment;
    const size = this.data.size;

    return {
      text,
      alignment,
      size,
    };
  }
}

export default HeaderBlock;
