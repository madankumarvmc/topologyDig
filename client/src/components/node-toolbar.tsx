import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGraphStore } from "@/lib/graph-store";
import { createNewNode } from "@/lib/graph-utils";
import { NodeType } from "@/lib/constants";
import { MousePointer, ArrowRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NodeToolbar() {
  const { addNode, selectedNode, selectedEdge, deleteSelectedElements, setMode, mode } = useGraphStore();
  const { toast } = useToast();

  const handleCreateNode = useCallback((type: NodeType) => {
    const node = createNewNode(type);
    addNode(node);
    toast({
      title: "Node Created",
      description: `${type.toUpperCase()} node has been added to the canvas.`,
    });
  }, [addNode, toast]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode || selectedEdge) {
      deleteSelectedElements();
      toast({
        title: "Deleted",
        description: "Selected element has been deleted.",
      });
    }
  }, [selectedNode, selectedEdge, deleteSelectedElements, toast]);

  const handleModeChange = useCallback((newMode: 'select' | 'connect') => {
    setMode(newMode);
    toast({
      title: "Mode Changed",
      description: `Switched to ${newMode} mode.`,
    });
  }, [setMode, toast]);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-medium text-gray-800 mb-3">Add Nodes</h2>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3 hover:border-gray-400 hover:bg-gray-50"
            onClick={() => handleCreateNode('simple')}
          >
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-400 mr-3"></div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-800">SIMPLE</div>
              <div className="text-xs text-gray-600">Basic node</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3 hover:border-green-400 hover:bg-green-50"
            onClick={() => handleCreateNode('scanner')}
          >
            <div className="w-6 h-6 bg-green-100 border-2 border-green-400 mr-3 transform rotate-45"></div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-800">SCANNER</div>
              <div className="text-xs text-gray-600">Scanner node</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3 hover:border-orange-400 hover:bg-orange-50"
            onClick={() => handleCreateNode('eject')}
          >
            <div className="w-6 h-6 bg-orange-100 border-2 border-orange-400 rounded mr-3"></div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-800">EJECT</div>
              <div className="text-xs text-gray-600">Eject node</div>
            </div>
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-800 mb-3">Tools</h3>
        <div className="space-y-2">
          <Button
            variant={mode === 'connect' ? 'default' : 'ghost'}
            className="w-full justify-start text-sm"
            onClick={() => handleModeChange('connect')}
          >
            <ArrowRight className="h-4 w-4 mr-3" />
            Connect Nodes
          </Button>
          <Button
            variant={mode === 'select' ? 'default' : 'ghost'}
            className="w-full justify-start text-sm"
            onClick={() => handleModeChange('select')}
          >
            <MousePointer className="h-4 w-4 mr-3" />
            Select Mode
          </Button>
          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeleteSelected}
            disabled={!selectedNode && !selectedEdge}
          >
            <Trash2 className="h-4 w-4 mr-3" />
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
