import { memo } from 'react';
import { EdgeProps, getBezierPath, getSmoothStepPath, EdgeLabelRenderer, Position } from 'reactflow';

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
  pathOptions,
  source,
  target,
}: EdgeProps) => {
  // Calculate distance between nodes
  const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
  
  // Detect potential loops (edges going back to nearby nodes)
  const isLoop = source === target;
  const isNearbyConnection = distance < 200;
  
  let edgePath: string;
  let labelX: number;
  let labelY: number;
  
  if (isLoop) {
    // Create a self-loop with a circular path
    const loopSize = 50;
    const cx = sourceX + loopSize;
    const cy = sourceY - loopSize;
    edgePath = `M ${sourceX} ${sourceY} 
                C ${sourceX + loopSize} ${sourceY - loopSize/2}, 
                  ${sourceX + loopSize} ${sourceY - loopSize*1.5}, 
                  ${sourceX} ${sourceY - loopSize*2}
                C ${sourceX - loopSize} ${sourceY - loopSize*1.5}, 
                  ${sourceX - loopSize} ${sourceY - loopSize/2}, 
                  ${sourceX} ${sourceY}`;
    labelX = sourceX;
    labelY = sourceY - loopSize;
  } else if (isNearbyConnection) {
    // For nearby connections, create curved paths to avoid visual overlap
    const offset = Math.max(30, 200 - distance); // Larger offset for closer nodes
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
    const perpAngle = angle + Math.PI / 2;
    
    // Create deterministic offset based on edge ID to avoid multiple edges overlapping
    const hashCode = id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const normalizedHash = (hashCode % 100) / 100; // 0 to 1
    const edgeOffset = (normalizedHash - 0.5) * offset * 2; // -offset to +offset
    
    const offsetX = Math.cos(perpAngle) * edgeOffset;
    const offsetY = Math.sin(perpAngle) * edgeOffset;
    
    const controlPointX = (sourceX + targetX) / 2 + offsetX;
    const controlPointY = (sourceY + targetY) / 2 + offsetY;
    
    edgePath = `M ${sourceX} ${sourceY} Q ${controlPointX} ${controlPointY} ${targetX} ${targetY}`;
    labelX = controlPointX;
    labelY = controlPointY;
  } else {
    // Use smooth step path for distant connections
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: pathOptions?.borderRadius || 15,
      offset: pathOptions?.offset || 30,
    });
  }

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
