import { useCallback, useEffect, useMemo } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useReactFlow,
  ReactFlowProvider 
} from "reactflow";
import "reactflow/dist/style.css";

import { useGraphStore } from "@/lib/graph-store";
import { NODE_TYPES, EDGE_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface GraphCanvasProps {
  className?: string;
}

const GraphCanvasContent = ({ className = "" }: GraphCanvasProps) => {
  const {
    nodes,
    edges,
    selectedNode,
    selectedEdge,
    mode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
  } = useGraphStore();

  const { toast } = useToast();
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for our shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault();
            zoomIn();
            break;
          case '-':
            event.preventDefault();
            zoomOut();
            break;
          case '0':
            event.preventDefault();
            fitView({ duration: 200 });
            break;
        }
      }

      // Delete selected elements
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode || selectedEdge) {
          event.preventDefault();
          useGraphStore.getState().deleteSelectedElements();
          toast({
            title: "Deleted",
            description: "Selected element has been deleted.",
          });
        }
      }

      // Escape to clear selection
      if (event.key === 'Escape') {
        useGraphStore.getState().onPaneClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge, fitView, zoomIn, zoomOut, toast]);

  // Custom connection validation
  const isValidConnection = useCallback((connection: any) => {
    // Prevent self-connections
    if (connection.source === connection.target) {
      toast({
        title: "Invalid Connection",
        description: "Cannot connect a node to itself.",
        variant: "destructive",
      });
      return false;
    }

    // Check if connection already exists
    const connectionExists = edges.some(
      edge => edge.source === connection.source && edge.target === connection.target
    );

    if (connectionExists) {
      toast({
        title: "Connection Exists",
        description: "This connection already exists.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [edges, toast]);

  // Enhanced onConnect with validation
  const handleConnect = useCallback((connection: any) => {
    if (isValidConnection(connection)) {
      onConnect(connection);
      toast({
        title: "Connection Created",
        description: "Nodes have been connected successfully.",
      });
    }
  }, [onConnect, isValidConnection, toast]);

  // Minimap node color function
  const getMinimapNodeColor = useCallback((node: any) => {
    switch (node.type) {
      case "custom":
        switch (node.data?.type) {
          case "simple":
            return "hsl(0, 0%, 62%)";
          case "scanner":
            return "hsl(122, 39%, 49%)";
          case "eject":
            return "hsl(28, 100%, 50%)";
          default:
            return "hsl(0, 0%, 62%)";
        }
      default:
        return "hsl(0, 0%, 62%)";
    }
  }, []);

  // React Flow props
  const reactFlowProps = useMemo(() => ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect: handleConnect,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    nodeTypes: NODE_TYPES,
    edgeTypes: EDGE_TYPES,
    fitView: true,
    fitViewOptions: {
      padding: 0.1,
      includeHiddenNodes: false,
    },
    attributionPosition: "bottom-left" as const,
    proOptions: { hideAttribution: true },
    nodesDraggable: true,
    nodesConnectable: mode === 'connect',
    elementsSelectable: true,
    selectNodesOnDrag: false,
    panOnDrag: mode === 'select',
    zoomOnScroll: true,
    zoomOnPinch: true,
    deleteKeyCode: null, // We handle deletion manually
    multiSelectionKeyCode: 'Meta',
    defaultViewport: { x: 0, y: 0, zoom: 1 },
    minZoom: 0.1,
    maxZoom: 2,
  }), [
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    handleConnect,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    mode,
  ]);

  return (
    <div className={`w-full h-full relative ${className}`}>
      <ReactFlow {...reactFlowProps}>
        {/* Grid background with subtle pattern */}
        <Background 
          color="hsl(0, 0%, 88%)" 
          gap={20} 
          size={1}
          variant="dots"
        />
        
        {/* Canvas controls */}
        <Controls 
          className="bg-white border border-gray-300 rounded-lg shadow-sm"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
            duration: 200,
          }}
        />
        
        {/* Minimap for navigation */}
        <MiniMap
          nodeColor={getMinimapNodeColor}
          maskColor="rgba(255, 255, 255, 0.8)"
          className="bg-white border border-gray-300 rounded-lg shadow-sm"
          pannable={true}
          zoomable={true}
          position="bottom-right"
        />
      </ReactFlow>

      {/* Mode indicator */}
      {mode === 'connect' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Connection Mode - Click nodes to connect them</span>
            </div>
          </div>
        </div>
      )}

      {/* Selection indicator */}
      {(selectedNode || selectedEdge) && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2">
            <div className="text-xs text-gray-600">
              {selectedNode && (
                <span>Selected: Node {selectedNode.data.code} ({selectedNode.data.type.toUpperCase()})</span>
              )}
              {selectedEdge && (
                <span>Selected: Edge {selectedEdge.id}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <div className="text-lg font-medium mb-2">Start Building Your Graph</div>
            <div className="text-sm">Add nodes from the toolbar to begin creating your warehouse topology</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasContent {...props} />
    </ReactFlowProvider>
  );
}
