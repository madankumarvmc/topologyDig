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
      source: nodeIdToCode.get(edge.source) || edge.source,
      target: nodeIdToCode.get(edge.target) || edge.target,
      label: edge.label || "",
      color: edge.style?.stroke === "#3b82f6" ? "blue" : 
             edge.style?.stroke === "#ef4444" ? "red" :
             edge.style?.stroke === "#22c55e" ? "green" : "",
      penwidth: edge.style?.strokeWidth ? parseFloat(edge.style.strokeWidth.toString()) : 2.0,
    })),
    loops: [], // Will be populated in phase 2 with loop detection
  };
}

export function importFromJSON(jsonData: any): { nodes: Node<NodeData>[]; edges: Edge[] } {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  const nodeCodeToId = new Map();

  console.log('Importing JSON data:', jsonData);

  // Import nodes
  if (jsonData.nodes && Array.isArray(jsonData.nodes)) {
    jsonData.nodes.forEach((nodeData: any, index: number) => {
      const nodeId = (index + 1).toString();
      const node: Node<NodeData> = {
        id: nodeId,
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
      nodeCodeToId.set(nodeData.code, nodeId);
      console.log(`Mapped node code "${nodeData.code}" to ID "${nodeId}"`);
    });
  }

  console.log('Node code to ID mapping:', Array.from(nodeCodeToId.entries()));

  // Import edges
  if (jsonData.edges && Array.isArray(jsonData.edges)) {
    console.log(`Processing ${jsonData.edges.length} edges`);
    jsonData.edges.forEach((edgeData: any, index: number) => {
      console.log(`Edge ${index}:`, edgeData);
      const sourceId = nodeCodeToId.get(edgeData.source);
      const targetId = nodeCodeToId.get(edgeData.target);
      
      console.log(`Source "${edgeData.source}" -> ID "${sourceId}", Target "${edgeData.target}" -> ID "${targetId}"`);
      
      if (sourceId && targetId) {
        const edge: Edge = {
          id: `edge-${index + 1}`,
          source: sourceId,
          target: targetId,
          type: 'custom',
          label: edgeData.label || "",
          markerEnd: { type: 'arrowclosed' as any },
          style: {
            stroke: edgeData.color === "blue" ? "#3b82f6" :
                    edgeData.color === "red" ? "#ef4444" :
                    edgeData.color === "green" ? "#22c55e" : "#666",
            strokeWidth: edgeData.penwidth || 2,
          },
        };
        edges.push(edge);
        console.log(`Created edge:`, edge);
      } else {
        console.warn(`Failed to create edge: source "${edgeData.source}" (${sourceId}) or target "${edgeData.target}" (${targetId}) not found`);
      }
    });
  }

  console.log(`Final result: ${nodes.length} nodes, ${edges.length} edges`);
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
