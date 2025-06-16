import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { useGraphStore } from "@/lib/graph-store";
import { NODE_TYPES, EDGE_TYPES } from "@/lib/constants";
import NodeToolbar from "@/components/node-toolbar";
import PropertyModal from "@/components/property-modal";
import ExportModal from "@/components/export-modal";
import LayoutToolbar from "@/components/layout-toolbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Edit,
  Keyboard,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToJSON, importFromJSON } from "@/lib/graph-utils";
import { parseDotGraph } from "@/lib/dot-parser";

export default function GraphEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [warehouseId, setWarehouseId] = useState<string>("");
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
  const { updateNode } = useGraphStore();

  // Handle text box updates
  useEffect(() => {
    const handleUpdateTextNode = (event: CustomEvent) => {
      const { id, text } = event.detail;
      const node = nodes.find((n) => n.id === id);
      if (node) {
        updateNode(id, { data: { ...node.data, text } as any });
      }
    };

    const handleUpdateTextNodeStyle = (event: CustomEvent) => {
      const { id, property, value } = event.detail;
      const node = nodes.find((n) => n.id === id);
      if (node) {
        updateNode(id, {
          data: { ...node.data, [property]: value } as any,
        });
      }
    };

    window.addEventListener(
      "updateTextNode",
      handleUpdateTextNode as EventListener,
    );
    window.addEventListener(
      "updateTextNodeStyle",
      handleUpdateTextNodeStyle as EventListener,
    );

    return () => {
      window.removeEventListener(
        "updateTextNode",
        handleUpdateTextNode as EventListener,
      );
      window.removeEventListener(
        "updateTextNodeStyle",
        handleUpdateTextNodeStyle as EventListener,
      );
    };
  }, [updateNode, nodes]);

  const handleExport = useCallback(() => {
    try {
      const data = exportToJSON(nodes, edges, warehouseId);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = warehouseId 
        ? `warehouse-topology-${warehouseId}.json`
        : `warehouse-topology-${Date.now()}.json`;
      a.download = filename;
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
  }, [nodes, edges, warehouseId, toast]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          const { nodes: importedNodes, edges: importedEdges } =
            await importFromJSON(jsonData);
          setNodes(importedNodes);
          setEdges(importedEdges);
          
          // Set warehouse ID from imported data
          if (jsonData.whId) {
            setWarehouseId(String(jsonData.whId));
          }

          toast({
            title: "Import Successful",
            description: "Graph imported with smart layout applied.",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description:
              "Failed to import graph. Please check the JSON format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges, toast]);

  const handleDotImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".dot,.gv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dotContent = event.target?.result as string;
          const { nodes: importedNodes, edges: importedEdges } =
            parseDotGraph(dotContent);
          setNodes(importedNodes);
          setEdges(importedEdges);

          toast({
            title: "DOT Import Successful",
            description: `Imported ${importedNodes.length} nodes and ${importedEdges.length} edges with hierarchical layout.`,
          });
        } catch (error) {
          toast({
            title: "DOT Import Failed",
            description:
              "Failed to parse DOT file. Please check the file format.",
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
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      if (isCtrl && !isShift && event.key === "c") {
        event.preventDefault();
        copySelectedElements();
      } else if (isCtrl && !isShift && event.key === "v") {
        event.preventDefault();
        pasteElements();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedElements();
      } else if (isCtrl && isShift && event.key === "Z") {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
      } else if (isCtrl && !isShift && event.key === "z") {
        event.preventDefault();
        if (canUndo) {
          undo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    copySelectedElements,
    pasteElements,
    deleteSelectedElements,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <h1 className="text-xl font-semibold text-gray-800">
            2D Graph Editor
          </h1> */}
          <span className="text-[18px] font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Warehouse Topology Designer
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Warehouse ID:
          </label>
          <input
            type="text"
            placeholder="Enter ID"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[140px] bg-white transition-all duration-200"
          />
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
            onClick={() =>
              window.dispatchEvent(new CustomEvent("openPropertyModal"))
            }
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
          {/* <Button className="bg-gray-600 hover:bg-gray-700" variant="outline" size="sm" onClick={handleDotImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import DOT
          </Button> */}
          <Button
            className="bg-gray-600 hover:bg-gray-700"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>

          <Separator orientation="vertical" className="h-6" />
          <Button className="bg-gray-600 hover:bg-gray-700" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          {/* 
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="text-sm space-y-1">
                <div>
                  <strong>Ctrl+C</strong> - Copy selected elements
                </div>
                <div>
                  <strong>Ctrl+V</strong> - Paste elements
                </div>
                <div>
                  <strong>Delete</strong> - Delete selected elements
                </div>
                <div>
                  <strong>Ctrl+Z</strong> - Undo
                </div>
                <div>
                  <strong>Ctrl+Shift+Z</strong> - Redo
                </div>
                <div>
                  <strong>Shift+Click</strong> - Multi-select
                </div>
                <div>
                  <strong>Double-click</strong> - Edit properties
                </div>
              </div>
            </TooltipContent>
          </Tooltip> */}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          {/* Floating Toolbar */}
          <NodeToolbar />
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
            onInit={setReactFlowInstance}
            onDrop={(event) => {
              const reactFlowBounds =
                reactFlowWrapper.current?.getBoundingClientRect();
              const position = reactFlowBounds
                ? {
                    x: event.clientX - reactFlowBounds.left - 75,
                    y: event.clientY - reactFlowBounds.top - 25,
                  }
                : { x: event.clientX - 75, y: event.clientY - 25 };

              const type = event.dataTransfer.getData(
                "application/reactflow",
              ) as any;
              if (type) {
                event.preventDefault();
                import("../lib/graph-utils").then(({ createNewNode }) => {
                  const newNode = createNewNode(type);
                  newNode.position = position;
                  setNodes([...nodes, newNode]);
                });
              }
            }}
            onDragOver={onDragOver}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
            proOptions={{ hideAttribution: true }}
            className="bg-gray-50"
            multiSelectionKeyCode="Shift"
            selectionKeyCode="Shift"
            deleteKeyCode="Delete"
            selectNodesOnDrag={false}
          >
            <Background color="#e0e0e0" gap={20} size={1} />
            <Controls />
          </ReactFlow>

          {/* Auto Layout Toolbar */}
          <LayoutToolbar reactFlowInstance={reactFlowInstance} />
        </div>
      </div>

      <PropertyModal />
      <ExportModal />
    </div>
  );
}
