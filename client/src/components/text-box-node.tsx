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
    // Auto-resize based on content
    autoResizeToFitText(e.target.value);
  };

  const autoResizeToFitText = (text: string) => {
    if (!text || text.length === 0) return;
    
    // Create a temporary element to measure text
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.fontSize = `${data.fontSize || 14}px`;
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontWeight = data.fontWeight || 'normal';
    tempDiv.style.fontStyle = data.fontStyle || 'normal';
    tempDiv.style.padding = '8px';
    tempDiv.style.border = '2px solid transparent';
    tempDiv.textContent = text;
    
    document.body.appendChild(tempDiv);
    
    const measuredWidth = tempDiv.offsetWidth;
    const measuredHeight = tempDiv.offsetHeight;
    
    document.body.removeChild(tempDiv);
    
    const newWidth = Math.max(100, measuredWidth + 10);
    const newHeight = Math.max(40, measuredHeight + 10);
    
    updateProperty('width', newWidth);
    updateProperty('height', newHeight);
  };

  const handleTextSubmit = () => {
    setIsEditing(false);
    // Update node data through the store
    window.dispatchEvent(new CustomEvent('updateTextNode', {
      detail: { id, text: editText }
    }));
    // Auto-resize after editing is complete
    autoResizeToFitText(editText);
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
        
        {/* Figjam-style Resize Handles */}
        {selected && (
          <>
            {/* Top-left corner */}
            <div
              className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white cursor-nw-resize rounded-sm z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = data.width || 150;
                const startHeight = data.height || 40;
                
                const handleMouseMove = (e: MouseEvent) => {
                  e.preventDefault();
                  const deltaX = e.clientX - startX;
                  const deltaY = e.clientY - startY;
                  const newWidth = Math.max(80, startWidth - deltaX);
                  const newHeight = Math.max(30, startHeight - deltaY);
                  updateProperty('width', newWidth);
                  updateProperty('height', newHeight);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  document.body.style.userSelect = '';
                  document.body.style.cursor = '';
                };
                
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'nw-resize';
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            
            {/* Top-right corner */}
            <div
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white cursor-ne-resize rounded-sm z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = data.width || 150;
                const startHeight = data.height || 40;
                
                const handleMouseMove = (e: MouseEvent) => {
                  e.preventDefault();
                  const deltaX = e.clientX - startX;
                  const deltaY = e.clientY - startY;
                  const newWidth = Math.max(80, startWidth + deltaX);
                  const newHeight = Math.max(30, startHeight - deltaY);
                  updateProperty('width', newWidth);
                  updateProperty('height', newHeight);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  document.body.style.userSelect = '';
                  document.body.style.cursor = '';
                };
                
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'ne-resize';
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            
            {/* Bottom-left corner */}
            <div
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white cursor-sw-resize rounded-sm z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = data.width || 150;
                const startHeight = data.height || 40;
                
                const handleMouseMove = (e: MouseEvent) => {
                  e.preventDefault();
                  const deltaX = e.clientX - startX;
                  const deltaY = e.clientY - startY;
                  const newWidth = Math.max(80, startWidth - deltaX);
                  const newHeight = Math.max(30, startHeight + deltaY);
                  updateProperty('width', newWidth);
                  updateProperty('height', newHeight);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  document.body.style.userSelect = '';
                  document.body.style.cursor = '';
                };
                
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'sw-resize';
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            
            {/* Bottom-right corner */}
            <div
              className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white cursor-se-resize rounded-sm z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = data.width || 150;
                const startHeight = data.height || 40;
                
                const handleMouseMove = (e: MouseEvent) => {
                  e.preventDefault();
                  const deltaX = e.clientX - startX;
                  const deltaY = e.clientY - startY;
                  const newWidth = Math.max(80, startWidth + deltaX);
                  const newHeight = Math.max(30, startHeight + deltaY);
                  updateProperty('width', newWidth);
                  updateProperty('height', newHeight);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  document.body.style.userSelect = '';
                  document.body.style.cursor = '';
                };
                
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'se-resize';
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