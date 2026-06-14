// inputNode.js

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { BaseNode } from "./BaseNode";

export const InputNode = ({ id, data, selected }) => {
  const [currName, setCurrName] = useState(
    data?.inputName || id.replace("customInput-", "input_"),
  );
  const [inputType, setInputType] = useState(data.inputType || "Text");

  const handleNameChange = (e) => {
    setCurrName(e.target.value);
  };

  const handleTypeChange = (e) => {
    setInputType(e.target.value);
  };

  return (
    <BaseNode
      id={id}
      type="input"
      title="Input"
      data={data}
      selected={selected}
    >
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
        <select
          className="omoriInput"
          value={inputType}
          onChange={handleTypeChange}
        >
          <option value="Text">Text</option>
          <option value="File">File</option>
        </select>
      </div>
      <Handle type="source" position={Position.Right} id={`${id}-value`} />
    </BaseNode>
  );
};
