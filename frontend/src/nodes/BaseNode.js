import React from "react";

export const BaseNode = ({
  id,
  type,
  title,
  data,
  selected,
  children,
  style = {},
  onContextMenu,
}) => {
  // check lock state
  const isLocked = data?.locked || false;

  return (
    <div
      className={`omoriRoom ${type} ${selected ? "selected" : ""} ${data?.grayscale ? "grayscale" : ""}`}
      style={{ width: 250, position: "relative", ...style }}
      onContextMenu={onContextMenu}
    >
      {/* lock icon */}
      {isLocked && (
        <div
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            background: "var(--ws-white)",
            border: "2px solid var(--ws-black)",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect
              x="3"
              y="7"
              width="10"
              height="7"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M5 7V5a3 3 0 016 0v2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}

      <div className="omoriRoomTitle">
        <span>{title}</span>
        <span className="omoriRoomId">[ID: {id}]</span>
      </div>

      <div>{children}</div>
    </div>
  );
};
