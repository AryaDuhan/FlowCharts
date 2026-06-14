

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Background, MiniMap, useReactFlow } from 'reactflow';
import { useStore } from './store';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { HandEdge } from './HandEdge';
import { ContextMenu } from './ContextMenu';
import { ImagePreviewModal } from './ImagePreviewModal';
import { ConfirmModal } from './ConfirmModal';
import OmoriDotBackground from './OmoriDotBackground';

// assets
import lightbulbGif from './assets/images/lightbulb.gif';
import mewoGif from './assets/images/mewo.gif';
import sketchbookImg from './assets/images/sketchbook.png';
import laptopGif from './assets/images/laptop.gif';
import tissueboxImg from './assets/images/tissuebox.png';
import door1 from './assets/images/door_1.png';
import door2 from './assets/images/door_2.png';
import door3 from './assets/images/door_3.png';
import door4 from './assets/images/door_4.png';
import door5 from './assets/images/door_5.png';
import door6 from './assets/images/door_6.png';
import meowAudio from './assets/audio/meow.ogg';
import doorCreakAudio from './assets/audio/door_creak.ogg';

import lightLightbulb from './assets/images/light_lightbulb.gif';
import lightMewo from './assets/images/light_mewo.gif';
import lightSketchbook from './assets/images/light_sketchbook.png';
import lightLaptop from './assets/images/light_laptop.gif';
import lightTissuebox from './assets/images/light_tissuebox.png';
import lightDoor1 from './assets/images/light_door_1.png';
import lightDoor2 from './assets/images/light_door_2.png';
import lightDoor3 from './assets/images/light_door_3.png';
import lightDoor4 from './assets/images/light_door_4.png';
import lightDoor5 from './assets/images/light_door_5.png';
import lightDoor6 from './assets/images/light_door_6.png';
import { DrawingNode } from './nodes/drawingNode';
import { DrawingCanvas } from './DrawingCanvas';


import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  drawing: DrawingNode,
};

const edgeTypes = {
  hand: HandEdge,
};

// text effect
const TypingText = ({ text, speed = 50 }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        setDisplayedText("");
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return <span>{displayedText}</span>;
};

// doors

const doorFramesLight = [lightDoor1, lightDoor2, lightDoor3, lightDoor4, lightDoor5, lightDoor6];
const doorFramesDark = [door1, door2, door3, door4, door5, door6];


