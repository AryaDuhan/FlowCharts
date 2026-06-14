// submit.js
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useStore } from "./store";
import sparkleGif from "./assets/images/sparkle.gif";
import shineAudio from "./assets/audio/shine.ogg";

export const SubmitButton = () => {
  const [showSparkle, setShowSparkle] = useState(false);
  const [result, setResult] = useState(null);
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const audioRef = useRef(null);

  const handleClick = async () => {
    if (nodes.length > 0) {
      setShowSparkle(true);
      if (audioRef.current) {
        audioRef.current.volume = 0.2;
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((e) => console.error("Audio play failed:", e));
      }
      setTimeout(() => setShowSparkle(false), 1000);

      try {
        const formData = new FormData();
        formData.append("pipeline", JSON.stringify({ nodes, edges }));

        const response = await fetch("http://localhost:8000/pipelines/parse", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error("Failed to parse pipeline:", error);
        alert("Failed to connect to the backend on port 8000!");
      }
    }
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <audio ref={audioRef} src={shineAudio} preload="auto" />
        <button type="button" className="omoriSubmit" onClick={handleClick}>
          Submit
        </button>
        {showSparkle && (
          <img src={sparkleGif} alt="" className="omoriSparkle" />
        )}
      </div>

      {/* Results Modal */}
      {result &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "var(--ws-white)",
                border: "2px solid var(--ws-black)",
                borderRadius: "var(--radius)",
                width: "280px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                fontFamily: "var(--font-body)",
                color: "var(--ws-black)",
                boxShadow:
                  "inset 0 0 0 2px var(--ws-black), 0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--ws-gray-dark)",
                  marginBottom: "16px",
                }}
              >
                SYSTEM
              </div>
              <div
                style={{
                  fontSize: "18px",
                  lineHeight: "1.6",
                  marginBottom: "24px",
                  textAlign: "left",
                }}
              >
                <strong>Pipeline Analyzed!</strong>
                <br />
                <br />
                Nodes: {result.num_nodes} <br />
                Edges: {result.num_edges} <br />
                Is DAG: {result.is_dag ? "Yes" : "No"}
              </div>
              <button
                onClick={() => setResult(null)}
                style={{
                  background: "var(--ws-black)",
                  color: "var(--ws-white)",
                  border: "2px solid var(--ws-black)",
                  padding: "6px 16px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "16px",
                  alignSelf: "flex-end",
                  borderRadius: "var(--radius)",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "var(--ws-white)";
                  e.target.style.color = "var(--ws-black)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "var(--ws-black)";
                  e.target.style.color = "var(--ws-white)";
                }}
              >
                CLOSE
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
