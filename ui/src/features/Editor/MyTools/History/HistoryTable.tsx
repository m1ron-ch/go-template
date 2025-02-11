import React, { useState } from 'react';
import { Input, Checkbox, Button } from 'antd';

interface HistoryBlockData {
  year: string;
  shortDescription: string;
  fullDescription: string;
  additionalDetails: string[];
  showFullDescription: boolean;
}

interface HistoryFormProps {
  data: HistoryBlockData;
  onChange: (data: HistoryBlockData) => void;
}

const HistoryTable: React.FC<HistoryFormProps> = ({ data, onChange }) => {
  const [year, setYear] = useState(data.year || '');
  const [shortDescription, setShortDescription] = useState(data.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(data.fullDescription || '');
  const [additionalDetails, setAdditionalDetails] = useState<string[]>(data.additionalDetails || []);
  const [showFullDescription, setShowFullDescription] = useState(data.showFullDescription || false);

  const handleAddDetail = () => {
    setAdditionalDetails([...additionalDetails, '']);
  };

  const handleDetailChange = (value: string, index: number) => {
    const updatedDetails = [...additionalDetails];
    updatedDetails[index] = value;
    setAdditionalDetails(updatedDetails);
    onChange({
      year,
      shortDescription,
      fullDescription,
      additionalDetails: updatedDetails,
      showFullDescription,
    });
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = additionalDetails.filter((_, i) => i !== index);
    setAdditionalDetails(updatedDetails);
    onChange({
      year,
      shortDescription,
      fullDescription,
      additionalDetails: updatedDetails,
      showFullDescription,
    });
  };

  return (
    <div style={{ padding: '10px' }}>
      <Input
        placeholder="Год"
        value={year}
        onChange={(e) => {
          setYear(e.target.value);
          onChange({ year: e.target.value, shortDescription, fullDescription, additionalDetails, showFullDescription });
        }}
        style={{ marginBottom: '10px' }}
      />

      <Input.TextArea
        placeholder="Краткое описание"
        value={shortDescription}
        rows={2}
        onChange={(e) => {
          setShortDescription(e.target.value);
          onChange({ year, shortDescription: e.target.value, fullDescription, additionalDetails, showFullDescription });
        }}
        style={{ marginBottom: '10px' }}
      />

      <Checkbox
        checked={showFullDescription}
        onChange={(e) => {
          setShowFullDescription(e.target.checked);
          onChange({ year, shortDescription, fullDescription, additionalDetails, showFullDescription: e.target.checked });
        }}
      >
        Показать полное описание
      </Checkbox>

      {showFullDescription && (
        <Input.TextArea
          placeholder="Полное описание"
          value={fullDescription}
          rows={4}
          onChange={(e) => {
            setFullDescription(e.target.value);
            onChange({ year, shortDescription, fullDescription: e.target.value, additionalDetails, showFullDescription });
          }}
          style={{ marginBottom: '10px' }}
        />
      )}

      <div>
        <div>Дополнительные детали:</div>
        {additionalDetails.map((detail, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
            <Input
              value={detail}
              onChange={(e) => handleDetailChange(e.target.value, index)}
              placeholder="Введите деталь"
              style={{ marginRight: '10px' }}
            />
            <Button danger onClick={() => handleRemoveDetail(index)}>
              Удалить
            </Button>
          </div>
        ))}
        <Button type="dashed" onClick={handleAddDetail}>
          Добавить деталь
        </Button>
      </div>
    </div>
  );
};

export default HistoryTable;
