// textNode.js

import { useState, useRef, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const TextNode = ({ id, data, selected }) => {
  const [currText, setCurrText] = useState(data?.text || "{{input}}");
  const [dimensions, setDimensions] = useState({ width: 250, height: 60 });
  const spanRef = useRef(null);
  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
    updateNodeField(id, "text", e.target.value);
  };

  useEffect(() => {
    if (spanRef.current) {
      setDimensions({
        width: Math.max(250, spanRef.current.offsetWidth + 60),
        height: Math.max(60, spanRef.current.offsetHeight + 40),
      });
    }
  }, [currText]);

  // Parse variables using regex
  const variables = [
    ...new Set(
      [...currText.matchAll(/{{\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}}/g)].map(
        (m) => m[1],
      ),
    ),
  ];

  return (
    <BaseNode
      id={id}
      type="text"
      title="Text"
      data={data}
      selected={selected}
      style={{ width: dimensions.width }}
    >
      {/* Hidden mirror span to calculate intrinsic width/height */}
      <span
        ref={spanRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: "inherit",
          fontSize: "14px",
          padding: "8px",
          left: -9999,
          top: -9999,
        }}
      >
        {currText || " "}
      </span>

      <div className="omoriInputGroup">
        <label>Text</label>
        <textarea
          className="omoriInput"
          value={currText}
          onChange={handleTextChange}
          style={{
            width: "100%",
            height: `${dimensions.height}px`,
            resize: "none",
            overflow: "hidden",
          }}
        />
      </div>

      {variables.map((v, index) => (
        <Handle
          key={v}
          type="target"
          position={Position.Left}
          id={`${id}-${v}`}
          style={{ top: `${((index + 1) * 100) / (variables.length + 1)}%` }}
        />
      ))}

      <Handle type="source" position={Position.Right} id={`${id}-output`} />
    </BaseNode>
  );
};
