import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';

type SpaceData = {
  height: number;
};

const SpaceBlock: React.FC<{
  data: SpaceData;
  onChange: (data: SpaceData) => void;
}> = ({ data, onChange }) => {
  const [height, setHeight] = useState(data.height);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10) || 0;
    setHeight(newHeight);
    onChange({ height: newHeight });
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc' }}>
      <label>
        Height (px):
        <input
          type="number"
          value={height}
          onChange={handleHeightChange}
          style={{ marginLeft: '10px' }}
        />
      </label>
      <div style={{ height: `${height}px`, backgroundColor: '#f0f0f0', marginTop: '10px' }}>
        <p style={{ textAlign: 'center', color: '#aaa' }}>Space: {height}px</p>
      </div>
    </div>
  );
};

class SpaceTool implements BlockTool {
  data: SpaceData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { height: 50 }; 
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Space',
      icon: '<svg>Your SVG icon here</svg>',
    };
  }

  render() {
    ReactDOM.render(
      <SpaceBlock
        data={this.data}
        onChange={(newData) => this.updateData(newData)}
      />,
      this.wrapper
    );
    return this.wrapper;
  }

  save() {
    console.log(this.data);
    return this.data;
  }

  updateData(newData: SpaceData) {
    this.data = newData;
  }

  static render({ data }: { data: SpaceData }) {
    return `<div style="height: ${data.height}px;"></div>`
  }
}

export const spaceRender = SpaceTool.render

export default SpaceTool;
