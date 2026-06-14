// noteNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const NoteNode = ({ id, data, selected }) => {
  const [note, setNote] = useState(data?.note || '');
  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    updateNodeField(id, 'note', e.target.value);
  };

  return (
    <BaseNode id={id} type="note" title="Note" data={data} selected={selected}>
      <div className="omoriInputGroup">
          <textarea 
            className="omoriInput"
            value={note} 
            onChange={handleNoteChange}
            placeholder="Type a note..."
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        </div>
    </BaseNode>
  );
}
