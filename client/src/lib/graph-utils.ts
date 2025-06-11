import { Node, Edge } from 'reactflow';
import { NodeData, NodeType } from './constants';

function mapNodeType(nodeData: any): NodeType {
  const code = nodeData.code || '';
  const type = nodeData.type || '';
  const attrs = nodeData.attrs || {};
  
  // FEED nodes (square boxes) - codes like 61, 63, 65 or sblFeed attribute
  if (attrs.sblFeed === 'true' || code.match(/^(61|63|65)$/)) {
    return 'feed';
  }
  
  // PTL ZONE nodes (double circles, yellow) - V001-V016
  if (code.startsWith('V') && code.length === 4) {
    const vNumber = parseInt(code.slice(1));
    if (vNumber >= 1 && vNumber <= 16) {
      return 'ptlzone';
    }
  }
  
  // SBL ZONE nodes (double circles, blue) - V031-V054
  if (code.startsWith('V') && code.length === 4) {
    const vNumber = parseInt(code.slice(1));
    if (vNumber >= 31 && vNumber <= 54) {
      return 'sblzone';
    }
  }
  
  // Map based on JSON type
  switch (type.toUpperCase()) {
    case 'SIMPLE':
      return 'simple';
    case 'SCANNER':
      return 'scanner';
    case 'EJECT':
      return 'eject';
    case 'FEED':
      return 'feed';
    case 'PTLZONE':
      return 'ptlzone';
    case 'SBLZONE':
      return 'sblzone';
    default:
      return 'simple';
  }
}

export { mapNodeType };

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
    nodes: nodes.filter(node => node.type === 'custom').map(node => ({
      code: node.data.code,
      type: node.data.type.toUpperCase(),
      cmd: node.data.cmd,
      attrs: node.data.attrs || {},
    })),
    edges: edges.filter(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return sourceNode?.type === 'custom' && targetNode?.type === 'custom';
    }).map(edge => ({
      from: nodeIdToCode.get(edge.source) || edge.source,
      to: nodeIdToCode.get(edge.target) || edge.target,
      distance: edge.data?.distance || 0.5,
      attrs: edge.data?.attrs || {},
      default: edge.data?.default || false,
      capacity: edge.data?.capacity || 1,
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
    const nodeCount = jsonData.nodes.length;
    // Use tighter spacing for large graphs
    const spacing = nodeCount > 100 ? { x: 80, y: 60 } : { x: 150, y: 120 };
    const nodesPerRow = nodeCount > 100 ? 20 : 10;
    
    jsonData.nodes.forEach((nodeData: any, index: number) => {
      const nodeId = (index + 1).toString();
      const node: Node<NodeData> = {
        id: nodeId,
        type: 'custom',
        position: { 
          x: 50 + (index % nodesPerRow) * spacing.x, 
          y: 50 + Math.floor(index / nodesPerRow) * spacing.y 
        },
        data: {
          code: nodeData.code || `node_${index}`,
          type: mapNodeType(nodeData),
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
          data: {
            distance: edgeData.distance || 0.5,
            attrs: edgeData.attrs || {},
            default: edgeData.default || false,
            capacity: edgeData.capacity || 1,
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
