import dagre from 'dagre';
import { Node, Edge } from 'reactflow';
import { NodeData } from './constants';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export function getLayoutedElements(
  nodes: Node<NodeData>[],
  edges: Edge[],
  direction = 'TB',
  nodeWidth = 172,
  nodeHeight = 36
) {
  const isHorizontal = direction === 'LR';
  const nodeCount = nodes.length;
  
  // Use much tighter spacing for large graphs to fit on screen
  let nodesep, ranksep;
  if (nodeCount > 100) {
    nodesep = isHorizontal ? 30 : 25;
    ranksep = isHorizontal ? 60 : 50;
  } else if (nodeCount > 50) {
    nodesep = isHorizontal ? 50 : 35;
    ranksep = isHorizontal ? 80 : 60;
  } else {
    nodesep = isHorizontal ? 80 : 50;
    ranksep = isHorizontal ? 120 : 80;
  }
  
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: nodesep,
    ranksep: ranksep,
    marginx: 10,
    marginy: 10
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  // Improve edge routing for better visual clarity
  const layoutedEdges = edges.map((edge) => ({
    ...edge,
    type: 'smoothstep',
    style: {
      ...edge.style,
      strokeWidth: 2,
    },
    pathOptions: {
      offset: 20,
      borderRadius: 10,
    },
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

export function getHierarchicalLayout(
  nodes: Node<NodeData>[],
  edges: Edge[]
) {
  return getLayoutedElements(nodes, edges, 'TB', 120, 80);
}

export function getHorizontalLayout(
  nodes: Node<NodeData>[],
  edges: Edge[]
) {
  const nodeCount = nodes.length;
  
  if (nodeCount > 80) {
    // Use specialized warehouse flow layout for large topologies
    return getWarehouseFlowLayout(nodes, edges);
  }
  
  // Use regular dagre layout for smaller graphs
  const nodeWidth = nodeCount > 50 ? 100 : 150;
  const nodeHeight = nodeCount > 50 ? 60 : 100;
  
  return getLayoutedElements(nodes, edges, 'LR', nodeWidth, nodeHeight);
}

export function getForceLayout(
  nodes: Node<NodeData>[],
  edges: Edge[]
) {
  // Simple force-based layout for when nodes are too clustered
  const centerX = 400;
  const centerY = 300;
  const radius = 200;
  
  const layoutedNodes = nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    return {
      ...node,
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function getGridLayout(
  nodes: Node<NodeData>[],
  edges: Edge[]
) {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const nodeWidth = 120;
  const nodeHeight = 80;
  const spacing = 150;
  
  const layoutedNodes = nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      ...node,
      position: {
        x: col * spacing + 100,
        y: row * spacing + 100,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function getWarehouseFlowLayout(
  nodes: Node<NodeData>[],
  edges: Edge[]
) {
  // Build adjacency maps
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    
    outgoing.get(edge.source)!.push(edge.target);
    incoming.get(edge.target)!.push(edge.source);
  });

  // Find entry points (nodes with no incoming edges or feeders)
  const entryPoints = nodes.filter(node => {
    const hasIncoming = incoming.has(node.id) && incoming.get(node.id)!.length > 0;
    const isFeeder = node.data.code.match(/^(61|63|65|V)/) || 
                     node.data.attrs?.ptlFeed === 'true' ||
                     node.data.attrs?.ptlFeedControl === 'true';
    return !hasIncoming || isFeeder;
  });

  // Create flow chains starting from entry points
  const visited = new Set<string>();
  const chains: Node<NodeData>[][] = [];
  
  function traceChain(startNode: Node<NodeData>): Node<NodeData>[] {
    const chain: Node<NodeData>[] = [startNode];
    visited.add(startNode.id);
    
    let current = startNode;
    while (true) {
      const nextNodes = outgoing.get(current.id) || [];
      // Follow the main path (default edge or first available)
      const nextNodeId = nextNodes.find(id => !visited.has(id));
      
      if (!nextNodeId) break;
      
      const nextNode = nodes.find(n => n.id === nextNodeId);
      if (!nextNode) break;
      
      chain.push(nextNode);
      visited.add(nextNode.id);
      current = nextNode;
    }
    
    return chain;
  }

  // Trace main chains
  entryPoints.forEach(entry => {
    if (!visited.has(entry.id)) {
      chains.push(traceChain(entry));
    }
  });

  // Handle remaining unvisited nodes
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      chains.push(traceChain(node));
    }
  });

  // Layout chains vertically with compact spacing
  const layoutedNodes: Node<NodeData>[] = [];
  const nodeSpacing = 80;
  const chainSpacing = 120;
  let currentY = 50;

  chains.sort((a, b) => b.length - a.length); // Longer chains first

  chains.forEach(chain => {
    let currentX = 50;
    
    chain.forEach(node => {
      layoutedNodes.push({
        ...node,
        position: { x: currentX, y: currentY }
      });
      currentX += nodeSpacing;
    });
    
    currentY += chainSpacing;
  });

  // Improve edge routing for better visual flow
  const layoutedEdges = edges.map(edge => ({
    ...edge,
    type: 'smoothstep',
    style: {
      ...edge.style,
      strokeWidth: edge.style?.strokeWidth || 2,
    },
    pathOptions: {
      offset: 10,
      borderRadius: 8,
    },
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
}