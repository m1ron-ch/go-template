import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import EditorJS, { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';

// Тип данных, который будет сохраняться для блока
type CustomContainerData = {
  blocks: any[];
  className: string;
};

// Компонент для вложенного Editor.js
const CustomContainer: React.FC<{
  data: CustomContainerData;
  onChange: (data: CustomContainerData) => void;
}> = ({ data, onChange }) => {
  const editorRef = useRef<EditorJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = new EditorJS({
        holder: containerRef.current,
        data: {
          blocks: data.blocks,
        },
        onChange: async () => {
          const savedData = await editorRef.current?.save();
          onChange({
            className: data.className,
            blocks: savedData?.blocks || [],
          });
        },
        autofocus: true,
        tools: {
          header: require('@editorjs/header'),
          list: require('@editorjs/list'),
          image: require('@editorjs/image'),
          // Добавьте другие инструменты, которые вам нужны
        },
      });
    }

    return () => {
      editorRef.current?.destroy();
    };
  }, [containerRef, data.className]);

  const handleClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      className: e.target.value,
      blocks: data.blocks,
    });
  };

  return (
    <div>
      <input
        type="text"
        value={data.className}
        onChange={handleClassChange}
        placeholder="Enter class name"
        style={{ marginBottom: '10px', padding: '5px' }}
      />
      <div
        className={data.className}
        ref={containerRef}
        style={{
          padding: '10px',
          border: '1px solid #ccc',
          minHeight: '50px',
        }}
      >
        {/* Вложенный Editor.js будет рендериться здесь */}
      </div>
    </div>
  );
};

// Класс инструмента для Editor.js
class CustomContainerTool implements BlockTool {
  data: CustomContainerData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { blocks: [], className: 'custom-container' };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Container',
      icon: '<svg>Your SVG icon here</svg>', // Иконка для панели инструментов
    };
  }

  render() {
    ReactDOM.render(
      <CustomContainer
        data={this.data}
        onChange={(newData) => this.updateData(newData)}
      />,
      this.wrapper
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(newData: CustomContainerData) {
    this.data = newData;
  }
}

export default CustomContainerTool;
