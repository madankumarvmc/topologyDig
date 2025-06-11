import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/lib/graph-store";
import { Plus, Link, Type } from "lucide-react";

export default function NodeToolbar() {
  const { mode, setMode, addNode } = useGraphStore();

  const handleAddNode = useCallback(() => {
    // Create a new simple node at center of canvas
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: 400, y: 300 },
      data: {
        code: `node_${Date.now()}`,
        type: 'simple' as const,
        cmd: Math.floor(Math.random() * 1000),
        attrs: {},
      },
    };
    addNode(newNode);
  }, [addNode]);

  const handleConnectMode = useCallback(() => {
    setMode(mode === 'connect' ? 'select' : 'connect');
  }, [mode, setMode]);

  const handleAddTextBox = useCallback(() => {
    // Add text box functionality - cast to any to bypass type checking temporarily
    const textNode = {
      id: `text-${Date.now()}`,
      type: 'textbox',
      position: { x: 350, y: 250 },
      data: {
        text: 'Double-click to edit',
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'left',
        color: '#000000',
        backgroundColor: 'transparent',
        width: 150,
        height: 40,
      },
    } as any;
    addNode(textNode);
  }, [addNode]);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm p-1 space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddNode}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title="Add Node"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button
          variant={mode === 'connect' ? 'default' : 'ghost'}
          size="sm"
          onClick={handleConnectMode}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title="Connect Nodes"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddTextBox}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title="Add Text Box"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
