// mathNode.js

import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const MathNode = ({ id, data, selected }) => {
  const [operation, setOperation] = useState(data?.operation || 'add');
  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    updateNodeField(id, 'operation', e.target.value);
  };

  return (
    <BaseNode id={id} type="math" title="Math" data={data} selected={selected}>
      <Handle type="target" position={Position.Left} id={`${id}-input-1`} style={{top: '33%'}} />
      <Handle type="target" position={Position.Left} id={`${id}-input-2`} style={{top: '66%'}} />
      
      <div className="omoriInputGroup">
          <label>Operation</label>
          <select className="omoriInput" value={operation} onChange={handleOperationChange}>
            <option value="add">Add (+)</option>
            <option value="subtract">Subtract (-)</option>
            <option value="multiply">Multiply (*)</option>
            <option value="divide">Divide (/)</option>
          </select>
        </div>
      
      <Handle type="source" position={Position.Right} id={`${id}-output`} />
    </BaseNode>
  );
}
