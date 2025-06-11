import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGraphStore } from "@/lib/graph-store";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutGrid, 
  Network, 
  ArrowDownWideNarrow, 
  ArrowRightFromLine,
  Sparkles 
} from "lucide-react";

export default function LayoutToolbar() {
  const { autoLayout, nodes, edges } = useGraphStore();
  const { toast } = useToast();

  const handleAutoLayout = useCallback((layoutType: 'hierarchical' | 'horizontal' | 'force' | 'grid') => {
    if (nodes.length === 0) {
      toast({
        title: "No Nodes",
        description: "Add some nodes before applying auto layout.",
        variant: "destructive",
      });
      return;
    }

    autoLayout(layoutType);
    
    const layoutNames = {
      hierarchical: "Hierarchical Layout",
      horizontal: "Horizontal Layout", 
      force: "Force Layout",
      grid: "Grid Layout"
    };

    toast({
      title: "Layout Applied",
      description: `${layoutNames[layoutType]} has been applied to your graph.`,
    });
  }, [autoLayout, nodes.length, toast]);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <Card className="absolute top-4 right-4 z-10 w-64 bg-white/95 backdrop-blur-sm shadow-lg border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          Auto Layout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-gray-600 mb-3">
          Clean up your graph with one click
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-auto p-2 flex flex-col items-center space-y-1"
            onClick={() => handleAutoLayout('hierarchical')}
          >
            <ArrowDownWideNarrow className="h-4 w-4" />
            <span className="text-xs">Hierarchical</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-auto p-2 flex flex-col items-center space-y-1"
            onClick={() => handleAutoLayout('horizontal')}
          >
            <ArrowRightFromLine className="h-4 w-4" />
            <span className="text-xs">Horizontal</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-auto p-2 flex flex-col items-center space-y-1"
            onClick={() => handleAutoLayout('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs">Grid</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-auto p-2 flex flex-col items-center space-y-1"
            onClick={() => handleAutoLayout('force')}
          >
            <Network className="h-4 w-4" />
            <span className="text-xs">Radial</span>
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        <div className="text-xs text-gray-500">
          {nodes.length} nodes • {edges.length} edges
        </div>
      </CardContent>
    </Card>
  );
}