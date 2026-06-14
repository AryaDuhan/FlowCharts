
import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodeIDs: {},
    nodes: [],
    edges: [],
    canvasLocked: false,
    activeTool: null, // tool state
    isDarkMode: false,
    theme: 'omori',
    drawingColor: '#0D0D0D',
    past: [],
    future: [],
    saveState: () => {
        const { nodes, edges, past } = get();
        const newPast = [...past, { nodes, edges }].slice(-50);
        set({ past: newPast, future: [] });
    },
    undo: () => {
        const { past, future, nodes, edges } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        set({ past: newPast, future: [{ nodes, edges }, ...future], nodes: previous.nodes, edges: previous.edges });
    },
    redo: () => {
        const { past, future, nodes, edges } = get();
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        set({ past: [...past, { nodes, edges }], future: newFuture, nodes: next.nodes, edges: next.edges });
    },
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    setTheme: (theme) => set({ theme }),
    setDrawingColor: (color) => set({ drawingColor: color }),
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    setActiveTool: (tool) => set((state) => ({ activeTool: state.activeTool === tool ? null : tool })),
    deleteSelected: () => {
        get().saveState();
        set({
            nodes: get().nodes.filter(n => !n.selected),
            edges: get().edges.filter(e => !e.selected),
        });
    },
    toggleLock: () => {
        const { nodes, edges } = get();
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
            // toggle global lock
            set({ canvasLocked: !get().canvasLocked });
        } else {
            // toggle locks
            get().saveState();
            const anyUnlocked = [...selectedNodes, ...selectedEdges].some(item => !item.data?.locked);
            const lockState = anyUnlocked;

            set({
                nodes: nodes.map(n => n.selected ? { ...n, draggable: !lockState, data: { ...n.data, locked: lockState } } : n),
                edges: edges.map(e => e.selected ? { ...e, data: { ...e.data, locked: lockState } } : e),
            });
        }
    },
    addNode: (node) => {
        get().saveState();
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      // intercept lock changes
      const filteredChanges = changes.filter(c => {
          if (c.type === 'position') {
              const node = get().nodes.find(n => n.id === c.id);
              if (node && node.data?.locked) return false;
          }
          return true;
      });

      set({
        nodes: applyNodeChanges(filteredChanges, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      get().saveState();
      set({
        edges: addEdge({...connection, type: 'hand', animated: false }, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      get().saveState();
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
  
          return node;
        }),
      });
    },
    clipboard: { nodes: [], edges: [] },
    copySelection: () => {
        const { nodes, edges } = get();
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
            set({ clipboard: { nodes: selectedNodes, edges: selectedEdges } });
        }
    },
    pasteSelection: () => {
        const { clipboard, nodes, edges, getNodeID } = get();
        if (clipboard.nodes.length === 0 && clipboard.edges.length === 0) return;

        get().saveState();

        const idMap = {};
        const newNodes = clipboard.nodes.map(node => {
            const newId = getNodeID(node.type);
            idMap[node.id] = newId;
            return {
                ...node,
                id: newId,
                position: { x: node.position.x + 20, y: node.position.y + 20 },
                selected: true,
            };
        });

        const newEdges = clipboard.edges.map(edge => {
            const newSource = idMap[edge.source] || edge.source;
            const newTarget = idMap[edge.target] || edge.target;
            
            return {
                ...edge,
                id: `reactflow__edge-${newSource}${edge.sourceHandle ? '-' + edge.sourceHandle : ''}-${newTarget}${edge.targetHandle ? '-' + edge.targetHandle : ''}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                source: newSource,
                target: newTarget,
                selected: true,
            };
        });

        const updatedNodes = nodes.map(n => ({ ...n, selected: false })).concat(newNodes);
        const updatedEdges = edges.map(e => ({ ...e, selected: false })).concat(newEdges);

        set({ nodes: updatedNodes, edges: updatedEdges });
    },
    clearAll: () => {
      get().saveState();
      set({ nodes: [], edges: [] });
    },
  }));
