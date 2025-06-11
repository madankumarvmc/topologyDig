import { Node, Edge, MarkerType } from 'reactflow';
import { NodeData, NodeType } from './constants';

interface DotNode {
  id: string;
  label: string;
  shape: string;
  fillcolor: string;
  attributes: Record<string, string>;
}

interface DotEdge {
  source: string;
  target: string;
  label?: string;
  color?: string;
  penwidth?: string;
  attributes: Record<string, string>;
}

// Map DOT shapes to our node types
const shapeToNodeType: Record<string, NodeType> = {
  'diamond': 'simple',
  'circle': 'scanner',
  'box': 'eject',
  'square': 'simple',
  'doublecircle': 'scanner',
};

// Parse DOT node definition
function parseDotNode(line: string): DotNode | null {
  // Match pattern: nodeId [shape=... fillcolor=... label=<...>]
  const nodeMatch = line.match(/^\s*(\w+)\s*\[([^\]]+)\]/);
  if (!nodeMatch) return null;

  const id = nodeMatch[1];
  const attributesStr = nodeMatch[2];
  
  const attributes: Record<string, string> = {};
  
  // Parse attributes
  const attrRegex = /(\w+)=([^;\s]+)/g;
  let match;
  while ((match = attrRegex.exec(attributesStr)) !== null) {
    let value = match[2];
    // Remove quotes and angle brackets
    value = value.replace(/^["<]|[">]$/g, '');
    attributes[match[1]] = value;
  }

  return {
    id,
    label: attributes.label || id,
    shape: attributes.shape || 'circle',
    fillcolor: attributes.fillcolor || 'gray',
    attributes
  };
}

// Parse DOT edge definition
function parseDotEdge(line: string): DotEdge | null {
  // Match pattern: source -> target [label=... color=...]
  const edgeMatch = line.match(/^\s*(\w+)\s*->\s*(\w+)\s*(?:\[([^\]]+)\])?/);
  if (!edgeMatch) return null;

  const source = edgeMatch[1];
  const target = edgeMatch[2];
  const attributesStr = edgeMatch[3] || '';
  
  const attributes: Record<string, string> = {};
  
  if (attributesStr) {
    const attrRegex = /(\w+)=([^;\s]+)/g;
    let match;
    while ((match = attrRegex.exec(attributesStr)) !== null) {
      let value = match[2];
      value = value.replace(/^["<]|[">]$/g, '');
      attributes[match[1]] = value;
    }
  }

  return {
    source,
    target,
    label: attributes.label,
    color: attributes.color,
    penwidth: attributes.penwidth,
    attributes
  };
}

// Create hierarchical layout based on graph structure
function createHierarchicalLayout(dotNodes: DotNode[], dotEdges: DotEdge[]): {
  nodes: Node<NodeData>[];
  edges: Edge[];
} {
  // Build adjacency lists
  const incomingEdges = new Map<string, string[]>();
  const outgoingEdges = new Map<string, string[]>();
  
  for (const edge of dotEdges) {
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, []);
    }
    if (!outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, []);
    }
    
    incomingEdges.get(edge.target)!.push(edge.source);
    outgoingEdges.get(edge.source)!.push(edge.target);
  }

  // Find root nodes (nodes with no incoming edges or special patterns)
  const rootNodes = dotNodes.filter(node => {
    const hasIncoming = incomingEdges.has(node.id) && incomingEdges.get(node.id)!.length > 0;
    const isFeeder = node.label.includes('sblFeed') || node.id.match(/^(61|63|65)$/);
    return !hasIncoming || isFeeder;
  });

  // Assign levels using BFS
  const levels = new Map<string, number>();
  const queue: Array<{ id: string; level: number }> = [];
  
  // Start with root nodes at level 0
  for (const root of rootNodes) {
    levels.set(root.id, 0);
    queue.push({ id: root.id, level: 0 });
  }

  // BFS to assign levels
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const children = outgoingEdges.get(id) || [];
    
    for (const childId of children) {
      const currentLevel = levels.get(childId);
      const newLevel = level + 1;
      
      if (currentLevel === undefined || newLevel < currentLevel) {
        levels.set(childId, newLevel);
        queue.push({ id: childId, level: newLevel });
      }
    }
  }

  // Group nodes by level
  const nodesByLevel = new Map<number, DotNode[]>();
  for (const node of dotNodes) {
    const level = levels.get(node.id) ?? 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  }

  // Position nodes
  const nodes: Node<NodeData>[] = [];
  const levelHeight = 150;
  const nodeSpacing = 180;
  const maxLevel = Math.max(...Array.from(levels.values()));

  const levelArray = Array.from(nodesByLevel.entries());
  for (const [level, levelNodes] of levelArray) {
    const y = level * levelHeight + 100;
    const totalWidth = (levelNodes.length - 1) * nodeSpacing;
    const startX = -totalWidth / 2 + 400; // Center horizontally

    levelNodes.forEach((dotNode: DotNode, index: number) => {
      const x = startX + (index * nodeSpacing);
      
      // Extract attributes from label
      const labelParts = dotNode.label.split('<br/>');
      const code = labelParts[0] || dotNode.id;
      const attrs: Record<string, string> = {};
      
      // Parse attributes from label
      for (let i = 1; i < labelParts.length; i++) {
        const part = labelParts[i];
        if (part.includes(':')) {
          const [key, value] = part.split(':');
          attrs[key.trim()] = value.trim();
        } else {
          attrs[part.trim()] = 'true';
        }
      }

      const nodeType = shapeToNodeType[dotNode.shape] || 'simple';
      
      const node: Node<NodeData> = {
        id: dotNode.id,
        type: nodeType,
        position: { x, y },
        data: {
          code,
          type: nodeType,
          cmd: parseInt(code) || 0,
          attrs
        }
      };

      nodes.push(node);
    });
  }

  // Create edges
  const edges: Edge[] = dotEdges.map((dotEdge, index) => {
    const edge: Edge = {
      id: `edge-${dotEdge.source}-${dotEdge.target}-${index}`,
      source: dotEdge.source,
      target: dotEdge.target,
      type: 'custom',
      animated: false,
      style: {
        stroke: dotEdge.color === 'blue' ? '#3b82f6' : '#666',
        strokeWidth: dotEdge.penwidth ? parseFloat(dotEdge.penwidth) : 2,
      },
      label: dotEdge.label,
      markerEnd: {
        type: 'arrowclosed' as any,
        color: dotEdge.color === 'blue' ? '#3b82f6' : '#666',
      }
    };

    return edge;
  });

  return { nodes, edges };
}

export function parseDotGraph(dotContent: string): { nodes: Node<NodeData>[]; edges: Edge[] } {
  const lines = dotContent.split('\n').map(line => line.trim());
  const dotNodes: DotNode[] = [];
  const dotEdges: DotEdge[] = [];

  for (const line of lines) {
    if (line.includes('->')) {
      const edge = parseDotEdge(line);
      if (edge) dotEdges.push(edge);
    } else if (line.includes('[') && !line.startsWith('node') && !line.startsWith('digraph')) {
      const node = parseDotNode(line);
      if (node) dotNodes.push(node);
    }
  }

  return createHierarchicalLayout(dotNodes, dotEdges);
}