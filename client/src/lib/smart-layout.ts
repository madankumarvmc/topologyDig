import dagre from 'dagre';
import { Node, Edge } from 'reactflow';
import { NodeData } from './constants';

export function getSmartHierarchicalLayout(
  nodes: Node<NodeData>[],
  edges: Edge[],
  nodeWidth = 80,
  nodeHeight = 80
) {
  // Create a new dagre graph for smart layout
  const smartGraph = new dagre.graphlib.Graph();
  smartGraph.setDefaultEdgeLabel(() => ({}));

  // Calculate optimal spacing based on node count to prevent overlapping
  const totalNodes = nodes.length;
  let horizontalSpacing, rankSpacing;
  
  if (totalNodes > 100) {
    horizontalSpacing = 120;
    rankSpacing = 180;
  } else if (totalNodes > 50) {
    horizontalSpacing = 150;
    rankSpacing = 220;
  } else {
    horizontalSpacing = 180;
    rankSpacing = 280;
  }

  // Configure graph for warehouse flow with edge crossing minimization
  smartGraph.setGraph({
    rankdir: 'LR', // Left to right for warehouse flow
    nodesep: horizontalSpacing,
    ranksep: rankSpacing,
    marginx: 80,
    marginy: 80,
    align: 'UL', // Align upper left for consistent positioning
    ranker: 'tight-tree' // Minimize edge crossings
  });

  // Add nodes to graph with warehouse flow ranking
  nodes.forEach((node) => {
    smartGraph.setNode(node.id, { 
      width: nodeWidth, 
      height: nodeHeight
    });
  });

  // Add edges with weight based on connection importance to reduce crossings
  edges.forEach((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    // Higher weight for critical connections to reduce crossings
    let weight = 1;
    if (sourceNode?.data.type === 'scanner' || targetNode?.data.type === 'scanner') {
      weight = 3; // Scanner connections are critical
    }
    if (edge.data?.default) {
      weight = 5; // Default routes have highest priority
    }
    
    smartGraph.setEdge(edge.source, edge.target, { weight });
  });

  // Apply layout
  dagre.layout(smartGraph);

  // Create positioned nodes with improved spacing
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = smartGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}