// outputNode.js

import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const OutputNode = ({ id, data, selected }) => {
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data.outputType || 'Text');

  const handleNameChange = (e) => {
    setCurrName(e.target.value);
  };

  const handleTypeChange = (e) => {
    setOutputType(e.target.value);
  };

  return (
    <BaseNode id={id} type="output" title="Output" data={data} selected={selected}>
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-value`}
      />
      <div className="omoriInputGroup">
          <label>Name</label>
          <input 
            type="text" 
            className="omoriInput"
            value={currName} 
            onChange={handleNameChange} 
          />
        </div>
        <div className="omoriInputGroup">
          <label>Type</label>
          <select className="omoriInput" value={outputType} onChange={handleTypeChange}>
            <option value="Text">Text</option>
            <option value="File">Image</option>
          </select>
        </div>
    </BaseNode>
  );
}
