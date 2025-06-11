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

export function exportToJSON(nodes: Node<NodeData>[]) {
  return {
    whId: Date.now(),
    nodes: nodes.map(node => ({
      code: node.data.code,
      type: node.data.type.toUpperCase(),
      cmd: node.data.cmd,
      attrs: node.data.attrs || {},
    })),
  };
}

export function importFromJSON(jsonData: any): { nodes: Node<NodeData>[]; edges: Edge[] } {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];

  if (jsonData.nodes && Array.isArray(jsonData.nodes)) {
    jsonData.nodes.forEach((nodeData: any, index: number) => {
      const node: Node<NodeData> = {
        id: (index + 1).toString(),
        type: 'custom',
        position: { 
          x: 100 + (index % 5) * 120, 
          y: 100 + Math.floor(index / 5) * 100 
        },
        data: {
          code: nodeData.code || `node_${index}`,
          type: (nodeData.type || 'SIMPLE').toLowerCase() as NodeType,
          cmd: nodeData.cmd || index,
          attrs: nodeData.attrs || {},
        },
      };
      nodes.push(node);
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
