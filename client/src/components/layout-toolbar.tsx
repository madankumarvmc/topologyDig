import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/lib/graph-store";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowDownWideNarrow, 
  ArrowRightFromLine,
  Network
} from "lucide-react";

interface LayoutToolbarProps {
  reactFlowInstance?: any;
}

export default function LayoutToolbar({ reactFlowInstance }: LayoutToolbarProps) {
  const { autoLayout, nodes } = useGraphStore();
  const { toast } = useToast();

  const handleAutoLayout = useCallback((layoutType: 'hierarchical' | 'horizontal' | 'smart') => {
    if (nodes.length === 0) {
      toast({
        title: "No Nodes",
        description: "Add some nodes before applying layout.",
        variant: "destructive",
      });
      return;
    }

    autoLayout(layoutType, reactFlowInstance);
    
    const layoutNames = {
      hierarchical: "Vertical Layout",
      horizontal: "Horizontal Layout",
      smart: "Smart Layout"
    };

    toast({
      title: "Layout Applied",
      description: `${layoutNames[layoutType]} applied successfully.${nodes.length > 50 ? ' View automatically fitted to screen.' : ''}`,
    });
  }, [autoLayout, nodes.length, toast, reactFlowInstance]);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="bg-white/95 backdrop-blur-sm shadow-sm border p-2"
        onClick={() => handleAutoLayout('hierarchical')}
        title="Vertical Layout"
      >
        <ArrowDownWideNarrow className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="bg-white/95 backdrop-blur-sm shadow-sm border p-2"
        onClick={() => handleAutoLayout('horizontal')}
        title="Horizontal Layout"
      >
        <ArrowRightFromLine className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="bg-white/95 backdrop-blur-sm shadow-sm border p-2"
        onClick={() => handleAutoLayout('smart')}
        title="Smart Layout - Minimizes edge crossings and groups by type"
      >
        <Network className="h-4 w-4" />
      </Button>
    </div>
  );
}