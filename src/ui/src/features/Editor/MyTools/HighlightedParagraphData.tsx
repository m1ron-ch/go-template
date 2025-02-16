import { API, BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Input, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

interface HighlightedParagraphData {
  text: string;
  highlighted: boolean;
}

class HighlightedParagraph implements BlockTool {
  data: HighlightedParagraphData;
  api: API;
  wrapper: HTMLElement;

  constructor({ data, api }: BlockToolConstructorOptions<HighlightedParagraphData>) {
    this.data = data || { text: '', highlighted: false };
    this.api = api;
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Highlighted Paragraph',
      icon: '<svg width="20" height="20"><path d="M10 20C15.52 20 20 15.52 20 10S15.52 0 10 0 0 4.48 0 10s4.48 10 10 10zm1-17h-2v6l5.25 3.15.75-1.23-4.5-2.67V3z"></path></svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(<HighlightedParagraphComponent data={this.data} onChange={(data) => this.data = data} />);
    return this.wrapper;
  }

  save(_: HTMLElement) {
    return this.data;
  }
}

type HighlightedParagraphComponentProps = {
  data: HighlightedParagraphData;
  onChange: (data: HighlightedParagraphData) => void;
};

const HighlightedParagraphComponent: React.FC<HighlightedParagraphComponentProps> = ({ data, onChange }) => {
  const [text, setText] = useState(data.text);
  const [highlighted, setHighlighted] = useState(data.highlighted);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange({ text: newText, highlighted });
  };

  const handleHighlightChange = (e: CheckboxChangeEvent) => {
    const newHighlighted = e.target.checked;
    setHighlighted(newHighlighted);
    onChange({ text, highlighted: newHighlighted });
  };

  return (
    <div style={{ border: highlighted ? '2px solid #1890ff' : 'none', padding: '8px' }}>
      <Input
        value={text}
        onChange={handleTextChange}
        placeholder="Type here..."
        style={{ fontWeight: highlighted ? 'bold' : 'normal' }}
      />
      <Checkbox checked={highlighted} onChange={handleHighlightChange} style={{ marginTop: '8px' }}>
        Highlight
      </Checkbox>
    </div>
  );
};

export default HighlightedParagraph;
