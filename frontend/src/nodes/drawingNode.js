import React from 'react';
import { BaseNode } from './BaseNode';

export const DrawingNode = ({ id, type, data, selected }) => {
  const strokeColor = (data.color === '#0D0D0D' || data.color === '#FFFFFF') 
    ? 'var(--ws-black)' 
    : (data.color || 'var(--ws-black)');

  return (
    <div style={{ outline: selected ? '2px dashed var(--ws-black)' : 'none', display: 'flex' }}>
      <svg 
        width={data.width} 
        height={data.height} 
        viewBox={`0 0 ${data.width} ${data.height}`}
        style={{ overflow: 'visible', pointerEvents: 'all' }}
      >
        <rect width="100%" height="100%" fill="transparent" />
        <path 
          d={data.path} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth={data.strokeWidth || 4} 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
};
