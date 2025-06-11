import { Node, Edge } from 'reactflow';
import { NodeData, NodeType } from './constants';

export function createNewNode(type: NodeType): Node<NodeData> {
  const timestamp = Date.now();
  const code = `${type}_${timestamp}`;
  
  return {
    id: timestamp.toString(),
    type: 'custom',
    position: { x: 100, y: 100 },
    data: {
      code,
      type,
      cmd: parseInt(code.slice(-3)) || timestamp % 1000,
      attrs: {},
    },
  };
}

export function exportToJSON(nodes: Node<NodeData>[], edges: Edge[] = []) {
  // Create a map of node IDs to their codes for edge mapping
  const nodeIdToCode = new Map();
  nodes.forEach(node => {
    nodeIdToCode.set(node.id, node.data.code);
  });

  return {
    whId: Date.now(),
    nodes: nodes.map(node => ({
      code: node.data.code,
      type: node.data.type.toUpperCase(),
      cmd: node.data.cmd,
      attrs: node.data.attrs || {},
    })),
    edges: edges.map(edge => ({
      from: nodeIdToCode.get(edge.source) || edge.source,
      to: nodeIdToCode.get(edge.target) || edge.target,
      distance: 0.5,
      attrs: {},
      default: edge.style?.stroke === "#3b82f6" && edge.style?.strokeWidth === 3,
      capacity: 1,
    })),
    loops: [], // Will be populated in phase 2 with loop detection
  };
}

export function importFromJSON(jsonData: any): { nodes: Node<NodeData>[]; edges: Edge[] } {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  const nodeCodeToId = new Map();

  // Import nodes
  if (jsonData.nodes && Array.isArray(jsonData.nodes)) {
    jsonData.nodes.forEach((nodeData: any, index: number) => {
      const nodeId = (index + 1).toString();
      const node: Node<NodeData> = {
        id: nodeId,
        type: 'custom',
        position: { 
          x: 100 + (index % 10) * 150, 
          y: 100 + Math.floor(index / 10) * 120 
        },
        data: {
          code: nodeData.code || `node_${index}`,
          type: (nodeData.type || 'SIMPLE').toLowerCase() as NodeType,
          cmd: nodeData.cmd || index,
          attrs: nodeData.attrs || {},
        },
      };
      nodes.push(node);
      nodeCodeToId.set(nodeData.code, nodeId);
    });
  }

  // Import edges - handle both "from/to" and "source/target" formats
  if (jsonData.edges && Array.isArray(jsonData.edges)) {
    jsonData.edges.forEach((edgeData: any, index: number) => {
      // Handle both formats: from/to and source/target
      const sourceCode = edgeData.from || edgeData.source;
      const targetCode = edgeData.to || edgeData.target;
      
      const sourceId = nodeCodeToId.get(sourceCode);
      const targetId = nodeCodeToId.get(targetCode);
      
      if (sourceId && targetId) {
        const edge: Edge = {
          id: `edge-${index + 1}`,
          source: sourceId,
          target: targetId,
          type: 'custom',
          label: edgeData.label || "",
          markerEnd: { type: 'arrowclosed' as any },
          style: {
            stroke: edgeData.default ? "#3b82f6" : "#666",
            strokeWidth: edgeData.default ? 3 : 2,
          },
        };
        edges.push(edge);
      }
    });
  }

  return { nodes, edges };
}

export function validateNodeCode(code: string, existingNodes: Node<NodeData>[], excludeId?: string): boolean {
  return !existingNodes.some(node => 
    node.data.code === code && node.id !== excludeId
  );
}

export function getNodeLabel(node: Node<NodeData>): string {
  const attrs = node.data.attrs || {};
  const attrLabels = Object.entries(attrs)
    .filter(([_, value]) => value === "true")
    .map(([key]) => key);
  
  if (attrLabels.length > 0) {
    return `${node.data.code}\n${attrLabels.join(', ')}`;
  }
  
  return node.data.code;
}
