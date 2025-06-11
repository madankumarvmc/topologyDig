import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGraphStore } from "@/lib/graph-store";
import { exportToJSON } from "@/lib/graph-utils";
import { Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { nodes } = useGraphStore();
  const { toast } = useToast();

  const jsonOutput = JSON.stringify(exportToJSON(nodes), null, 2);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      toast({
        title: "Copied",
        description: "JSON has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy JSON to clipboard.",
        variant: "destructive",
      });
    }
  }, [jsonOutput, toast]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warehouse-topology-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "JSON file download has started.",
    });
    setIsOpen(false);
  }, [jsonOutput, toast]);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="hidden">
        Export Graph
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Graph</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JSON Output
              </label>
              <Textarea
                readOnly
                value={jsonOutput}
                className="h-64 font-mono text-sm bg-gray-50"
                placeholder="Generated JSON will appear here..."
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
