import React from 'react';

type SpacerProps = {
  width?: string;
  height?: string;
};

export const Spacer: React.FC<SpacerProps> = ({ width = '0', height = '50px' }) => {
  return (
    <div style={{ width, height, flexShrink: 0 }} />
  );
};