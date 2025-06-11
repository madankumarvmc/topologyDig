import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  Connection, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from 'reactflow';
import { NodeData } from './constants';

interface GraphState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNode: Node<NodeData> | null;
  selectedEdge: Edge | null;
  mode: 'select' | 'connect';
  history: { nodes: Node<NodeData>[]; edges: Edge[] }[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

interface GraphActions {
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node<NodeData>) => void;
  updateNode: (id: string, updates: Partial<Node<NodeData>>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node<NodeData>) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
  setMode: (mode: 'select' | 'connect') => void;
  deleteSelectedElements: () => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useGraphStore = create<GraphState & GraphActions>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  mode: 'select',
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  setNodes: (nodes) => {
    set({ nodes });
    get().saveToHistory();
  },

  setEdges: (edges) => {
    set({ edges });
    get().saveToHistory();
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNode: node,
      selectedEdge: null,
    }));
    get().saveToHistory();
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === id ? { ...node, ...updates } : node
      ),
      selectedNode: state.selectedNode?.id === id 
        ? { ...state.selectedNode, ...updates } 
        : state.selectedNode,
    }));
    get().saveToHistory();
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    }));
    get().saveToHistory();
  },

  duplicateNode: (id) => {
    const { nodes } = get();
    const nodeToDuplicate = nodes.find((node) => node.id === id);
    if (!nodeToDuplicate) return;

    const newNode: Node<NodeData> = {
      ...nodeToDuplicate,
      id: `${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      data: {
        ...nodeToDuplicate.data,
        code: `${nodeToDuplicate.data.code}_copy`,
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNode: newNode,
      selectedEdge: null,
    }));
    get().saveToHistory();
  },

  updateEdge: (id, updates) => {
    set((state) => ({
      edges: state.edges.map((edge) => 
        edge.id === id ? { ...edge, ...updates } : edge
      ),
      selectedEdge: state.selectedEdge?.id === id 
        ? { ...state.selectedEdge, ...updates } 
        : state.selectedEdge,
    }));
    get().saveToHistory();
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      selectedEdge: state.selectedEdge?.id === id ? null : state.selectedEdge,
    }));
    get().saveToHistory();
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge({
        ...connection,
        type: 'custom',
        markerEnd: { type: 'arrowclosed' },
      }, state.edges),
    }));
    get().saveToHistory();
  },

  onNodeClick: (event, node) => {
    event.stopPropagation();
    set({
      selectedNode: node,
      selectedEdge: null,
    });
  },

  onEdgeClick: (event, edge) => {
    event.stopPropagation();
    set({
      selectedEdge: edge,
      selectedNode: null,
    });
  },

  onPaneClick: () => {
    set({
      selectedNode: null,
      selectedEdge: null,
    });
  },

  setMode: (mode) => {
    set({ mode });
  },

  deleteSelectedElements: () => {
    const { selectedNode, selectedEdge } = get();
    if (selectedNode) {
      get().deleteNode(selectedNode.id);
    } else if (selectedEdge) {
      get().deleteEdge(selectedEdge.id);
    }
  },

  saveToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newState = { nodes: [...nodes], edges: [...edges] };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      set({
        nodes: state.nodes,
        edges: state.edges,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        selectedNode: null,
        selectedEdge: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      set({
        nodes: state.nodes,
        edges: state.edges,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1,
        selectedNode: null,
        selectedEdge: null,
      });
    }
  },
}));
