// timerNode.js

import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const TimerNode = ({ id, data, selected }) => {
  const [delay, setDelay] = useState(data?.delay || 1000);
  const [ticks, setTicks] = useState(0);
  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleDelayChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setDelay(val);
    updateNodeField(id, "delay", val);
  };

  useEffect(() => {
    if (delay > 0) {
      const interval = setInterval(() => {
        setTicks((t) => t + 1);
      }, delay);
      return () => clearInterval(interval);
    }
  }, [delay]);

  return (
    <BaseNode
      id={id}
      type="timer"
      title="Timer"
      data={data}
      selected={selected}
    >
      <div className="omoriInputGroup">
        <label>Delay (ms)</label>
        <input
          type="number"
          className="omoriInput"
          value={delay}
          onChange={handleDelayChange}
        />
      </div>
      <div
        className="omoriInputGroup"
        style={{ marginTop: "10px", textAlign: "center", fontSize: "1.2em" }}
      >
        <strong>{ticks}</strong> ticks
      </div>
      <Handle type="source" position={Position.Right} id={`${id}-output`} />
    </BaseNode>
  );
};
