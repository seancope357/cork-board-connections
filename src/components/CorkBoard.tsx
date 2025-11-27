import { useRef, useCallback, useState } from 'react';
import { Plus, StickyNote, Image as ImageIcon } from 'lucide-react';
import { DraggableNote } from './DraggableNote';
import { DraggableImage } from './DraggableImage';
import { ConnectionLine } from './ConnectionLine';
import { NoteModal } from './NoteModal';
import { ImageModal } from './ImageModal';
import { useBoard, useConnections } from '@/hooks';
import { useNotification } from '@/contexts/NotificationContext';
import { DEFAULT_NOTE_WIDTH, DEFAULT_IMAGE_WIDTH } from '@/constants';

export function CorkBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
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
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  // Handle save from modals
  const handleSaveItem = useCallback(
    (updates: Partial<typeof editingItem>) => {
      if (editingItem) {
        updateItem(editingItem.id, updates);
        closeItemEditor();
      }
    },
    [editingItem, updateItem, closeItemEditor]
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-neutral-800 border-b border-neutral-700 p-4 flex gap-3 items-center">
        <button
          onClick={handleAddNote}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
        >
          <StickyNote className="w-4 h-4" />
          Add Note
        </button>
        <button
          onClick={handleAddImage}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          Add Image
        </button>

        {connectingFrom && (
          <>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded animate-pulse">
              <Plus className="w-4 h-4" />
              Click another item to connect
            </div>
            <button
              onClick={cancelConnection}
              className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </>
        )}

        {!connectingFrom && connections.length > 0 && (
          <div className="ml-auto flex items-center gap-2 text-neutral-400">
            <span className="h-0.5 w-8 bg-red-500"></span>
            <span>
              {connections.length} connection{connections.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Cork Board */}
      <div
        ref={boardRef}
        className="flex-1 relative overflow-auto"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(139, 99, 63, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(160, 115, 74, 0.1) 0%, transparent 50%)
          `,
          backgroundColor: '#a67c52',
          backgroundSize: '100% 100%',
        }}
        onMouseMove={handleMouseMove}
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
              />
            )
          )}
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
