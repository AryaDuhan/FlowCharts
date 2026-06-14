import React, { useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export const ImagePreviewModal = ({ imgUrls, onClose, onDownload }) => {
  const [crop, setCrop] = useState({ unit: "%", width: 80, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [format, setFormat] = useState("png");
  const imgRef = useRef(null);

  const imgSrc = imgUrls?.png;

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    // Default crop to 90% of the image
    setCrop({
      unit: "%",
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    });
  }, []);

  const handleDownload = async () => {
    if (format === "svg") {
      onDownload(imgUrls.svg, "omori-flowchart.svg");
      return;
    }

    if (!completedCrop || !imgRef.current) {
      // If no crop, just download the original
      onDownload(imgSrc, "omori-flowchart.png");
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );

    const croppedImageUrl = canvas.toDataURL("image/png");
    onDownload(croppedImageUrl, "omori-flowchart.png");
  };

  return ReactDOM.createPortal(
    <div className="omori-modal-overlay" onClick={onClose}>
      <div className="omori-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="omori-modal-header">
          <h3>Preview & Crop Image</h3>
          <button className="omori-close-btn" onClick={onClose}>
            X
          </button>
        </div>

        <div className="omori-crop-container">
          {imgSrc && format === "png" ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Flowchart Preview"
                onLoad={onImageLoad}
                style={{ maxHeight: "60vh", maxWidth: "100%" }}
              />
            </ReactCrop>
          ) : (
            <img
              src={imgUrls?.svg}
              alt="Flowchart SVG Preview"
              style={{
                maxHeight: "60vh",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </div>

        <div className="omori-modal-footer">
          {format === "png" ? (
            <p style={{ fontSize: "0.8rem", color: "var(--ws-gray-dark)" }}>
              Drag to crop the image. It will save exactly as previewed.
            </p>
          ) : (
            <p style={{ fontSize: "0.8rem", color: "var(--ws-gray-dark)" }}>
              SVG captures the entire flowchart perfectly. No cropping needed.
            </p>
          )}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{
                fontFamily: "OMORI_GAME",
                padding: "4px 8px",
                border: "2px solid black",
              }}
            >
              <option value="png">PNG Format</option>
              <option value="svg">SVG Format (Vector)</option>
            </select>
            <button
              className="omoriSubmit"
              onClick={handleDownload}
              style={{ width: "auto" }}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
