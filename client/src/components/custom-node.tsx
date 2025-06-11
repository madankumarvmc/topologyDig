import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/lib/constants';

const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const getNodeStyle = () => {
    const baseStyle = "w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-200 relative";
    const selectedStyle = selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md';
    
    switch (data.type) {
      case 'simple':
        // Circle - Gray filled
        return `${baseStyle} rounded-full bg-gray-200 border-2 border-gray-500 ${selectedStyle}`;
      case 'scanner':
        // Diamond - Green filled
        return `${baseStyle} bg-green-200 border-2 border-green-600 transform rotate-45 ${selectedStyle}`;
      case 'eject':
        // Box - Orange filled
        return `${baseStyle} rounded bg-orange-200 border-2 border-orange-600 ${selectedStyle}`;
      case 'special':
        // Double circle - Yellow/Cyan filled for V-nodes
        const isVNode = data.code.startsWith('V');
        const bgColor = isVNode && parseInt(data.code.slice(1)) > 30 ? 'bg-cyan-200 border-cyan-600' : 'bg-yellow-200 border-yellow-600';
        return `${baseStyle} rounded-full ${bgColor} border-4 border-double ${selectedStyle}`;
      case 'sblfeed':
        // Square - Light blue filled
        return `${baseStyle} rounded-none bg-blue-100 border-2 border-blue-500 ${selectedStyle}`;
      default:
        return `${baseStyle} rounded-full bg-gray-200 border-2 border-gray-500`;
    }
  };

  const getContentStyle = () => {
    // Counter-rotate content for diamond shapes
    if (data.type === 'scanner') {
      return { transform: 'rotate(-45deg)' };
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
      <div className={getNodeStyle()}>
        <div style={getContentStyle()} className="text-center">
          <span className="text-xs font-bold text-gray-800 select-none block leading-tight">
            {data.code}
          </span>
          {attributeLabels.length > 0 && (
            <span className="text-[10px] text-gray-600 select-none block leading-none mt-1">
              {attributeLabels.slice(0, 2).join(' ')}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
