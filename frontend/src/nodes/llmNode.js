// llmNode.js

import { Handle, Position } from "reactflow";
import { BaseNode } from "./BaseNode";

export const LLMNode = ({ id, data, selected }) => {
  return (
    <BaseNode id={id} type="llm" title="LLM" data={data} selected={selected}>
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-system`}
        style={{ top: `${100 / 3}%` }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-prompt`}
        style={{ top: `${200 / 3}%` }}
      />
      <div className="omoriInputGroup">
        <span>This is a LLM.</span>
      </div>
      <Handle type="source" position={Position.Right} id={`${id}-response`} />
    </BaseNode>
  );
};
