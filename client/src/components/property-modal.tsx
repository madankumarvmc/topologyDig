import { useCallback, useState, useEffect } from "react";
import { useGraphStore } from "@/lib/graph-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NODE_TYPES_LIST } from "@/lib/constants";

export default function PropertyModal() {
  const { 
    selectedNode, 
    selectedEdge, 
    updateNode, 
    updateEdge, 
    deleteSelectedElements, 
    duplicateNode,
    onPaneClick 
  } = useGraphStore();
  const { toast } = useToast();
  
  const [newAttrKey, setNewAttrKey] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for property modal open events
  useEffect(() => {
    const handleOpenModal = () => {
      if (selectedNode || selectedEdge) {
        setIsOpen(true);
      }
    };

    window.addEventListener('openPropertyModal', handleOpenModal);
    return () => window.removeEventListener('openPropertyModal', handleOpenModal);
  }, [selectedNode, selectedEdge]);

  const handleUpdateNode = useCallback((field: string, value: any) => {
    if (!selectedNode) return;
    updateNode(selectedNode.id, { [field]: value });
  }, [selectedNode, updateNode]);

  const handleUpdateEdge = useCallback((field: string, value: any) => {
    if (!selectedEdge) return;
    updateEdge(selectedEdge.id, { [field]: value });
  }, [selectedEdge, updateEdge]);

  const handleAddAttribute = useCallback(() => {
    if (!selectedNode || !newAttrKey.trim()) return;
    
    const updatedAttrs = {
      ...selectedNode.data.attrs,
      [newAttrKey.trim()]: newAttrValue.trim() || "true"
    };
    
    updateNode(selectedNode.id, { data: { ...selectedNode.data, attrs: updatedAttrs } });
    setNewAttrKey("");
    setNewAttrValue("");
    
    toast({
      title: "Attribute Added",
      description: `Added attribute: ${newAttrKey}`,
    });
  }, [selectedNode, newAttrKey, newAttrValue, updateNode, toast]);

  const handleRemoveAttribute = useCallback((key: string) => {
    if (!selectedNode) return;
    
    const updatedAttrs = { ...selectedNode.data.attrs };
    delete updatedAttrs[key];
    
    updateNode(selectedNode.id, { data: { ...selectedNode.data, attrs: updatedAttrs } });
    
    toast({
      title: "Attribute Removed",
      description: `Removed attribute: ${key}`,
    });
  }, [selectedNode, updateNode, toast]);

  const handleQuickAttribute = useCallback((attrString: string) => {
    if (!selectedNode) return;
    
    const [key, value] = attrString.split(":");
    const updatedAttrs = {
      ...selectedNode.data.attrs,
      [key]: value
    };
    
    updateNode(selectedNode.id, { data: { ...selectedNode.data, attrs: updatedAttrs } });
    
    toast({
      title: "Quick Attribute Added",
      description: `Added ${key}: ${value}`,
    });
  }, [selectedNode, updateNode, toast]);

  const handleDuplicate = useCallback(() => {
    if (!selectedNode) return;
    duplicateNode(selectedNode.id);
    handleClose();
    toast({
      title: "Node Duplicated",
      description: "Node has been duplicated successfully.",
    });
  }, [selectedNode, duplicateNode, handleClose, toast]);

  const handleDelete = useCallback(() => {
    deleteSelectedElements();
    toast({
      title: "Deleted",
      description: "Selected element has been deleted.",
    });
  }, [deleteSelectedElements, toast]);

  if (selectedNode) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Node Properties</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Basic Properties */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Basic Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="code" className="text-xs font-medium text-gray-700">Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={selectedNode.data.code}
                    onChange={(e) => handleUpdateNode('data', { ...selectedNode.data, code: e.target.value })}
                    placeholder="Node code"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type" className="text-xs font-medium text-gray-700">Type</Label>
                  <Select
                    value={selectedNode.data.type}
                    onValueChange={(value) => handleUpdateNode('data', { ...selectedNode.data, type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NODE_TYPES_LIST.map((type) => (
                        <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cmd" className="text-xs font-medium text-gray-700">Command</Label>
                  <Input
                    id="cmd"
                    type="number"
                    value={selectedNode.data.cmd}
                    onChange={(e) => handleUpdateNode('data', { ...selectedNode.data, cmd: parseInt(e.target.value) || 0 })}
                    placeholder="Command code"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Existing Attributes */}
                <div className="space-y-2">
                  {Object.entries(selectedNode.data.attrs || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Badge variant="secondary" className="flex-1 justify-between">
                        <span className="text-xs">{key}: {value}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-100"
                          onClick={() => handleRemoveAttribute(key)}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {/* Add New Attribute */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Key"
                      value={newAttrKey}
                      onChange={(e) => setNewAttrKey(e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Value"
                      value={newAttrValue}
                      onChange={(e) => setNewAttrValue(e.target.value)}
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddAttribute}
                      disabled={!newAttrKey.trim()}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Quick Attributes */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">Quick Attributes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAttribute("junction:true")}
                    >
                      Junction
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAttribute("ptlFeed:true")}
                    >
                      PTL Feed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAttribute("blockedHU:true")}
                    >
                      Blocked HU
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAttribute("emptyHU:true")}
                    >
                      Empty HU
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (selectedEdge) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edge Properties</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Edge Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="label" className="text-xs font-medium text-gray-700">Label</Label>
                  <Input
                    id="label"
                    type="text"
                    value={(selectedEdge.label as string) || ""}
                    onChange={(e) => handleUpdateEdge('label', e.target.value)}
                    placeholder="Edge label (e.g., distance, time)"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color" className="text-xs font-medium text-gray-700">Color</Label>
                  <Select
                    value={selectedEdge.style?.stroke || "#666"}
                    onValueChange={(value) => handleUpdateEdge('style', { 
                      ...selectedEdge.style, 
                      stroke: value 
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#666">Default</SelectItem>
                      <SelectItem value="#3b82f6">Blue</SelectItem>
                      <SelectItem value="#ef4444">Red</SelectItem>
                      <SelectItem value="#22c55e">Green</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="penwidth" className="text-xs font-medium text-gray-700">Line Width</Label>
                  <Select
                    value={selectedEdge.style?.strokeWidth?.toString() || "2"}
                    onValueChange={(value) => handleUpdateEdge('style', { 
                      ...selectedEdge.style, 
                      strokeWidth: parseFloat(value) 
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Thin (1px)</SelectItem>
                      <SelectItem value="2">Normal (2px)</SelectItem>
                      <SelectItem value="3">Thick (3px)</SelectItem>
                      <SelectItem value="4">Extra Thick (4px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Edge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}