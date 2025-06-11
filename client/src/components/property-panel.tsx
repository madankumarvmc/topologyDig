import { useCallback, useState } from "react";
import { useGraphStore } from "@/lib/graph-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NODE_TYPES_LIST } from "@/lib/constants";

export default function PropertyPanel() {
  const { 
    selectedNode, 
    selectedEdge, 
    updateNode, 
    updateEdge, 
    deleteSelectedElements, 
    duplicateNode 
  } = useGraphStore();
  const { toast } = useToast();
  
  const [newAttrKey, setNewAttrKey] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");

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
    toast({
      title: "Node Duplicated",
      description: "Node has been duplicated successfully.",
    });
  }, [selectedNode, duplicateNode, toast]);

  const handleDelete = useCallback(() => {
    deleteSelectedElements();
    toast({
      title: "Deleted",
      description: "Selected element has been deleted.",
    });
  }, [deleteSelectedElements, toast]);

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select a node or edge to view its properties</p>
        </div>
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800">Node Properties</h2>
          <p className="text-sm text-gray-600 mt-1">Configure selected node</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "junction:true",
                    "ptlFeed:true", 
                    "blockedHU:true",
                    "emptyHU:true",
                    "sblFeed:true",
                    "qc:true",
                    "misc:true",
                    "noEligibleZone:true",
                    "packedCHU:true",
                    "emptyPackedCHU:true",
                    "ptlFeedControl:true",
                    "enabled:true"
                  ].map((attr) => (
                    <Button
                      key={attr}
                      variant="outline"
                      size="sm"
                      className="text-xs py-1 px-2"
                      onClick={() => handleQuickAttribute(attr)}
                    >
                      {attr.split(':')[0]}
                    </Button>
                  ))}
                </div>
                <div className="mt-2 space-y-1">
                  {[
                    "xdockMapping:",
                    "routeId:",
                    "zone:",
                    "priority:",
                    "capacity:",
                    "conveyor:",
                    "deviceId:",
                    "networkId:"
                  ].map((attr) => (
                    <Button
                      key={attr}
                      variant="outline"
                      size="sm"
                      className="text-xs w-full"
                      onClick={() => {
                        const key = attr.replace(':', '');
                        setNewAttrKey(key);
                        setNewAttrValue('');
                      }}
                    >
                      Add {attr.replace(':', '')}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Node
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Node
          </Button>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    console.log('Selected Edge Data:', selectedEdge);
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800">Edge Properties</h2>
          <p className="text-sm text-gray-600 mt-1">Configure selected edge</p>
          <p className="text-xs text-gray-500 mt-1">ID: {selectedEdge.id}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Edge Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Debug Info */}
              <div className="bg-gray-50 p-2 rounded text-xs">
                <strong>Debug Info:</strong><br/>
                Data: {JSON.stringify(selectedEdge.data || {}, null, 2)}<br/>
                Style: {JSON.stringify(selectedEdge.style || {}, null, 2)}
              </div>
              
              <div>
                <Label htmlFor="from" className="text-xs font-medium text-gray-700">From Node</Label>
                <Input
                  id="from"
                  type="text"
                  value={String(selectedEdge.source || "")}
                  onChange={(e) => handleUpdateEdge('source', e.target.value)}
                  placeholder="Source node code"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="to" className="text-xs font-medium text-gray-700">To Node</Label>
                <Input
                  id="to"
                  type="text"
                  value={String(selectedEdge.target || "")}
                  onChange={(e) => handleUpdateEdge('target', e.target.value)}
                  placeholder="Target node code"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="distance" className="text-xs font-medium text-gray-700">Distance</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  value={selectedEdge.data?.distance || 0.5}
                  onChange={(e) => handleUpdateEdge('data', { 
                    ...selectedEdge.data, 
                    distance: parseFloat(e.target.value) || 0.5 
                  })}
                  placeholder="Distance value"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="capacity" className="text-xs font-medium text-gray-700">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={selectedEdge.data?.capacity || 1}
                  onChange={(e) => handleUpdateEdge('data', { 
                    ...selectedEdge.data, 
                    capacity: parseInt(e.target.value) || 1 
                  })}
                  placeholder="Edge capacity"
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default"
                  checked={selectedEdge.data?.default || false}
                  onChange={(e) => handleUpdateEdge('data', { 
                    ...selectedEdge.data, 
                    default: e.target.checked 
                  })}
                  className="rounded"
                />
                <Label htmlFor="default" className="text-xs font-medium text-gray-700">Default Route</Label>
              </div>
              
              <div>
                <Label htmlFor="label" className="text-xs font-medium text-gray-700">Label</Label>
                <Input
                  id="label"
                  type="text"
                  value={String(selectedEdge.label || "")}
                  onChange={(e) => handleUpdateEdge('label', e.target.value)}
                  placeholder="Edge label"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="style" className="text-xs font-medium text-gray-700">Color</Label>
                <Select
                  value={selectedEdge.style?.stroke || "#666666"}
                  onValueChange={(value) => handleUpdateEdge('style', { 
                    ...selectedEdge.style, 
                    stroke: value 
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#666666">Grey (Default)</SelectItem>
                    <SelectItem value="#3b82f6">Blue</SelectItem>
                    <SelectItem value="#ef4444">Red</SelectItem>
                    <SelectItem value="#22c55e">Green</SelectItem>
                    <SelectItem value="#f59e0b">Orange</SelectItem>
                    <SelectItem value="#8b5cf6">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Edge Attributes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Edge Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Existing Attributes */}
              <div className="space-y-2">
                {Object.entries(selectedEdge.data?.attrs || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Badge variant="secondary" className="flex-1 justify-between">
                      <span className="text-xs">{key}: {String(value)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => {
                          const updatedAttrs = { ...selectedEdge.data?.attrs };
                          delete updatedAttrs[key];
                          handleUpdateEdge('data', { 
                            ...selectedEdge.data, 
                            attrs: updatedAttrs 
                          });
                        }}
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
                    onClick={() => {
                      if (!selectedEdge || !newAttrKey.trim()) return;
                      
                      const updatedAttrs = {
                        ...selectedEdge.data?.attrs,
                        [newAttrKey.trim()]: newAttrValue.trim() || "true"
                      };
                      
                      handleUpdateEdge('data', { 
                        ...selectedEdge.data, 
                        attrs: updatedAttrs 
                      });
                      setNewAttrKey("");
                      setNewAttrValue("");
                      
                      toast({
                        title: "Edge Attribute Added",
                        description: `Added attribute: ${newAttrKey}`,
                      });
                    }}
                    disabled={!newAttrKey.trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Quick Edge Attributes */}
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-2 block">Quick Attributes</Label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "priority:high",
                    "weight:1",
                    "speed:normal",
                    "bidirectional:true",
                    "blocked:false",
                    "maintenance:false"
                  ].map((attr) => (
                    <Button
                      key={attr}
                      variant="outline"
                      size="sm"
                      className="text-xs py-1 px-2"
                      onClick={() => {
                        const [key, value] = attr.split(':');
                        const updatedAttrs = {
                          ...selectedEdge.data?.attrs,
                          [key]: value
                        };
                        
                        handleUpdateEdge('data', { 
                          ...selectedEdge.data, 
                          attrs: updatedAttrs 
                        });
                        
                        toast({
                          title: "Quick Attribute Added",
                          description: `Added ${key}: ${value}`,
                        });
                      }}
                    >
                      {attr.split(':')[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Edge
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
