import { memo } from 'react';
import { Node } from 'reactflow';
import { NodeData } from '@/lib/constants';

interface AlignmentGuidesProps {
  nodes: Node<NodeData>[];
  draggedNode: Node<NodeData> | null;
  alignmentLines: {
    x: number[];
    y: number[];
  };
}

const AlignmentGuides = memo(({ nodes, draggedNode, alignmentLines }: AlignmentGuidesProps) => {
  if (!draggedNode || (!alignmentLines.x.length && !alignmentLines.y.length)) {
    return null;
  }

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <defs>
        <pattern id="dash" patternUnits="userSpaceOnUse" width="8" height="8">
          <line x1="0" y1="0" x2="4" y2="0" stroke="#ff6b6b" strokeWidth="1" />
        </pattern>
      </defs>
      
      {/* Vertical alignment lines */}
      {alignmentLines.x.map((x, index) => (
        <line
          key={`v-${index}`}
          x1={x}
          y1={0}
          x2={x}
          y2="100%"
          stroke="#ff6b6b"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.8"
        />
      ))}
      
      {/* Horizontal alignment lines */}
      {alignmentLines.y.map((y, index) => (
        <line
          key={`h-${index}`}
          x1={0}
          y1={y}
          x2="100%"
          y2={y}
          stroke="#ff6b6b"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.8"
        />
      ))}
    </svg>
  );
});

AlignmentGuides.displayName = 'AlignmentGuides';

export default AlignmentGuides;