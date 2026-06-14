
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
    drawingColor: 'white',
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
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
            const anyUnlocked = [...selectedNodes, ...selectedEdges].some(item => !item.data?.locked);
            const lockState = anyUnlocked;

            set({
                nodes: nodes.map(n => n.selected ? { ...n, draggable: !lockState, data: { ...n.data, locked: lockState } } : n),
                edges: edges.map(e => e.selected ? { ...e, data: { ...e.data, locked: lockState } } : e),
            });
        }
    },
    addNode: (node) => {
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
      set({
        edges: addEdge({...connection, type: 'hand', animated: false }, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
  
          return node;
        }),
      });
    },
    clearAll: () => {
      set({ nodes: [], edges: [] });
    },
  }));
