import { API, InlineTool, InlineToolConstructorOptions } from '@editorjs/editorjs';

class AlignmentTool implements InlineTool {
  static isInline = true;

  button: HTMLButtonElement | null;
  alignments: string[];
  currentAlignment: string;
  api: API;

  constructor({ api }: InlineToolConstructorOptions) {
    this.api = api;

    this.button = null;
    this.alignments = ['left', 'center', 'right', 'justify'];
    this.currentAlignment = 'left';
  }

  static get toolbox() {
    return {
      title: 'Align',
      icon: '<svg width="17" height="17" viewBox="0 0 17 17"><path d="M0 0h17v2H0zM0 5h12v2H0zM0 10h17v2H0zM0 15h12v2H0z"/></svg>',
    };
  }

  render(): HTMLButtonElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = AlignmentTool.toolbox.icon;
    this.button.classList.add(this.api.styles.inlineToolButton);

    this.button.addEventListener('click', this.toggleAlignment.bind(this));

    return this.button;
  }

  toggleAlignment() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const parentElement = range.startContainer.parentElement;

    this.currentAlignment = this.alignments[(this.alignments.indexOf(this.currentAlignment) + 1) % this.alignments.length];
    
    if (parentElement) {
      parentElement.style.textAlign = this.currentAlignment;
    }
  }

  surround(range: Range) {
    const selectedText = range.extractContents();
    const span = document.createElement('span');
    span.appendChild(selectedText);

    span.style.textAlign = this.currentAlignment;

    range.insertNode(span);
    this.api.selection.expandToTag(span);
  }

  get isActive() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    const parentElement = range.startContainer.parentElement;

    return parentElement ? parentElement.style.textAlign !== 'left' : false;
  }

  checkState(selection: Selection) {
    if (!selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    const parentElement = range.startContainer.parentElement;

    if (parentElement && parentElement.style.textAlign) {
      this.currentAlignment = parentElement.style.textAlign;
    } else {
      this.currentAlignment = 'left';
    }

    if (this.button) {
      this.button.classList.toggle(this.api.styles.inlineToolButtonActive, this.isActive);
    }
    return this.isActive;
  }
}

export default AlignmentTool;
