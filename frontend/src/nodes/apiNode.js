// apiNode.js

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const APINode = ({ id, data, selected }) => {
  const [endpoint, setEndpoint] = useState(
    data?.endpoint || "https://api.example.com",
  );
  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleEndpointChange = (e) => {
    setEndpoint(e.target.value);
    updateNodeField(id, "endpoint", e.target.value);
  };

  return (
    <BaseNode
      id={id}
      type="api"
      title="Fetch API"
      data={data}
      selected={selected}
    >
      <Handle type="target" position={Position.Left} id={`${id}-trigger`} />

      <div className="omoriInputGroup">
        <label>Endpoint</label>
        <input
          type="text"
          className="omoriInput"
          value={endpoint}
          onChange={handleEndpointChange}
        />
      </div>

      <Handle type="source" position={Position.Right} id={`${id}-response`} />
    </BaseNode>
  );
};
