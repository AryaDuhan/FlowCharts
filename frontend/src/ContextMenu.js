import React, { useEffect, useRef } from "react";

export const ContextMenu = ({
  id,
  type,
  top,
  left,
  right,
  bottom,
  onCopy,
  onDuplicate,
  onDelete,
  onPaste,
  onClose,
  onToggleGrayscale,
  isGrayscale,
}) => {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top, left, right, bottom }}
      className="omori-context-menu"
      onClick={(e) => e.stopPropagation()}
    >
      {type === "pane" ? (
        <div className="omori-context-menu-item" onClick={onPaste}>
          Paste
        </div>
      ) : type === "selection" ? (
        <>
          <div className="omori-context-menu-item" onClick={onCopy}>
            Copy
          </div>
          {onDuplicate && (
            <div className="omori-context-menu-item" onClick={onDuplicate}>
              Duplicate
            </div>
          )}
          <div className="omori-context-menu-divider"></div>
          <div className="omori-context-menu-item danger" onClick={onDelete}>
            Delete Selection
          </div>
        </>
      ) : (
        <>
          {onToggleGrayscale && (
            <div
              className="omori-context-menu-item"
              onClick={onToggleGrayscale}
            >
              {isGrayscale ? "Revert to Color" : "Black & White"}
            </div>
          )}
          <div className="omori-context-menu-item" onClick={onCopy}>
            Copy
          </div>
          {onDuplicate && (
            <div className="omori-context-menu-item" onClick={onDuplicate}>
              Duplicate
            </div>
          )}
          <div className="omori-context-menu-divider"></div>
          <div className="omori-context-menu-item danger" onClick={onDelete}>
            Delete
          </div>
        </>
      )}
    </div>
  );
};
