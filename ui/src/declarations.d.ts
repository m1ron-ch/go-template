declare module '@editorjs/embed' {
  const Embed: any;
  export default Embed;
}

declare module '@editorjs/image' {
  import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';

  interface ImageConfig {
    endpoints: {
      byFile: string;
      byUrl: string;
    };
    additionalRequestHeaders?: {
      [key: string]: string;
    };
    field?: string;
    types?: string;
    captionPlaceholder?: string;
    buttonContent?: string;
  }

  interface ImageData {
    caption: string;
    withBorder: boolean;
    withBackground: boolean;
    stretched: boolean;
    file: {
      url: string;
    };
  }

  class ImageTool implements BlockTool {
    constructor(config: BlockToolConstructorOptions<ImageData, ImageConfig>);
    save(block: HTMLElement): ImageData;
    render(): HTMLElement;
    validate(savedData: ImageData): boolean;
  }

  export = ImageTool;
}


declare module '@editorjs/table' {
  const Table: any;
  export default Table;
}

declare module '@editorjs/paragraph' {
  const Paragraph: any;
  export default Paragraph;
}

declare module '@editorjs/list' {
  const List: any;
  export default List;
}

declare module '@editorjs/quote' {
  const Quote: any;
  export default Quote;
}

declare module '@editorjs/warning' {
  const Warning: any;
  export default Warning;
}

declare module '@editorjs/code' {
  const Code: any;
  export default Code;
}

declare module '@editorjs/delimiter' {
  const Delimiter: any;
  export default Delimiter;
}

declare module '@editorjs/raw' {
  const Raw: any;
  export default Raw;
}

declare module '@editorjs/checklist' {
  const Checklist: any;
  export default Checklist;
}

declare module '@editorjs/inline-code' {
  const InlineCode: any;
  export default InlineCode;
}

declare module '@editorjs/link' {
  const LinkTool: any;
  export default LinkTool;
}

declare module '@editorjs/marker' {
  const Marker: any;
  export default Marker;
}

declare module '@editorjs/attaches' {
  import { BlockToolConstructorOptions, BlockToolConstructable } from '@editorjs/editorjs';

  interface AttachesConfig {
    endpoint: string;
  }

  class Attaches implements BlockToolConstructable {
    constructor(config: BlockToolConstructorOptions<{}, AttachesConfig>);
  }

  export = Attaches;
}

declare module 'editorjs-paragraph-with-alignment' {
  import { BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';

  export default class Paragraph implements BlockTool {
    constructor({ data, config, api, readOnly }: BlockToolConstructorOptions);
    save(blockContent: HTMLElement): { text: string };
    render(): HTMLElement;
    validate(savedData: { text: string }): boolean;
  }
}

declare module 'editorjs-header-with-alignment' {
  import { BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';

  export default class Header implements BlockTool {
    constructor({ data, config, api, readOnly }: BlockToolConstructorOptions);
    save(blockContent: HTMLElement): { text: string; level: number };
    render(): HTMLElement;
    validate(savedData: { text: string; level: number }): boolean;
  }
}

declare module 'editorjs-button' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

  interface ButtonConfig {
    css: {
      btnColor: string;
      textColor: string;
    };
    settings: [
      {
        name: string;
        value: string;
      }
    ];
  }

  interface ButtonData {
    url: string;
    text: string;
    target: string;
    rel: string;
    btnColor: string;
    textColor: string;
  }

  export default class Button implements BlockTool {
    constructor({ data, config, api, readOnly }: BlockToolConstructorOptions<ButtonData, ButtonConfig>);
    render(): HTMLElement;
    save(blockContent: HTMLElement): ButtonData;
    validate(savedData: ButtonData): boolean;
    renderSettings(): HTMLElement;
  }
}

