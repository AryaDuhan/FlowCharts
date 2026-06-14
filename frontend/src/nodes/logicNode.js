// logicNode.js

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const LogicNode = ({ id, data, selected }) => {
  const [operator, setOperator] = useState(data?.operator || "AND");
  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleOperatorChange = (e) => {
    setOperator(e.target.value);
    updateNodeField(id, "operator", e.target.value);
  };

  return (
    <BaseNode
      id={id}
      type="logic"
      title="Logic"
      data={data}
      selected={selected}
    >
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-in-1`}
        style={{ top: "33%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-in-2`}
        style={{ top: "66%" }}
      />

      <div className="omoriInputGroup">
        <label>Operator</label>
        <select
          className="omoriInput"
          value={operator}
          onChange={handleOperatorChange}
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
          <option value="XOR">XOR</option>
        </select>
      </div>

      <Handle type="source" position={Position.Right} id={`${id}-output`} />
    </BaseNode>
  );
};
