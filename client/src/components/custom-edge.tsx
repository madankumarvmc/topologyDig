import { memo, useCallback } from 'react';
import { EdgeProps, EdgeLabelRenderer, getStraightPath } from 'reactflow';

interface EdgeData {
  pathType?: 'straight' | 'lshaped';
  midPoints?: Array<{ x: number; y: number }>;
  distance?: number;
  attrs?: Record<string, any>;
  default?: boolean;
  capacity?: number;
}

const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  data,
}: EdgeProps<EdgeData>) => {
  // Determine path type - default to L-shaped for better routing
  const pathType = data?.pathType || 'lshaped';
  
  // Calculate path based on type
  const calculatePath = useCallback((type: string) => {
    if (type === 'straight') {
      const [straightPath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
      return straightPath;
    } else {
      // L-shaped path - choose direction based on distance
      const deltaX = Math.abs(targetX - sourceX);
      const deltaY = Math.abs(targetY - sourceY);
      
      if (deltaX > deltaY) {
        // Horizontal first, then vertical
        const midX = targetX;
        return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${targetX} ${targetY}`;
      } else {
        // Vertical first, then horizontal  
        const midY = targetY;
        return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${targetY}`;
      }
    }
  }, [sourceX, sourceY, targetX, targetY]);

  const edgePath = calculatePath(pathType);
  
  // Calculate label position (midpoint of path)
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const edgeStyle = {
    stroke: style.stroke || '#666',
    strokeWidth: style.strokeWidth || 2,
    strokeDasharray: style.strokeDasharray,
    cursor: 'pointer',
    ...style,
  };

  if (selected) {
    edgeStyle.stroke = '#3b82f6';
    edgeStyle.strokeWidth = 3;
  }

  // Create control handles for selected L-shaped edges
  const controlHandles = [];
  if (selected && pathType === 'lshaped') {
    const deltaX = Math.abs(targetX - sourceX);
    const deltaY = Math.abs(targetY - sourceY);
    
    let controlX, controlY;
    if (deltaX > deltaY) {
      // Control point for horizontal-first L-shape
      controlX = targetX;
      controlY = sourceY;
    } else {
      // Control point for vertical-first L-shape
      controlX = sourceX;
      controlY = targetY;
    }

    controlHandles.push(
      <g key="control-handle">
        <circle
          cx={controlX}
          cy={controlY}
          r="6"
          fill="white"
          stroke="#3b82f6"
          strokeWidth="2"
          className="cursor-move"
          style={{ pointerEvents: 'all' }}
        />
        <circle
          cx={controlX}
          cy={controlY}
          r="3"
          fill="#3b82f6"
          className="cursor-move"
          style={{ pointerEvents: 'all' }}
        />
      </g>
    );
  }

  return (
    <>
      <defs>
        <linearGradient id={`flow-gradient-${id}`} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="20%" stopColor={selected ? '#3b82f6' : '#666'} stopOpacity="0.3" />
          <stop offset="50%" stopColor={selected ? '#3b82f6' : '#666'} stopOpacity="0.8" />
          <stop offset="80%" stopColor={selected ? '#3b82f6' : '#666'} stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="0 0; 100 0; 0 0"
            dur="2s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      
      {/* Main edge path */}
      <path
        id={id}
        style={edgeStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
      />
      
      {/* Animated flowing dots overlay */}
      <path
        style={{
          stroke: `url(#flow-gradient-${id})`,
          strokeWidth: 6,
          strokeDasharray: '10 5',
          strokeLinecap: 'round',
          strokeDashoffset: '0',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        pointerEvents="none"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-15"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      
      {controlHandles}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="bg-white border border-gray-300 rounded px-2 py-1 shadow-sm"
          >
            <span className="text-xs text-gray-700">{label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';

export default CustomEdge;