// box
const WhiteSpaceBox = ({ isDarkMode, onClear, onDownload, onDrawToggle }) => {
    const [doorFrame, setDoorFrame] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMewoHovered, setIsMewoHovered] = useState(false);

    const doorAudioRef = useRef(null);
    const mewoAudioRef = useRef(null);

    // animate door
    const handleDoorClick = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const targetOpen = !isOpen;
        let frame = doorFrame;
        
        let durationMs = 800; // ms
        if (doorAudioRef.current && !isNaN(doorAudioRef.current.duration) && doorAudioRef.current.duration > 0) {
            durationMs = (doorAudioRef.current.duration / 1.5) * 1000;
        }

        if (targetOpen) {
            if (doorAudioRef.current) {
                doorAudioRef.current.currentTime = 0;
                doorAudioRef.current.playbackRate = 1.5;
                doorAudioRef.current.volume = 0.5;
                doorAudioRef.current.play().catch(e => console.error("Door creak failed", e));
            }
        } else {
            // audio
            const playReversed = async () => {
                try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const response = await fetch(doorCreakAudio);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                        audioBuffer.getChannelData(i).reverse();
                    }
                    const source = audioCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.playbackRate.value = 1.5;
                    const gainNode = audioCtx.createGain();
                    gainNode.gain.value = 0.5;
                    source.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    source.start(0);
                } catch (e) {
                    console.error("Reversed audio failed", e);
                }
            };
            playReversed();
        }

        const intervalTime = durationMs / (doorFramesDark.length - 1);
        
        const interval = setInterval(() => {
            if (targetOpen) {
                frame++;
                if (frame >= doorFramesDark.length - 1) {
                    clearInterval(interval);
                    setDoorFrame(doorFramesDark.length - 1);
                    setIsOpen(true);
                    setIsAnimating(false);
                    return;
                }
            } else {
                frame--;
                if (frame <= 0) {
                    clearInterval(interval);
                    setDoorFrame(0);
                    setIsOpen(false);
                    setIsAnimating(false);
                    return;
                }
            }
            setDoorFrame(frame);
        }, intervalTime);
    };

    const handleMewoEnter = () => {
        setIsMewoHovered(true);
        if (mewoAudioRef.current) {
            mewoAudioRef.current.currentTime = 0;
            mewoAudioRef.current.volume = 0.3;
            mewoAudioRef.current.play().catch(e => console.error("Meow failed", e));
        }
    };

    return (
        <div className="whitespace-box">
            <audio ref={doorAudioRef} src={doorCreakAudio} preload="auto" />
            <audio ref={mewoAudioRef} src={meowAudio} preload="auto" />
            <div className="whitespace-content">
                {/* Door at the top center */}
                <img
                    src={(isDarkMode ? doorFramesLight : doorFramesDark)[doorFrame]}
                    alt=""
                    className="ws-icon ws-icon--door"
                    onClick={handleDoorClick}
                    draggable={false}
                />

                {/* Sketchbook — right side */}
                <img
                    src={isDarkMode ? lightSketchbook : sketchbookImg}
                    onClick={onDrawToggle}
                    alt=""
                    className="ws-icon ws-icon--sketchbook"
                    draggable={false}
                />

                {/* Laptop — center-right area */}
                <img
                    src={isDarkMode ? lightLaptop : laptopGif}
                    onClick={onDownload}
                    alt=""
                    className="ws-icon ws-icon--laptop"
                    draggable={false}
                />

                {/* Tissuebox — bottom right */}
                <img
                    src={isDarkMode ? lightTissuebox : tissueboxImg}
                    onClick={onClear}
                    alt=""
                    className="ws-icon ws-icon--tissues"
                    draggable={false}
                />

                {/* MEWO — bottom left */}
                <div 
                    className="ws-icon--cat-container" 
                    onMouseEnter={handleMewoEnter} 
                    onMouseLeave={() => setIsMewoHovered(false)}
                >
                    <img
                        src={isDarkMode ? lightMewo : mewoGif}
                        alt=""
                        className="ws-icon ws-icon--cat"
                        draggable={false}
                    />
                    {isMewoHovered && (
                        <div className="ws-mewo-dialogue">
                            <TypingText text="Waiting for something to happen?" speed={25} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// nav bar
const NavToolbar = ({ handlePreviewDownload, isDarkMode, toggleTheme }) => {
    const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const canvasLocked = useStore((state) => state.canvasLocked);
    const activeTool = useStore((state) => state.activeTool);
    const setActiveTool = useStore((state) => state.setActiveTool);
    const toggleLock = useStore((state) => state.toggleLock);
    const drawingColor = useStore((state) => state.drawingColor);
    const setDrawingColor = useStore((state) => state.setDrawingColor);
    const undo = useStore((state) => state.undo);
    const redo = useStore((state) => state.redo);
    const past = useStore((state) => state.past);
    const future = useStore((state) => state.future);

    useEffect(() => {
        if (isDarkMode && drawingColor === '#0D0D0D') {
            setDrawingColor('#FFFFFF');
        } else if (!isDarkMode && drawingColor === '#FFFFFF') {
            setDrawingColor('#0D0D0D');
        }
    }, [isDarkMode, drawingColor, setDrawingColor]);

    const colors = isDarkMode 
        ? ['#FFFFFF', '#FF5555', '#00CC88', '#C8A4E9', '#FFD5C2'] 
        : ['#0D0D0D', '#FF5555', '#00CC88', '#C8A4E9', '#3D10AD'];

    // lock state
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => e.selected);
    let isLocked = canvasLocked;
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
        isLocked = [...selectedNodes, ...selectedEdges].every(item => item.data?.locked);
    }

    const handleClearAll = () => {
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
            useStore.getState().deleteSelected();
        }
    };

    const handleFitView = () => {
        fitView({ padding: 0.2, duration: 300 });
    };

    const handleResetView = () => {
        setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
    };
    
    return (
        <>
        <div className="omoriNav">
            {/* Tools */}
            <button className={`omoriNavBtn ${activeTool === 'cursor' ? 'active' : ''}`} onClick={() => setActiveTool('cursor')} title="Cursor Tool">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 3L11 10L8 10.5L9.5 13.5L8.5 14L6.5 11L4 12V3Z" stroke="currentColor" strokeWidth="1.2"/></svg>
            </button>
            <div style={{ position: 'relative', display: 'flex' }}>
                <button className={`omoriNavBtn ${activeTool === 'draw' ? 'active' : ''}`} onClick={() => setActiveTool('draw')} title="Draw Tool">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                </button>
                <div className={`color-palette-popup ${activeTool === 'draw' ? 'visible' : ''}`}>
                    {colors.map(color => (
                        <div 
                            key={color}
                            className="color-swatch"
                            onClick={() => setDrawingColor(color)}
                            style={{ 
                                background: color, 
                                border: drawingColor === color ? (color === '#0D0D0D' ? '2px solid #FF5555' : '2px solid var(--ws-black)') : '2px solid transparent',
                                boxShadow: drawingColor === color && color !== '#0D0D0D' ? '0 0 0 1px var(--ws-white)' : 'none'
                            }} 
                        />
                    ))}
                </div>
            </div>
            <button className={`omoriNavBtn ${activeTool === 'select_area' ? 'active' : ''}`} onClick={() => setActiveTool('select_area')} title="Area Select">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2"/></svg>
            </button>
            <button className={`omoriNavBtn ${activeTool === 'erase' ? 'active' : ''}`} onClick={() => setActiveTool('erase')} title="Eraser Tool">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                  <path d="M22 21H7" />
                  <path d="m5 11 9 9" />
                </svg>
            </button>

            <div className="omoriNavDivider" />

            {/* View */}
            <button className="omoriNavBtn" onClick={() => zoomIn({ duration: 200 })} title="Zoom In">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5"/></svg>
            </button>
            <button className="omoriNavBtn" onClick={() => zoomOut({ duration: 200 })} title="Zoom Out">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10" stroke="currentColor" strokeWidth="1.5"/></svg>
            </button>
            <button className="omoriNavBtn" onClick={handleFitView} title="Fit to View">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M5 5h6v6H5z" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" fill="none"/></svg>
            </button>
            <button className="omoriNavBtn" onClick={handleResetView} title="Reset View">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 019.5-1.5M13 8a5 5 0 01-9.5 1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 3v4h-4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
            </button>

            <div className="omoriNavDivider" />

            <button className={`omoriNavBtn ${past.length === 0 ? 'disabled' : ''}`} onClick={undo} title="Undo (Ctrl+Z)" disabled={past.length === 0}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
            </button>
            <button className={`omoriNavBtn ${future.length === 0 ? 'disabled' : ''}`} onClick={redo} title="Redo (Ctrl+Y)" disabled={future.length === 0}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
            </button>

            <div className="omoriNavDivider" />

            <button
                className={`omoriNavBtn ${isLocked ? 'active' : ''}`}
                onClick={toggleLock}
                title={isLocked ? 'Unlock' : 'Lock'}
            >
                {isLocked ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M5 7V5a3 3 0 016 0" stroke="currentColor" strokeWidth="1.5"/></svg>
                )}
            </button>

            <div className="omoriNavDivider" />

            {/* Clear All / Delete Selected */}
            <button className="omoriNavBtn" onClick={handleClearAll} title={selectedNodes.length > 0 || selectedEdges.length > 0 ? "Delete Selected" : "Clear All"}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2m-1 10H6a2 2 0 01-2-2V4h8v8a2 2 0 01-2 2z" stroke="#ff0000" strokeWidth="1.2"/></svg>
            </button>

            <div className="omoriNavDivider" />

            <button className="omoriNavBtn" onClick={handlePreviewDownload} title="Download as Image">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v7M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 13h10" stroke="currentColor" strokeWidth="1.5"/></svg>
            </button>

            <div className="omoriNavDivider" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ws-gray-dark)' }}>
                <span>{nodes.length} NODES</span>
                <span>·</span>
                <span>{edges.length} EDGES</span>
            </div>
        </div>
        </>
    );
};

