import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Button } from "@/components/ui/button";
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
  const [editText, setEditText] = useState(data.text || '');
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Sync editText with data.text when data changes
  useEffect(() => {
    if (!isEditing) {
      setEditText(data.text || '');
    }
  }, [data.text, isEditing]);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      if (!data.text || data.text === '') {
        textRef.current.setSelectionRange(0, 0);
      } else {
        textRef.current.select();
      }
    }
  }, [isEditing]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
    }
  }, [isEditing]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditText(newText);
  }, []);

  const handleTextSubmit = useCallback(() => {
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('updateTextNode', {
      detail: { id, text: editText }
    }));
  }, [id, editText]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(data.text || '');
    }
  }, [handleTextSubmit, data.text]);

  const updateProperty = useCallback((property: string, value: any) => {
    window.dispatchEvent(new CustomEvent('updateTextNodeStyle', {
      detail: { id, property, value }
    }));
  }, [id]);

  const toggleStyle = useCallback((property: string, value: string, currentValue: string) => {
    updateProperty(property, currentValue === value ? 'normal' : value);
  }, [updateProperty]);

  // Create resize handler
  const createResizeHandler = useCallback((direction: string) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = data.width || 150;
      const startHeight = data.height || 40;
      
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        switch (direction) {
          case 'nw':
            newWidth = Math.max(80, startWidth - deltaX);
            newHeight = Math.max(30, startHeight - deltaY);
            break;
          case 'ne':
            newWidth = Math.max(80, startWidth + deltaX);
            newHeight = Math.max(30, startHeight - deltaY);
            break;
          case 'sw':
            newWidth = Math.max(80, startWidth - deltaX);
            newHeight = Math.max(30, startHeight + deltaY);
            break;
          case 'se':
            newWidth = Math.max(80, startWidth + deltaX);
            newHeight = Math.max(30, startHeight + deltaY);
            break;
        }
        
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
      document.body.style.cursor = `${direction}-resize`;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
  }, [data.width, data.height, updateProperty]);

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
        className={`border-2 border-dashed ${selected ? 'border-blue-400' : 'border-transparent'} rounded p-2 cursor-text hover:border-gray-300 transition-colors min-w-[80px] min-h-[30px] flex items-center justify-center relative`}
        onClick={handleClick}
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
            placeholder="Type here..."
          />
        ) : (
          <div
            className="w-full h-full overflow-hidden whitespace-pre-wrap"
            style={{
              fontSize: textStyle.fontSize,
              fontWeight: textStyle.fontWeight,
              fontStyle: textStyle.fontStyle,
              textDecoration: textStyle.textDecoration,
              textAlign: textStyle.textAlign,
              color: textStyle.color,
            }}
          >
            {data.text || (
              <span className="text-gray-400 italic">Click to add text</span>
            )}
          </div>
        )}
        
        {/* Resize Handles */}
        {selected && !isEditing && (
          <>
            {/* Top-left corner */}
            <div
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize rounded-sm z-50 hover:bg-blue-600"
              onMouseDown={createResizeHandler('nw')}
            />
            
            {/* Top-right corner */}
            <div
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize rounded-sm z-50 hover:bg-blue-600"
              onMouseDown={createResizeHandler('ne')}
            />
            
            {/* Bottom-left corner */}
            <div
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize rounded-sm z-50 hover:bg-blue-600"
              onMouseDown={createResizeHandler('sw')}
            />
            
            {/* Bottom-right corner */}
            <div
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white cursor-se-resize rounded-sm z-50 hover:bg-blue-600"
              onMouseDown={createResizeHandler('se')}
            />
          </>
        )}
      </div>

      {/* Formatting Toolbar */}
      {selected && (
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

          <input
            type="color"
            value={data.backgroundColor || '#ffffff'}
            onChange={(e) => updateProperty('backgroundColor', e.target.value)}
            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
            title="Background Color"
          />
        </div>
      )}
    </div>
  );
});

TextBoxNode.displayName = 'TextBoxNode';

export default TextBoxNode;