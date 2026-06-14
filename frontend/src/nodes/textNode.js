// textNode.js

import { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const TextNode = ({ id, data, selected }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textAreaRef = useRef(null);

  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [currText]);

  return (
    <BaseNode id={id} type="text" title="Text" data={data} selected={selected}>
      <div className="omoriInputGroup">
          <label>Text</label>
          <input 
            type="text" 
            className="omoriInput"
            value={currText} 
            onChange={handleTextChange} 
          />
        </div>
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
      />
    </BaseNode>
  );
}
