import React, { useRef, useEffect, useState } from "react";
import { BaseEdge, getSmoothStepPath } from "reactflow";
import { useStore } from "./store";
import handRight from "./assets/images/hand-right.png";
import handLeft from "./assets/images/hand-left.png";
import handUp from "./assets/images/hand-up.png";
import handDown from "./assets/images/hand-down.png";

export const HandEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const theme = useStore((state) => state.theme);
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const pathRef = useRef(null);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();

      const newPoints = [];
      if (length > 30) {
        // src hand
        const dist1 = 15;
        const pt1 = pathRef.current.getPointAtLength(dist1);
        const pt1_next = pathRef.current.getPointAtLength(dist1 + 2);

        // tgt hand
        const dist2 = length - 15;
        const pt2 = pathRef.current.getPointAtLength(dist2);
        const pt2_next = pathRef.current.getPointAtLength(
          Math.min(dist2 + 2, length),
        );

        const getImg = (pt, ptNext) => {
          const dx = ptNext.x - pt.x;
          const dy = ptNext.y - pt.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? handRight : handLeft;
          } else {
            return dy > 0 ? handDown : handUp;
          }
        };

        newPoints.push({ x: pt1.x, y: pt1.y, img: getImg(pt1, pt1_next) });
        newPoints.push({ x: pt2.x, y: pt2.y, img: getImg(pt2, pt2_next) });
      }
      setPoints(newPoints);
    }
  }, [edgePath]); // recalc

  // selection stroke
  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? "#FF5555" : "#4A3C32",
          strokeWidth: selected ? 2 : 1,
          strokeDasharray: "4 4",
          opacity: selected ? 1 : 0.8,
        }}
      />

      <path ref={pathRef} d={edgePath} fill="none" stroke="none" />

      {theme === "omori" &&
        points.map((pt, i) => (
          <image
            key={`stat-${i}`}
            href={pt.img}
            width="16"
            height="16"
            x={pt.x - 8}
            y={pt.y - 8}
            preserveAspectRatio="xMidYMid meet"
            pointerEvents="none"
          />
        ))}
    </>
  );
};
