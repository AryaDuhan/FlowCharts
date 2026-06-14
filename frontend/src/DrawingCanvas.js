import React, { useState } from 'react';
import { useStore } from './store';
import { useReactFlow } from 'reactflow';

export const DrawingCanvas = () => {
    const activeTool = useStore(state => state.activeTool);
    const drawingColor = useStore(state => state.drawingColor);
    const addNode = useStore(state => state.addNode);
    const getNodeID = useStore(state => state.getNodeID);
    
    const reactFlowInstance = useReactFlow();
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState([]);

    const isDrawMode = activeTool === 'draw';

    const handlePointerDown = (e) => {
        if (!isDrawMode || e.button !== 0) return;
        e.preventDefault();
        setCurrentPath([{ x: e.clientX, y: e.clientY }]);
        setIsDrawing(true);
    };

    const handlePointerMove = (e) => {
        if (!isDrawing || !isDrawMode) return;
        e.preventDefault();
        setCurrentPath(prev => [...prev, { x: e.clientX, y: e.clientY }]);
    };

    const handlePointerUp = (e) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        
        if (currentPath.length > 1) {
            const flowEl = document.querySelector('.react-flow');
            const reactFlowBounds = flowEl ? flowEl.getBoundingClientRect() : { left: 0, top: 0 };
            
            // flow points
            const flowPoints = currentPath.map(p => reactFlowInstance.project({
                x: p.x - reactFlowBounds.left,
                y: p.y - reactFlowBounds.top
            }));
            
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            flowPoints.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });
            
            const padding = 10;
            const width = Math.max(maxX - minX + padding * 2, 20); // min width
            const height = Math.max(maxY - minY + padding * 2, 20);
            
            const localPath = flowPoints.map((p, i) => {
                const cmd = i === 0 ? 'M' : 'L';
                return `${cmd} ${p.x - minX + padding} ${p.y - minY + padding}`;
            }).join(' ');

            const id = getNodeID('drawing');
            addNode({
                id,
                type: 'drawing',
                position: { x: minX - padding, y: minY - padding },
                style: { background: 'transparent', border: 'none', boxShadow: 'none', width: 'auto', height: 'auto', padding: 0 },
                data: {
                    path: localPath,
                    width,
                    height,
                    color: drawingColor,
                    strokeWidth: 4
                }
            });
        }
        setCurrentPath([]);
    };

    if (!isDrawMode) return null;

    // build svg path
    let pathD = '';
    if (currentPath.length > 0) {
        pathD = currentPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }

    return (
        <div 
            style={{ 
                position: 'absolute', 
                inset: 0, 
                zIndex: 1000, 
                cursor: 'crosshair',
                touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onContextMenu={e => { e.preventDefault(); handlePointerUp(e); }}
        >
            <svg style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                {pathD && (
                    <path 
                        d={pathD} 
                        fill="none" 
                        stroke={drawingColor} 
                        strokeWidth={4} 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                )}
            </svg>
        </div>
    );
};
