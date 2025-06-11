import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/lib/graph-store";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowDownWideNarrow, 
  ArrowRightFromLine 
} from "lucide-react";

export default function LayoutToolbar() {
  const { autoLayout, nodes } = useGraphStore();
  const { toast } = useToast();

  const handleAutoLayout = useCallback((layoutType: 'hierarchical' | 'horizontal') => {
    if (nodes.length === 0) {
      toast({
        title: "No Nodes",
        description: "Add some nodes before applying layout.",
        variant: "destructive",
      });
      return;
    }

    autoLayout(layoutType);
    
    const layoutNames = {
      hierarchical: "Vertical Layout",
      horizontal: "Horizontal Layout"
    };

    toast({
      title: "Layout Applied",
      description: `${layoutNames[layoutType]} applied successfully.`,
    });
  }, [autoLayout, nodes.length, toast]);

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
    </div>
  );
}