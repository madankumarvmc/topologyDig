import { useCallback, useEffect } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

import { useGraphStore } from "@/lib/graph-store";
import { NODE_TYPES, EDGE_TYPES } from "@/lib/constants";
import NodeToolbar from "@/components/node-toolbar";
import PropertyModal from "@/components/property-modal";
import ExportModal from "@/components/export-modal";
import LayoutToolbar from "@/components/layout-toolbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Undo2, Redo2, Download, Upload, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToJSON, importFromJSON } from "@/lib/graph-utils";

export default function GraphEditor() {
  const {
    nodes,
    edges,
    selectedNode,
    selectedEdge,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeDoubleClick,
    onEdgeClick,
    onEdgeDoubleClick,
    onPaneClick,
    onDrop,
    onDragOver,
    undo,
    redo,
    canUndo,
    canRedo,
    setNodes,
    setEdges,
    deleteSelectedElements,
    copySelectedElements,
    pasteElements,
  } = useGraphStore();

  const { toast } = useToast();

  const handleExport = useCallback(() => {
    try {
      const data = exportToJSON(nodes, edges);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `warehouse-topology-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Graph exported to JSON file successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export graph. Please try again.",
        variant: "destructive",
      });
    }
  }, [nodes, edges, toast]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          const { nodes: importedNodes, edges: importedEdges } = importFromJSON(jsonData);
          setNodes(importedNodes);
          setEdges(importedEdges);
          
          toast({
            title: "Import Successful",
            description: "Graph imported from JSON file successfully.",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Failed to import graph. Please check the JSON format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges, toast]);

  const handleUndo = useCallback(() => {
    undo();
    toast({
      title: "Undo",
      description: "Last action has been undone.",
    });
  }, [undo, toast]);

  const handleRedo = useCallback(() => {
    redo();
    toast({
      title: "Redo",
      description: "Action has been redone.",
    });
  }, [redo, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      if (isCtrl && !isShift && event.key === 'c') {
        event.preventDefault();
        copySelectedElements();
        toast({
          title: "Copied",
          description: "Selected elements copied to clipboard.",
        });
      } else if (isCtrl && !isShift && event.key === 'v') {
        event.preventDefault();
        pasteElements();
        toast({
          title: "Pasted",
          description: "Elements pasted from clipboard.",
        });
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelectedElements();
        toast({
          title: "Deleted",
          description: "Selected elements deleted.",
        });
      } else if (isCtrl && isShift && event.key === 'Z') {
        event.preventDefault();
        if (canRedo) {
          redo();
          toast({
            title: "Redo",
            description: "Action has been redone.",
          });
        }
      } else if (isCtrl && !isShift && event.key === 'z') {
        event.preventDefault();
        if (canUndo) {
          undo();
          toast({
            title: "Undo",
            description: "Last action has been undone.",
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedElements, pasteElements, deleteSelectedElements, undo, redo, canUndo, canRedo, toast]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">2D Graph Editor</h1>
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Warehouse Topology Designer
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('openPropertyModal'))}
            disabled={!selectedNode && !selectedEdge}
            title="Edit Properties (Double-click on element)"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import JSON
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <NodeToolbar />

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeClick={onEdgeClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
            attributionPosition="bottom-left"
            className="bg-gray-50"
          >
            <Background color="#e0e0e0" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case "simple":
                    return "#9e9e9e";
                  case "scanner":
                    return "#4caf50";
                  case "eject":
                    return "#ff9800";
                  default:
                    return "#9e9e9e";
                }
              }}
              maskColor="rgba(255, 255, 255, 0.8)"
              className="bg-white border border-gray-300 rounded-lg"
            />
          </ReactFlow>
          
          {/* Auto Layout Toolbar */}
          <LayoutToolbar />
        </div>


      </div>

      <PropertyModal />
      <ExportModal />
    </div>
  );
}
