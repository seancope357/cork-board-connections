import { useRef, useCallback, useState } from 'react';
import { Plus, StickyNote, Image as ImageIcon, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { DraggableNote } from './DraggableNote';
import { DraggableImage } from './DraggableImage';
import { ConnectionLine } from './ConnectionLine';
import { NoteModal } from './NoteModal';
import { ImageModal } from './ImageModal';
import { useBoard, useConnections, useZoomPan } from '@/hooks';
import { useNotification } from '@/contexts/NotificationContext';
import { DEFAULT_NOTE_WIDTH, DEFAULT_IMAGE_WIDTH } from '@/constants';
import type { BoardItem } from '@/types';

export function CorkBoard() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const notification = useNotification();

  // Use custom hooks for state management
  const {
    items,
    editingItem,
    addNote,
    addImage,
    updateItemPosition,
    updateItemSize,
    updateItemContent,
    updateItem,
    deleteItem: deleteItemFromBoard,
    openItemEditor,
    closeItemEditor,
    getItemCenter,
  } = useBoard();

  const {
    connections,
    connectingFrom,
    deleteConnection,
    deleteConnectionsByItem,
    startConnection,
    cancelConnection,
  } = useConnections();

  const {
    zoom,
    pan,
    containerRef,
    zoomIn,
    zoomOut,
    resetZoom,
    screenToCanvas,
  } = useZoomPan({
    minZoom: 0.1,
    maxZoom: 5,
    zoomSpeed: 0.001,
  });

  // Delete item and its connections
  const handleDeleteItem = useCallback(
    (id: string) => {
      deleteItemFromBoard(id);
      deleteConnectionsByItem(id);
      notification.success('Item deleted', 'The item has been removed from the board');
    },
    [deleteItemFromBoard, deleteConnectionsByItem, notification]
  );

  // Wrap add note with notification
  const handleAddNote = useCallback(() => {
    addNote();
    notification.success('Note added', 'A new note has been added to the board');
  }, [addNote, notification]);

  // Wrap add image with notification
  const handleAddImage = useCallback(() => {
    addImage();
    notification.success('Image added', 'A new image has been added to the board');
  }, [addImage, notification]);

  // Handle mouse move for temporary connection line
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const canvasPos = screenToCanvas(screenX, screenY);
        setMousePos(canvasPos);
      }
    },
    [containerRef, screenToCanvas]
  );

  // Handle save from modals
  const handleSaveItem = useCallback(
    (updates: Partial<BoardItem>) => {
      if (editingItem) {
        updateItem(editingItem.id, updates);
        closeItemEditor();
      }
    },
    [editingItem, updateItem, closeItemEditor]
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Toolbar */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="px-6 py-3 flex gap-3 items-center">
          {/* Primary Actions Group */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNote}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <StickyNote className="w-4 h-4" />
              <span>Add Note</span>
            </button>
            <button
              onClick={handleAddImage}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Add Image</span>
            </button>
          </div>

          {/* Connection Status */}
          {connectingFrom && (
            <div className="flex items-center gap-2 ml-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium shadow-md animate-pulse">
                <Plus className="w-4 h-4" />
                <span>Click another item to connect</span>
              </div>
              <button
                onClick={cancelConnection}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Connection Counter */}
          {!connectingFrom && connections.length > 0 && (
            <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-slate-700 font-medium text-sm">
                  {connections.length} connection{connections.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div className={`flex items-center gap-2 ${!connectingFrom && connections.length > 0 ? '' : 'ml-auto'}`}>
            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Zoom Out (Scroll Down)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="px-3 py-2 bg-white border-x border-slate-200 min-w-[4rem] text-center">
                <span className="text-slate-700 font-semibold text-sm">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Zoom In (Scroll Up)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={resetZoom}
              className="p-2 bg-slate-50 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 shadow-sm transition-colors"
              title="Reset Zoom (1:1)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(148, 163, 184, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(100, 116, 139, 0.05) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(148, 163, 184, 0.03) 49px, rgba(148, 163, 184, 0.03) 50px),
            repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(148, 163, 184, 0.03) 49px, rgba(148, 163, 184, 0.03) 50px)
          `,
          backgroundColor: '#f8fafc',
          backgroundSize: '100% 100%, 100% 100%, 50px 50px, 50px 50px',
          cursor: 'grab',
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Transform wrapper for zoom/pan */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}
        >
          {/* SVG Layer for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map((conn) => {
            const from = getItemCenter(conn.from);
            const to = getItemCenter(conn.to);
            return (
              <ConnectionLine
                key={conn.id}
                id={conn.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                onDelete={() => deleteConnection(conn.id)}
              />
            );
          })}

          {/* Temporary line while connecting */}
          {connectingFrom && (
            <g>
              <path
                d={`M ${getItemCenter(connectingFrom).x} ${getItemCenter(connectingFrom).y} Q ${(getItemCenter(connectingFrom).x + mousePos.x) / 2 + Math.sin(Date.now() / 200) * 20} ${(getItemCenter(connectingFrom).y + mousePos.y) / 2 + Math.cos(Date.now() / 200) * 20} ${mousePos.x} ${mousePos.y}`}
                stroke="#ef4444"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.9"
                className="animate-pulse"
              />
              <circle
                cx={getItemCenter(connectingFrom).x}
                cy={getItemCenter(connectingFrom).y}
                r="8"
                fill="#ef4444"
                opacity="0.6"
                className="animate-ping"
              />
            </g>
          )}
        </svg>

        {/* Items Layer */}
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          {items.map((item) =>
            item.type === 'note' ? (
              <DraggableNote
                key={item.id}
                id={item.id}
                content={item.content}
                x={item.x}
                y={item.y}
                width={item.width || DEFAULT_NOTE_WIDTH}
                height={item.height || 150}
                color={item.color || 'yellow'}
                thumbtackColor={item.thumbtackColor || 'red'}
                files={item.files || []}
                metadata={item.metadata || {}}
                onMove={updateItemPosition}
                onResize={updateItemSize}
                onContentChange={updateItemContent}
                onDelete={handleDeleteItem}
                onConnect={startConnection}
                onEdit={openItemEditor}
                isConnecting={connectingFrom === item.id}
                canConnect={connectingFrom !== null && connectingFrom !== item.id}
                containerRef={containerRef}
                zoom={zoom}
                pan={pan}
              />
            ) : (
              <DraggableImage
                key={item.id}
                id={item.id}
                imageUrl={item.content}
                x={item.x}
                y={item.y}
                width={item.width || DEFAULT_IMAGE_WIDTH}
                height={item.height || 200}
                thumbtackColor={item.thumbtackColor || 'blue'}
                files={item.files || []}
                metadata={item.metadata || {}}
                onMove={updateItemPosition}
                onResize={updateItemSize}
                onDelete={handleDeleteItem}
                onConnect={startConnection}
                onEdit={openItemEditor}
                isConnecting={connectingFrom === item.id}
                canConnect={connectingFrom !== null && connectingFrom !== item.id}
                containerRef={containerRef}
                zoom={zoom}
                pan={pan}
              />
            )
          )}
        </div>
        </div>
      </div>

      {/* Modals */}
      {editingItem && editingItem.type === 'note' && (
        <NoteModal item={editingItem} onClose={closeItemEditor} onSave={handleSaveItem} />
      )}

      {editingItem && editingItem.type === 'image' && (
        <ImageModal item={editingItem} onClose={closeItemEditor} onSave={handleSaveItem} />
      )}
    </div>
  );
}
