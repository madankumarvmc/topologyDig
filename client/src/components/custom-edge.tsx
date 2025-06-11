import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

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
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = {
    stroke: style.stroke || '#666',
    strokeWidth: style.strokeWidth || 2,
    strokeDasharray: style.strokeDasharray,
    ...style,
  };

  if (selected) {
    edgeStyle.stroke = '#3b82f6';
    edgeStyle.strokeWidth = 3;
  }

  return (
    <>
      <path
        id={id}
        style={edgeStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
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
