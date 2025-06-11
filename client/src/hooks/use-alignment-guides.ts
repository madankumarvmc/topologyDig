import { useState, useCallback } from 'react';
import { Node, NodeChange } from 'reactflow';
import { NodeData } from '@/lib/constants';

interface AlignmentLines {
  x: number[];
  y: number[];
}

const ALIGNMENT_THRESHOLD = 8; // pixels

export function useAlignmentGuides(nodes: Node<NodeData>[]) {
  const [alignmentLines, setAlignmentLines] = useState<AlignmentLines>({ x: [], y: [] });
  const [draggedNode, setDraggedNode] = useState<Node<NodeData> | null>(null);

  const calculateAlignmentLines = useCallback((draggedNodeId: string, newPosition: { x: number; y: number }) => {
    const otherNodes = nodes.filter(node => node.id !== draggedNodeId && node.type !== 'textbox');
    const alignedX: number[] = [];
    const alignedY: number[] = [];

    // Node dimensions (approximate center calculation)
    const nodeWidth = 64; // Approximate node width
    const nodeHeight = 64; // Approximate node height
    const draggedCenterX = newPosition.x + nodeWidth / 2;
    const draggedCenterY = newPosition.y + nodeHeight / 2;
    const draggedLeft = newPosition.x;
    const draggedRight = newPosition.x + nodeWidth;
    const draggedTop = newPosition.y;
    const draggedBottom = newPosition.y + nodeHeight;

    otherNodes.forEach(node => {
      const nodeCenterX = node.position.x + nodeWidth / 2;
      const nodeCenterY = node.position.y + nodeHeight / 2;
      const nodeLeft = node.position.x;
      const nodeRight = node.position.x + nodeWidth;
      const nodeTop = node.position.y;
      const nodeBottom = node.position.y + nodeHeight;

      // Vertical alignment checks
      if (Math.abs(draggedCenterX - nodeCenterX) <= ALIGNMENT_THRESHOLD) {
        alignedX.push(nodeCenterX);
      } else if (Math.abs(draggedLeft - nodeLeft) <= ALIGNMENT_THRESHOLD) {
        alignedX.push(nodeLeft);
      } else if (Math.abs(draggedRight - nodeRight) <= ALIGNMENT_THRESHOLD) {
        alignedX.push(nodeRight);
      } else if (Math.abs(draggedLeft - nodeCenterX) <= ALIGNMENT_THRESHOLD) {
        alignedX.push(nodeCenterX);
      } else if (Math.abs(draggedRight - nodeCenterX) <= ALIGNMENT_THRESHOLD) {
        alignedX.push(nodeCenterX);
      }

      // Horizontal alignment checks
      if (Math.abs(draggedCenterY - nodeCenterY) <= ALIGNMENT_THRESHOLD) {
        alignedY.push(nodeCenterY);
      } else if (Math.abs(draggedTop - nodeTop) <= ALIGNMENT_THRESHOLD) {
        alignedY.push(nodeTop);
      } else if (Math.abs(draggedBottom - nodeBottom) <= ALIGNMENT_THRESHOLD) {
        alignedY.push(nodeBottom);
      } else if (Math.abs(draggedTop - nodeCenterY) <= ALIGNMENT_THRESHOLD) {
        alignedY.push(nodeCenterY);
      } else if (Math.abs(draggedBottom - nodeCenterY) <= ALIGNMENT_THRESHOLD) {
        alignedY.push(nodeCenterY);
      }
    });

    // Remove duplicates
    const uniqueX = alignedX.filter((value, index, self) => self.indexOf(value) === index);
    const uniqueY = alignedY.filter((value, index, self) => self.indexOf(value) === index);

    setAlignmentLines({ x: uniqueX, y: uniqueY });
  }, [nodes]);

  const snapToAlignment = useCallback((draggedNodeId: string, position: { x: number; y: number }) => {
    const otherNodes = nodes.filter(node => node.id !== draggedNodeId && node.type !== 'textbox');
    let snappedX = position.x;
    let snappedY = position.y;

    const nodeWidth = 64;
    const nodeHeight = 64;
    const draggedCenterX = position.x + nodeWidth / 2;
    const draggedCenterY = position.y + nodeHeight / 2;

    otherNodes.forEach(node => {
      const nodeCenterX = node.position.x + nodeWidth / 2;
      const nodeCenterY = node.position.y + nodeHeight / 2;

      // Snap to center alignment
      if (Math.abs(draggedCenterX - nodeCenterX) <= ALIGNMENT_THRESHOLD) {
        snappedX = nodeCenterX - nodeWidth / 2;
      }
      if (Math.abs(draggedCenterY - nodeCenterY) <= ALIGNMENT_THRESHOLD) {
        snappedY = nodeCenterY - nodeHeight / 2;
      }

      // Snap to edge alignment
      if (Math.abs(position.x - node.position.x) <= ALIGNMENT_THRESHOLD) {
        snappedX = node.position.x;
      }
      if (Math.abs(position.y - node.position.y) <= ALIGNMENT_THRESHOLD) {
        snappedY = node.position.y;
      }
    });

    return { x: snappedX, y: snappedY };
  }, [nodes]);

  const onNodeDrag = useCallback((nodeId: string, position: { x: number; y: number }) => {
    const draggedNodeObj = nodes.find(node => node.id === nodeId);
    if (draggedNodeObj) {
      setDraggedNode(draggedNodeObj);
      calculateAlignmentLines(nodeId, position);
    }
  }, [nodes, calculateAlignmentLines]);

  const onNodeDragStop = useCallback(() => {
    setDraggedNode(null);
    setAlignmentLines({ x: [], y: [] });
  }, []);

  const processNodeChanges = useCallback((changes: NodeChange[]) => {
    const dragChanges = changes.filter(change => change.type === 'position' && change.dragging);
    
    if (dragChanges.length > 0) {
      const change = dragChanges[0];
      if (change.type === 'position' && change.position && change.dragging) {
        onNodeDrag(change.id, change.position);
        
        // Apply snapping
        const snappedPosition = snapToAlignment(change.id, change.position);
        if (snappedPosition.x !== change.position.x || snappedPosition.y !== change.position.y) {
          change.position = snappedPosition;
        }
      }
    } else {
      // Check if drag ended
      const positionChanges = changes.filter(change => change.type === 'position' && !change.dragging);
      if (positionChanges.length > 0) {
        onNodeDragStop();
      }
    }

    return changes;
  }, [onNodeDrag, onNodeDragStop, snapToAlignment]);

  return {
    alignmentLines,
    draggedNode,
    processNodeChanges,
  };
}