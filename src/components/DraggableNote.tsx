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
    const colors: Record<string, { bg: string; border: string; shadow: string; accent: string }> = {
      yellow: {
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
        border: 'border-amber-200',
        shadow: 'shadow-amber-200/50',
        accent: 'bg-amber-500'
      },
      pink: {
        bg: 'bg-gradient-to-br from-pink-50 to-rose-100',
        border: 'border-pink-200',
        shadow: 'shadow-pink-200/50',
        accent: 'bg-pink-500'
      },
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-sky-100',
        border: 'border-blue-200',
        shadow: 'shadow-blue-200/50',
        accent: 'bg-blue-500'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
        border: 'border-green-200',
        shadow: 'shadow-green-200/50',
        accent: 'bg-green-500'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-violet-100',
        border: 'border-purple-200',
        shadow: 'shadow-purple-200/50',
        accent: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-amber-100',
        border: 'border-orange-200',
        shadow: 'shadow-orange-200/50',
        accent: 'bg-orange-500'
      },
    };
    return colors[colorName] || colors.yellow;
  };

  const getThumbtackColorClass = (colorName: string) => {
    const colors: Record<string, string> = {
      red: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30',
      blue: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30',
      green: 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30',
      yellow: 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-500/30',
      purple: 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/30',
      black: 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-700/30',
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
        transform: isDragging ? 'rotate(-0.5deg) scale(1.02)' : 'rotate(-1deg)',
        transition: isDragging || isResizing ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Modern Push Pin */}
      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full shadow-xl z-10 ${thumbtackClass} flex items-center justify-center`}>
        <div className="w-2 h-2 bg-white/30 rounded-full"></div>
      </div>

      {/* Modern Note Card */}
      <div className={`${noteColors.bg} ${noteColors.shadow} shadow-2xl p-5 w-full h-full border-2 ${noteColors.border} rounded-2xl transition-all relative backdrop-blur-sm ${
        isConnecting ? 'ring-4 ring-rose-500 ring-offset-4 shadow-2xl shadow-rose-500/30 scale-105' : ''
      } ${
        canConnect ? 'ring-4 ring-emerald-400 ring-offset-4 animate-pulse cursor-pointer scale-105' : ''
      }`}>
        {isEditing ? (
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none text-slate-700 leading-relaxed"
            value={content}
            onChange={(e) => onContentChange(id, e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <div
            className="w-full h-full overflow-auto break-words cursor-text pb-8 text-slate-700 leading-relaxed"
            onDoubleClick={() => setIsEditing(true)}
          >
            {content || <span className="text-slate-400 italic">Double-click to edit...</span>}
          </div>
        )}

        {/* Modern Indicators */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {hasFiles && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md" title={`${files.length} file(s) attached`}>
              <Paperclip className="w-3.5 h-3.5" />
              <span>{files.length}</span>
            </div>
          )}
          {hasTags && (
            <div className="bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md" title={metadata.tags.join(', ')}>
              <Tag className="w-3.5 h-3.5" />
              <span>{metadata.tags.length}</span>
            </div>
          )}
          {hasTitle && (
            <div className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md" title={metadata.title}>
              <FileText className="w-3.5 h-3.5" />
            </div>
          )}
          {hasDate && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md" title={metadata.date}>
              <Calendar className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Accent Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${noteColors.accent} rounded-t-2xl`}></div>
      </div>
      
      {/* Connection points indicator when in connect mode */}
      {canConnect && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping shadow-lg" />
          <div className="absolute w-4 h-4 bg-emerald-500 rounded-full shadow-emerald-500/50" />
        </div>
      )}

      {/* Modern Resize Handles */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
        {/* Corners */}
        <div
          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-white rounded-full cursor-se-resize z-20 shadow-lg hover:scale-125 transition-transform"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
        <div
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-white rounded-full cursor-ne-resize z-20 shadow-lg hover:scale-125 transition-transform"
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        <div
          className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-white rounded-full cursor-sw-resize z-20 shadow-lg hover:scale-125 transition-transform"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        <div
          className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-white rounded-full cursor-nw-resize z-20 shadow-lg hover:scale-125 transition-transform"
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />

        {/* Edges */}
        <div
          className="absolute top-0 right-0 w-2 h-full cursor-e-resize z-20"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize z-20"
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
      </div>

      {/* Modern Action Buttons */}
      <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConnect(id);
          }}
          title={isConnecting ? "Click to cancel" : "Click to start connecting"}
          className={`p-2 rounded-xl shadow-lg transition-all duration-200 ${
            isConnecting
              ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white scale-110 animate-pulse shadow-rose-500/50'
              : 'bg-white text-slate-700 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:scale-110 shadow-slate-300/50'
          }`}
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          title="Delete note"
          className="p-2 bg-white text-slate-700 hover:bg-gradient-to-br hover:from-rose-500 hover:to-red-600 hover:text-white rounded-xl hover:scale-110 shadow-lg shadow-slate-300/50 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
