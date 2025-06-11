import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  Connection, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  MarkerType
} from 'reactflow';
import { NodeData, NodeType } from './constants';

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
  clipboard: { nodes: Node<NodeData>[]; edges: Edge[] } | null;
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
  onNodeDoubleClick: (event: React.MouseEvent, node: Node<NodeData>) => void;
  onDrop: (event: React.DragEvent, reactFlowInstance?: any) => void;
  onDragOver: (event: React.DragEvent) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeDoubleClick: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
  setMode: (mode: 'select' | 'connect') => void;
  deleteSelectedElements: () => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  autoLayout: (layoutType: 'hierarchical' | 'horizontal', reactFlowInstance?: any) => void;
  copySelectedElements: () => void;
  pasteElements: () => void;
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
  clipboard: null,

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
        markerEnd: { type: MarkerType.ArrowClosed },
        data: {
          distance: 0.5,
          attrs: {},
          default: false,
          capacity: 1,
        },
      }, state.edges),
    }));
    get().saveToHistory();
  },

  onNodeClick: (event, node) => {
    event.stopPropagation();
    // Only select node, don't open modal automatically
    set({
      selectedNode: node,
      selectedEdge: null,
    });
  },

  onNodeDoubleClick: (event, node) => {
    event.stopPropagation();
    // Double-click opens property modal
    set({
      selectedNode: node,
      selectedEdge: null,
    });
    // Trigger property modal opening via custom event
    window.dispatchEvent(new CustomEvent('openPropertyModal'));
  },

  onDragOver: (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  },

  onDrop: (event, reactFlowInstance) => {
    event.preventDefault();
    
    const type = event.dataTransfer.getData('application/reactflow');
    
    if (typeof type === 'undefined' || !type) {
      return;
    }

    let position;
    
    if (reactFlowInstance && reactFlowInstance.screenToFlowPosition) {
      // Use ReactFlow's proper coordinate transformation
      position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      // Offset to center the node on cursor
      position.x -= 75;
      position.y -= 25;
    } else {
      // Fallback to manual calculation
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 25,
      };
    }

    // Import createNewNode dynamically to avoid circular dependencies
    import('../lib/graph-utils').then(({ createNewNode }) => {
      const newNode = createNewNode(type as NodeType);
      newNode.position = position;
      
      set((state) => ({
        nodes: [...state.nodes, newNode],
        selectedNode: newNode,
        selectedEdge: null,
      }));
      get().saveToHistory();
    });
  },

  onEdgeClick: (event, edge) => {
    event.stopPropagation();
    set({
      selectedEdge: edge,
      selectedNode: null,
    });
  },

  onEdgeDoubleClick: (event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    set({
      selectedEdge: edge,
      selectedNode: null,
    });
    window.dispatchEvent(new CustomEvent('openPropertyModal'));
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
    const { nodes, edges } = get();
    
    // Get all selected nodes and edges
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    
    // If no explicit selection, fall back to selectedNode/selectedEdge
    const { selectedNode, selectedEdge } = get();
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      if (selectedNode) selectedNodes.push(selectedNode);
      if (selectedEdge) selectedEdges.push(selectedEdge);
    }
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
    
    const selectedNodeIds = new Set(selectedNodes.map(node => node.id));
    const selectedEdgeIds = new Set(selectedEdges.map(edge => edge.id));
    
    // Remove selected nodes and all edges connected to them
    const newNodes = nodes.filter(node => !selectedNodeIds.has(node.id));
    const newEdges = edges.filter(edge => 
      !selectedEdgeIds.has(edge.id) && 
      !selectedNodeIds.has(edge.source) && 
      !selectedNodeIds.has(edge.target)
    );
    
    set({
      nodes: newNodes,
      edges: newEdges,
      selectedNode: null,
      selectedEdge: null,
    });
    
    get().saveToHistory();
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

  autoLayout: (layoutType: 'hierarchical' | 'horizontal', reactFlowInstance?: any) => {
    const { nodes, edges } = get();
    
    // Import layout utilities dynamically to avoid circular dependencies
    import('../lib/layout-utils').then(({ getHierarchicalLayout, getHorizontalLayout }) => {
      let layoutedElements;
      
      switch (layoutType) {
        case 'hierarchical':
          layoutedElements = getHierarchicalLayout(nodes, edges);
          break;
        case 'horizontal':
          layoutedElements = getHorizontalLayout(nodes, edges);
          break;
        default:
          layoutedElements = getHierarchicalLayout(nodes, edges);
      }
      
      set({ 
        nodes: layoutedElements.nodes,
        edges: layoutedElements.edges,
        selectedNode: null,
        selectedEdge: null,
      });
      
      // Auto-fit view for large graphs after layout
      if (reactFlowInstance && nodes.length > 50) {
        setTimeout(() => {
          reactFlowInstance.fitView({ 
            padding: 0.1,
            minZoom: 0.1,
            maxZoom: 1
          });
        }, 100);
      }
      
      get().saveToHistory();
    });
  },

  copySelectedElements: () => {
    const { nodes, edges } = get();
    
    // Get all selected nodes and edges
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    
    // If no explicit selection, fall back to selectedNode/selectedEdge
    const { selectedNode, selectedEdge } = get();
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      if (selectedNode) selectedNodes.push(selectedNode);
      if (selectedEdge) selectedEdges.push(selectedEdge);
    }
    
    // Also include edges that connect selected nodes
    const selectedNodeIds = new Set(selectedNodes.map(node => node.id));
    const connectedEdges = edges.filter(edge => 
      selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );
    
    // Combine selected edges with connected edges (avoid duplicates)
    const allEdges = [...selectedEdges];
    connectedEdges.forEach(edge => {
      if (!allEdges.find(e => e.id === edge.id)) {
        allEdges.push(edge);
      }
    });
    
    set({ 
      clipboard: { 
        nodes: selectedNodes, 
        edges: allEdges 
      } 
    });
  },

  pasteElements: () => {
    const { clipboard, nodes, edges } = get();
    if (!clipboard || (clipboard.nodes.length === 0 && clipboard.edges.length === 0)) return;
    
    const nodeIdMap = new Map<string, string>();
    const newNodes: Node<NodeData>[] = [];
    const newEdges: Edge[] = [];
    
    // Create new nodes with unique IDs and offset positions
    clipboard.nodes.forEach(node => {
      const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      nodeIdMap.set(node.id, newNodeId);
      
      const newNode: Node<NodeData> = {
        ...node,
        id: newNodeId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50
        },
        selected: false
      };
      newNodes.push(newNode);
    });
    
    // Create new edges with updated node references
    clipboard.edges.forEach(edge => {
      const sourceId = nodeIdMap.get(edge.source) || edge.source;
      const targetId = nodeIdMap.get(edge.target) || edge.target;
      
      // Only create edge if both source and target nodes exist
      if (nodes.find(n => n.id === sourceId) || newNodes.find(n => n.id === sourceId)) {
        if (nodes.find(n => n.id === targetId) || newNodes.find(n => n.id === targetId)) {
          const newEdge: Edge = {
            ...edge,
            id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            source: sourceId,
            target: targetId
          };
          newEdges.push(newEdge);
        }
      }
    });
    
    set({ 
      nodes: [...nodes, ...newNodes],
      edges: [...edges, ...newEdges],
      selectedNode: newNodes[0] || null,
      selectedEdge: newEdges[0] || null
    });
    get().saveToHistory();
  },
}));
