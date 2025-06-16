import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/lib/constants';

const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const getNodeStyle = () => {
    const baseStyle = "w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-200 relative";
    const selectedStyle = selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md';
    
    switch (data.type) {
      case 'simple':
        // Circle - Grey
        return `${baseStyle} rounded-full bg-gray-300 border-2 border-gray-600 ${selectedStyle}`;
      case 'scanner':
        // Diamond - Darker Green
        return `${baseStyle} bg-green-400 border-2 border-green-700 transform rotate-45 ${selectedStyle}`;
      case 'eject':
        // Box - Stronger Orange
        return `${baseStyle} rounded bg-orange-400 border-2 border-orange-700 ${selectedStyle}`;
      case 'feed':
        // Square Box - Blue (sblFeed nodes)
        return `${baseStyle} rounded-none bg-blue-300 border-2 border-blue-600 ${selectedStyle}`;
      case 'ptlzone':
        // Double Circle - Amber (better contrast)
        return `${baseStyle} rounded-full bg-amber-400 border-4 border-double border-amber-700 ${selectedStyle}`;
      case 'sblzone':
        // Double Circle - Sky Blue (better contrast)
        return `${baseStyle} rounded-full bg-sky-300 border-4 border-double border-sky-600 ${selectedStyle}`;
      case 'asrs-infeed':
        // Rectangle - Purple (ASRS Infeed)
        return `${baseStyle} rounded bg-purple-200 border-2 border-purple-600 ${selectedStyle}`;
      case 'asrs-eject':
        // Rectangle - Purple (ASRS Eject)
        return `${baseStyle} rounded bg-purple-200 border-2 border-purple-600 ${selectedStyle}`;
      default:
        return `${baseStyle} rounded-full bg-gray-300 border-2 border-gray-600`;
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
