import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface TextBoxData {
  text: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textAlign: string;
  color: string;
  backgroundColor: string;
  width: number;
  height: number;
}

const TextBoxNode = memo(({ data, selected, id }: NodeProps<TextBoxData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.text || 'Text');
  const [showFormatting, setShowFormatting] = useState(selected);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setShowFormatting(selected);
  }, [selected]);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      textRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };

  const handleTextSubmit = () => {
    setIsEditing(false);
    // Update node data through the store
    window.dispatchEvent(new CustomEvent('updateTextNode', {
      detail: { id, text: editText }
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(data.text || 'Text');
    }
  };

  const toggleStyle = (property: string, value: string, currentValue: string) => {
    const newValue = currentValue === value ? 'normal' : value;
    window.dispatchEvent(new CustomEvent('updateTextNodeStyle', {
      detail: { id, property, value: newValue }
    }));
  };

  const updateProperty = (property: string, value: any) => {
    window.dispatchEvent(new CustomEvent('updateTextNodeStyle', {
      detail: { id, property, value }
    }));
  };

  const textStyle = {
    fontSize: `${data.fontSize || 14}px`,
    fontWeight: data.fontWeight || 'normal',
    fontStyle: data.fontStyle || 'normal',
    textDecoration: data.textDecoration || 'none',
    textAlign: (data.textAlign || 'left') as 'left' | 'center' | 'right',
    color: data.color || '#000000',
    backgroundColor: data.backgroundColor || 'transparent',
    width: `${data.width || 150}px`,
    height: `${data.height || 40}px`,
  };

  return (
    <div className="relative">
      {/* Text Content */}
      <div
        className={`border-2 border-dashed ${selected ? 'border-blue-400' : 'border-transparent'} rounded p-2 cursor-text hover:border-gray-300 transition-colors min-w-[100px] min-h-[30px] flex items-center justify-center relative`}
        onDoubleClick={handleDoubleClick}
        style={textStyle}
      >
        {isEditing ? (
          <textarea
            ref={textRef}
            value={editText}
            onChange={handleTextChange}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyDown}
            className="w-full h-full resize-none border-none outline-none bg-transparent"
            style={{
              fontSize: textStyle.fontSize,
              fontWeight: textStyle.fontWeight,
              fontStyle: textStyle.fontStyle,
              textDecoration: textStyle.textDecoration,
              textAlign: textStyle.textAlign,
              color: textStyle.color,
            }}
          />
        ) : (
          <div
            className="w-full h-full overflow-hidden whitespace-pre-wrap"
            style={textStyle}
          >
            {data.text || 'Text'}
          </div>
        )}
        
        {/* Resize Handles */}
        {selected && (
          <>
            {/* Corner resize handle */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-70 hover:opacity-100 rounded-tl"
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = data.width || 150;
                const startHeight = data.height || 40;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newWidth = Math.max(100, startWidth + (e.clientX - startX));
                  const newHeight = Math.max(30, startHeight + (e.clientY - startY));
                  updateProperty('width', newWidth);
                  updateProperty('height', newHeight);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            
            {/* Right edge resize handle */}
            <div
              className="absolute top-2 bottom-2 right-0 w-1 bg-blue-500 cursor-e-resize opacity-50 hover:opacity-100"
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startWidth = data.width || 150;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newWidth = Math.max(100, startWidth + (e.clientX - startX));
                  updateProperty('width', newWidth);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            
            {/* Bottom edge resize handle */}
            <div
              className="absolute bottom-0 left-2 right-2 h-1 bg-blue-500 cursor-s-resize opacity-50 hover:opacity-100"
              onMouseDown={(e) => {
                e.stopPropagation();
                const startY = e.clientY;
                const startHeight = data.height || 40;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newHeight = Math.max(30, startHeight + (e.clientY - startY));
                  updateProperty('height', newHeight);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </>
        )}
      </div>

      {/* Formatting Toolbar */}
      {showFormatting && (
        <div className="absolute -top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex items-center space-x-1 z-50">
          <Select
            value={data.fontSize?.toString() || "14"}
            onValueChange={(value) => updateProperty('fontSize', parseInt(value))}
          >
            <SelectTrigger className="w-16 h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="24">24</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={data.fontWeight === 'bold' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => toggleStyle('fontWeight', 'bold', data.fontWeight || 'normal')}
          >
            <Bold className="h-3 w-3" />
          </Button>

          <Button
            variant={data.fontStyle === 'italic' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => toggleStyle('fontStyle', 'italic', data.fontStyle || 'normal')}
          >
            <Italic className="h-3 w-3" />
          </Button>

          <Button
            variant={data.textDecoration === 'underline' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => toggleStyle('textDecoration', 'underline', data.textDecoration || 'none')}
          >
            <Underline className="h-3 w-3" />
          </Button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          <Button
            variant={data.textAlign === 'left' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateProperty('textAlign', 'left')}
          >
            <AlignLeft className="h-3 w-3" />
          </Button>

          <Button
            variant={data.textAlign === 'center' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateProperty('textAlign', 'center')}
          >
            <AlignCenter className="h-3 w-3" />
          </Button>

          <Button
            variant={data.textAlign === 'right' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateProperty('textAlign', 'right')}
          >
            <AlignRight className="h-3 w-3" />
          </Button>

          <input
            type="color"
            value={data.color || '#000000'}
            onChange={(e) => updateProperty('color', e.target.value)}
            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
            title="Text Color"
          />
        </div>
      )}
    </div>
  );
});

TextBoxNode.displayName = 'TextBoxNode';

export default TextBoxNode;