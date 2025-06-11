import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/lib/constants';

const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const getNodeStyle = () => {
    const baseStyle = "w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 relative";
    
    switch (data.type) {
      case 'simple':
        return `${baseStyle} rounded-full bg-gray-100 border-2 border-gray-400 ${
          selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'
        }`;
      case 'scanner':
        return `${baseStyle} bg-green-100 border-2 border-green-500 ${
          selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'
        }`;
      case 'eject':
        return `${baseStyle} rounded bg-orange-100 border-2 border-orange-500 ${
          selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'
        }`;
      default:
        return `${baseStyle} rounded-full bg-gray-100 border-2 border-gray-400`;
    }
  };

  const getNodeShape = () => {
    if (data.type === 'scanner') {
      return {
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
      };
    }
    return {};
  };

  const getAttributeLabels = () => {
    const attrs = data.attrs || {};
    const labels: string[] = [];
    
    if (attrs.junction === "true") labels.push("junction");
    if (attrs.ptlFeed === "true") labels.push("ptlFeed");
    if (attrs.blockedHU === "true") labels.push("blockedHU");
    if (attrs.emptyHU === "true") labels.push("emptyHU");
    if (attrs.misc === "true") labels.push("misc");
    if (attrs.noEligibleZone === "true") labels.push("noEligibleZone");
    if (attrs.qc === "true") labels.push("qc");
    if (attrs.sblFeed === "true") labels.push("sblFeed");
    if (attrs.packedCHU === "true") labels.push("packedCHU");
    if (attrs.emptyPackedCHU === "true") labels.push("emptyPackedCHU");
    if (attrs.ptlFeedControl === "true") labels.push("ptlFeedControl");
    if (attrs.xdockMapping) labels.push("xdockMapping");
    
    return labels;
  };

  const attributeLabels = getAttributeLabels();

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div className={getNodeStyle()} style={getNodeShape()}>
        <span className="text-xs font-medium text-gray-700 select-none">
          {data.code}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      
      {/* Attribute labels */}
      {attributeLabels.length > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-10">
          <div className="bg-white border border-gray-300 rounded px-2 py-1 shadow-sm">
            <div className="text-xs text-gray-600 whitespace-nowrap">
              {attributeLabels.join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
