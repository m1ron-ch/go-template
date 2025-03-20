import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import ImageSelectionComponent, { ImageData } from './ImageSelectionComponent';

type ImageBlockData = {
  image: ImageData | null;
};

class ImageSelectionTool implements BlockTool {
  data: ImageBlockData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { image: null };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Image Selection',
      icon: '<svg>...</svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <ImageSelectionComponent
        data={this.data.image}
        onChange={(updatedImage) => this.updateData(updatedImage)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedImage: ImageData | null) {
    this.data.image = updatedImage;
  }

  static render({ data }: { data: ImageBlockData }): string {
    return `<div class="image-block">
      <img src="${data.image?.url}" alt="${data.image?.alt}" />
    </div>`
  }
}

export const imageSelectionRender = ImageSelectionTool.render;

export default ImageSelectionTool;