export const PipelineUI = () => {
    const isDarkMode = useStore(state => state.isDarkMode);
    const toggleTheme = useStore(state => state.toggleTheme);
    const setActiveTool = useStore(state => state.setActiveTool);
    const clearAll = useStore(state => state.clearAll);
    const [previewImage, setPreviewImage] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const { fitView } = useReactFlow();

    useEffect(() => {
        if (isDarkMode) document.body.classList.add('darkMode');
        else document.body.classList.remove('darkMode');
    }, [isDarkMode]);

    const handlePreviewDownload = async () => {
        useStore.setState((state) => ({
            nodes: state.nodes.map(n => ({ ...n, selected: false })),
            edges: state.edges.map(e => ({ ...e, selected: false })),
        }));

        const nav = document.querySelector('.omoriNav');
        const wsBox = document.querySelector('.whitespace-box');
        const cord = document.querySelector('.omoriCord');
        if (nav) nav.style.display = 'none';
        if (wsBox) wsBox.style.display = 'none';
        if (cord) cord.style.display = 'none';

        fitView({ padding: 0.1, duration: 0 });

        const flowEl = document.querySelector('.react-flow');
        if (!flowEl) return;

        setTimeout(async () => {
            try {
                const filterOptions = {
                    filter: (node) => {
                        if (node.classList) {
                            if (node.classList.contains('omoriDotsBg')) return false;
                            if (node.classList.contains('react-flow__minimap')) return false;
                        }
                        return true;
                    }
                };

                const { toPng, toSvg } = await import('html-to-image');

                const pngDataUrl = await toPng(flowEl, {
                    backgroundColor: isDarkMode ? '#0D0D0D' : '#FFFFFF',
                    pixelRatio: 3,
                    ...filterOptions
                });
                const svgDataUrl = await toSvg(flowEl, {
                    backgroundColor: isDarkMode ? '#0D0D0D' : '#FFFFFF',
                    ...filterOptions
                });
                setPreviewImage({ png: pngDataUrl, svg: svgDataUrl });
            } catch(err) {
                console.error("Failed to capture image:", err);
            } finally {
                if (nav) nav.style.display = '';
                if (wsBox) wsBox.style.display = '';
                if (cord) cord.style.display = '';
            }
        }, 100);
    };

    const performDownload = (dataUrl, filename = 'omori-flowchart.png') => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setPreviewImage(null);
    };


    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const getNodeID = useStore((state) => state.getNodeID);
    const addNode = useStore((state) => state.addNode);
    const onNodesChange = useStore((state) => state.onNodesChange);
    const onEdgesChange = useStore((state) => state.onEdgesChange);
    const onConnect = useStore((state) => state.onConnect);
    const activeTool = useStore((state) => state.activeTool);
    const canvasLocked = useStore((state) => state.canvasLocked);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}`, locked: false };
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
          if (canvasLocked) return;
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode, canvasLocked]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onNodeClick = (_, node) => {
        if (activeTool === 'erase' && !node.data?.locked) {
            useStore.setState((state) => ({ nodes: state.nodes.filter(n => n.id !== node.id) }));
        }
    };

    const onEdgeClick = (_, edge) => {
        if (activeTool === 'erase' && !edge.data?.locked) {
            useStore.setState((state) => ({ edges: state.edges.filter(e => e.id !== edge.id) }));
        }
    };

    const onNodeMouseEnter = (event, node) => {
        if (activeTool === 'erase' && !node.data?.locked && event.buttons === 1) {
            useStore.setState((state) => ({ nodes: state.nodes.filter(n => n.id !== node.id) }));
        }
    };

    const onEdgeMouseEnter = (event, edge) => {
        if (activeTool === 'erase' && !edge.data?.locked && event.buttons === 1) {
            useStore.setState((state) => ({ edges: state.edges.filter(e => e.id !== edge.id) }));
        }
    };

    const [menu, setMenu] = useState(null);
    const [clipboard, setClipboard] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
            
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    useStore.getState().undo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey)) {
                    e.preventDefault();
                    useStore.getState().redo();
                } else if (e.key === 'c') {
                    const state = useStore.getState();
                    const selectedNode = state.nodes.find(n => n.selected);
                    if (selectedNode) {
                        setClipboard(selectedNode);
                        console.log('Copied to clipboard:', selectedNode.id);
                    }
                } else if (e.key === 'v') {
                    if (clipboard) {
                        const state = useStore.getState();
                        state.saveState();
                        const newId = state.getNodeID(clipboard.type);
                        const newNode = {
                          ...clipboard,
                          id: newId,
                          selected: false,
                          position: { x: clipboard.position.x + 50, y: clipboard.position.y + 50 },
                          data: { ...clipboard.data, id: newId, locked: false }
                        };
                        state.addNode(newNode);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [clipboard]);

    const onPaneContextMenu = useCallback(
      (event) => {
        event.preventDefault();
        setMenu({
          id: 'pane',
          type: 'pane',
          top: event.clientY,
          left: event.clientX,
        });
      },
      [setMenu],
    );

    const onSelectionContextMenu = useCallback(
      (event, nodes) => {
        event.preventDefault();
        setMenu({
          id: 'selection',
          type: 'selection',
          top: event.clientY,
          left: event.clientX,
        });
      },
      [setMenu],
    );

    const onNodeContextMenu = useCallback(
      (event, node) => {
        event.preventDefault();
        setMenu({
          id: node.id,
          type: 'node',
          top: event.clientY,
          left: event.clientX,
          isTextOrLLM: node.type === 'text' || node.type === 'llm',
          isGrayscale: node.data?.grayscale || false,
        });
      },
      [setMenu]
    );

    const onEdgeContextMenu = useCallback(
      (event, edge) => {
        event.preventDefault();
        setMenu({
          id: edge.id,
          type: 'edge',
          top: event.clientY,
          left: event.clientX,
        });
      },
      [setMenu]
    );

    const handleMenuClose = () => setMenu(null);

    const handleToggleGrayscale = () => {
        if (!menu || menu.type !== 'node') return;
        useStore.getState().updateNodeField(menu.id, 'grayscale', !menu.isGrayscale);
        setMenu(null);
    };

    const handleCopy = () => {
      if (!menu || menu.type !== 'node') return;
      const state = useStore.getState();
      const nodeToCopy = state.nodes.find(n => n.id === menu.id);
      if (nodeToCopy) setClipboard(nodeToCopy);
      setMenu(null);
    };

    const handlePaste = () => {
      if (!clipboard) return;
      const state = useStore.getState();
      state.saveState();
      const newId = state.getNodeID(clipboard.type);
      const newNode = {
        ...clipboard,
        id: newId,
        selected: true,
        position: reactFlowInstance ? reactFlowInstance.project({
            x: menu.left,
            y: menu.top - 60,
        }) : { x: clipboard.position.x + 50, y: clipboard.position.y + 50 },
        data: { ...clipboard.data, id: newId, locked: false }
      };
      state.addNode(newNode);
      setMenu(null);
    };

    const handleDelete = () => {
      if (!menu) return;
      if (menu.type === 'selection') {
          useStore.getState().deleteSelected();
      } else if (menu.type === 'node') {
        useStore.getState().saveState();
        useStore.setState((state) => ({ nodes: state.nodes.filter(n => n.id !== menu.id) }));
      } else {
        useStore.getState().saveState();
        useStore.setState((state) => ({ edges: state.edges.filter(e => e.id !== menu.id) }));
      }
      setMenu(null);
    };

    const handleDuplicate = () => {
      if (!menu || menu.type !== 'node') return;
      const state = useStore.getState();
      const nodeToCopy = state.nodes.find(n => n.id === menu.id);
      if (nodeToCopy) {
        state.saveState();
        const newId = state.getNodeID(nodeToCopy.type);
        const newNode = {
          ...nodeToCopy,
          id: newId,
          selected: false,
          position: { x: nodeToCopy.position.x + 50, y: nodeToCopy.position.y + 50 },
          data: { ...nodeToCopy.data, id: newId, locked: false }
        };
        state.addNode(newNode);
      }
      setMenu(null);
    };

    const isSelectArea = activeTool === 'select_area';

    return (
        <>
        {/* Lightbulb hanging from top */}
        <div className="omoriCord">
            <img src={isDarkMode ? lightLightbulb : lightbulbGif} alt="" className="omoriLightbulb" onClick={toggleTheme} />
        </div>

        {/* Top Right Theme Toggle */}
        <button 
            className="omoriNavBtn" 
            onClick={toggleTheme} 
            style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10 }}
            title="Toggle Theme"
        >
            {isDarkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
        </button>

        {/* White Space box */}
        <WhiteSpaceBox isDarkMode={isDarkMode} onClear={() => setShowConfirm(true)} onDownload={handlePreviewDownload} onDrawToggle={() => setActiveTool("draw")} />

        {showConfirm && (
            <ConfirmModal 
                title="WAIT!"
                message="Are you sure you want to delete everything in White Space?"
                onConfirm={() => {
                    clearAll();
                    setShowConfirm(false);
                }}
                onCancel={() => setShowConfirm(false)}
            />
        )}

        {/* Context Menu */}
        {menu && (
          <ContextMenu
            id={menu.id}
            type={menu.type}
            top={menu.top}
            left={menu.left}
            onClose={handleMenuClose}
            onDelete={handleDelete}
            onDuplicate={menu.type === 'node' ? handleDuplicate : undefined}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onToggleGrayscale={menu.isTextOrLLM ? handleToggleGrayscale : undefined}
            isGrayscale={menu.isGrayscale}
          />
        )}

        {/* Dot background effect */}
        <OmoriDotBackground className="omoriDotsBg" />
        {previewImage && (<ImagePreviewModal imgUrls={previewImage} onDownload={performDownload} onClose={() => setPreviewImage(null)} />)}

        {/* The flowchart canvas */}
        <div ref={reactFlowWrapper} className={activeTool === "erase" ? "erasing" : ""} style={{width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 1}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStart={() => useStore.getState().saveState()}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onNodeMouseEnter={onNodeMouseEnter}
                onEdgeMouseEnter={onEdgeMouseEnter}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                onSelectionContextMenu={onSelectionContextMenu}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                defaultEdgeOptions={{ type: 'hand' }}
                panOnDrag={!isSelectArea && !canvasLocked && activeTool !== 'erase'}
                selectionOnDrag={isSelectArea && !canvasLocked}
                nodesDraggable={!canvasLocked && activeTool !== 'erase'}
                nodesConnectable={!canvasLocked}
                elementsSelectable={!canvasLocked}
                panOnScroll={true}
                zoomOnScroll={!canvasLocked}
                cursor={activeTool === 'erase' ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/%3E%3Cpath d='M22 21H7'/%3E%3Cpath d='m5 11 9 9'/%3E%3C/svg%3E") 0 24, crosshair` : 'default'}
            >
                <Background color="transparent" gap={gridSize} size={0} />
                <MiniMap
                    style={{ border: '2px solid #0D0D0D', borderRadius: '2px' }}
                    nodeColor={() => '#A2A0A0'}
                    position="bottom-left"
                />
                <NavToolbar handlePreviewDownload={handlePreviewDownload} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                <DrawingCanvas />
            </ReactFlow>
        </div>
        </>
    )
}
