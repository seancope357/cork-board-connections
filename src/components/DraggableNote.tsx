import { useState, useRef, useEffect } from 'react';
import { Trash2, Link, Paperclip, Tag, FileText, Calendar } from 'lucide-react';

interface DraggableNoteProps {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  thumbtackColor: string;
  files: { name: string; url: string }[];
  metadata: any;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onContentChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onConnect: (id: string) => void;
  onEdit: (id: string) => void;
  isConnecting: boolean;
  canConnect?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
  zoom?: number;
  pan?: { x: number; y: number };
}

export function DraggableNote({
  id,
  content,
  x,
  y,
  width,
  height,
  color,
  thumbtackColor,
  files,
  metadata,
  onMove,
  onResize,
  onContentChange,
  onDelete,
  onConnect,
  onEdit,
  isConnecting,
  canConnect = false,
  containerRef,
  zoom = 1,
  pan = { x: 0, y: 0 },
}: DraggableNoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);

  const hasFiles = files && files.length > 0;
  const hasTags = metadata?.tags && metadata.tags.length > 0;
  const hasTitle = metadata?.title && metadata.title.trim() !== '';
  const hasDate = metadata?.date && metadata.date.trim() !== '';
  const hasMetadata = hasTitle || hasTags || hasDate || Object.keys(metadata || {}).length > 0;

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number) => {
    if (!containerRef?.current) {
      return { x: screenX, y: screenY };
    }
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = screenX - rect.left;
    const relativeY = screenY - rect.top;
    return {
      x: (relativeX - pan.x) / zoom,
      y: (relativeY - pan.y) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }

    // Check for double click to open editor
    if (e.detail === 2) {
      onEdit(id);
      return;
    }

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setIsDragging(true);
    setOffset({
      x: canvasPos.x - x,
      y: canvasPos.y - y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setIsResizing(true);
    setResizeDirection(direction);
    setOffset({
      x: canvasPos.x,
      y: canvasPos.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        onMove(id, canvasPos.x - offset.x, canvasPos.y - offset.y);
      } else if (isResizing) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        const deltaX = (canvasPos.x - offset.x);
        const deltaY = (canvasPos.y - offset.y);
        
        let newWidth = width;
        let newHeight = height;
        
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(150, width + deltaX);
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(100, height + deltaY);
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(150, width - deltaX);
          if (newWidth !== width) {
            onMove(id, x + deltaX, y);
          }
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(100, height - deltaY);
          if (newHeight !== height) {
            onMove(id, x, y + deltaY);
          }
        }

        onResize(id, newWidth, newHeight);
        setOffset({ x: canvasPos.x, y: canvasPos.y });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, offset, id, onMove, onResize, width, height, x, y, resizeDirection]);

  const getColorClasses = (colorName: string) => {
    const colors: Record<string, { bg: string; border: string }> = {
      yellow: { bg: 'bg-yellow-200', border: 'border-yellow-300' },
      pink: { bg: 'bg-pink-200', border: 'border-pink-300' },
      blue: { bg: 'bg-blue-200', border: 'border-blue-300' },
      green: { bg: 'bg-green-200', border: 'border-green-300' },
      purple: { bg: 'bg-purple-200', border: 'border-purple-300' },
      orange: { bg: 'bg-orange-200', border: 'border-orange-300' },
    };
    return colors[colorName] || colors.yellow;
  };

  const getThumbtackColorClass = (colorName: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-600 border-red-700',
      blue: 'bg-blue-600 border-blue-700',
      green: 'bg-green-600 border-green-700',
      yellow: 'bg-yellow-500 border-yellow-600',
      purple: 'bg-purple-600 border-purple-700',
      black: 'bg-black border-neutral-800',
    };
    return colors[colorName] || colors.red;
  };

  const noteColors = getColorClasses(color);
  const thumbtackClass = getThumbtackColorClass(thumbtackColor);

  return (
    <div
      ref={noteRef}
      className="absolute cursor-move group"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        transform: isDragging ? 'rotate(-1deg) scale(1.05)' : 'rotate(-2deg)',
        transition: isDragging || isResizing ? 'none' : 'transform 0.1s',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Push Pin */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-lg z-10 border-2 ${thumbtackClass}`} />
      
      {/* Note */}
      <div className={`${noteColors.bg} shadow-xl p-4 w-full h-full border ${noteColors.border} transition-all relative ${
        isConnecting ? 'ring-4 ring-red-500 ring-offset-2 shadow-2xl shadow-red-500/50' : ''
      } ${
        canConnect ? 'ring-4 ring-green-400 ring-offset-2 animate-pulse cursor-pointer' : ''
      }`}>
        {isEditing ? (
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none"
            value={content}
            onChange={(e) => onContentChange(id, e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <div
            className="w-full h-full overflow-auto break-words cursor-text pb-6"
            onDoubleClick={() => setIsEditing(true)}
          >
            {content}
          </div>
        )}
        
        {/* Professional Indicators */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {hasFiles && (
            <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1" title={`${files.length} file(s) attached`}>
              <Paperclip className="w-3 h-3" />
              <span>{files.length}</span>
            </div>
          )}
          {hasTags && (
            <div className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1" title={metadata.tags.join(', ')}>
              <Tag className="w-3 h-3" />
              <span>{metadata.tags.length}</span>
            </div>
          )}
          {hasTitle && (
            <div className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1" title={metadata.title}>
              <FileText className="w-3 h-3" />
            </div>
          )}
          {hasDate && (
            <div className="bg-orange-600 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1" title={metadata.date}>
              <Calendar className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
      
      {/* Connection points indicator when in connect mode */}
      {canConnect && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
          <div className="absolute w-3 h-3 bg-green-500 rounded-full" />
        </div>
      )}

      {/* Resize Handles */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Corners */}
        <div 
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-neutral-600 border border-white rounded-sm cursor-se-resize z-20"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-neutral-600 border border-white rounded-sm cursor-ne-resize z-20"
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        <div 
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-neutral-600 border border-white rounded-sm cursor-sw-resize z-20"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        <div 
          className="absolute -top-1 -left-1 w-3 h-3 bg-neutral-600 border border-white rounded-sm cursor-nw-resize z-20"
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        
        {/* Edges */}
        <div 
          className="absolute top-0 right-0 w-1 h-full cursor-e-resize z-20"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-1 cursor-s-resize z-20"
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
      </div>

      {/* Action buttons */}
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConnect(id);
          }}
          title={isConnecting ? "Click to cancel" : "Click to start connecting"}
          className={`p-1.5 rounded shadow-lg transition-all ${
            isConnecting 
              ? 'bg-red-600 text-white scale-110 animate-pulse' 
              : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:scale-110'
          }`}
        >
          <Link className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          title="Delete note"
          className="p-1.5 bg-white text-red-600 rounded hover:bg-red-50 hover:scale-110 shadow-lg transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
