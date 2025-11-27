import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { BoardItem } from '@/types';
import { generateId } from '@/utils';
import {
  DEFAULT_NOTE_WIDTH,
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_COLOR,
  DEFAULT_NOTE_THUMBTACK_COLOR,
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_THUMBTACK_COLOR,
} from '@/constants';

// Initial demo items (used only if no Supabase data exists)
const INITIAL_ITEMS: BoardItem[] = [
  {
    id: '1',
    type: 'note',
    content: 'The beginning...',
    x: 100,
    y: 100,
    width: DEFAULT_NOTE_WIDTH,
    height: DEFAULT_NOTE_HEIGHT,
    color: DEFAULT_NOTE_COLOR,
    thumbtackColor: DEFAULT_NOTE_THUMBTACK_COLOR,
  },
  {
    id: '2',
    type: 'note',
    content: 'This connects to everything!',
    x: 400,
    y: 150,
    width: DEFAULT_NOTE_WIDTH,
    height: DEFAULT_NOTE_HEIGHT,
    color: DEFAULT_NOTE_COLOR,
    thumbtackColor: DEFAULT_NOTE_THUMBTACK_COLOR,
  },
  {
    id: '3',
    type: 'note',
    content: "THEY DON'T WANT YOU TO KNOW",
    x: 700,
    y: 200,
    width: DEFAULT_NOTE_WIDTH,
    height: DEFAULT_NOTE_HEIGHT,
    color: DEFAULT_NOTE_COLOR,
    thumbtackColor: DEFAULT_NOTE_THUMBTACK_COLOR,
  },
];

export function useBoardWithSync(boardId: string) {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load items from Supabase on mount
  useEffect(() => {
    async function loadItems() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('board_id', boardId);

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform Supabase data to app format
          const transformedItems: BoardItem[] = data.map((item) => ({
            id: item.id,
            type: item.type as 'note' | 'image',
            content: item.content,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            color: item.color || undefined,
            thumbtackColor: item.thumbtack_color || undefined,
            metadata: item.metadata || undefined,
            files: item.files || undefined,
            zIndex: item.z_index || undefined,
            rotation: item.rotation || undefined,
          }));
          setItems(transformedItems);
        } else {
          // No items in database, use demo items and save them
          setItems(INITIAL_ITEMS);
          // Save demo items to Supabase
          for (const item of INITIAL_ITEMS) {
            await supabase.from('items').insert({
              id: item.id,
              board_id: boardId,
              type: item.type,
              content: item.content,
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              color: item.color,
              thumbtack_color: item.thumbtackColor,
            });
          }
        }
      } catch (error) {
        console.error('Error loading items:', error);
        // Fallback to demo items on error
        setItems(INITIAL_ITEMS);
      } finally {
        setIsLoading(false);
      }
    }

    void loadItems();
  }, [boardId]);

  // Sync item to Supabase
  const syncItem = useCallback(
    async (item: BoardItem, isNew = false) => {
      try {
        setIsSyncing(true);
        if (isNew) {
          const { error } = await supabase.from('items').insert({
            id: item.id,
            board_id: boardId,
            type: item.type,
            content: item.content,
            x: item.x,
            y: item.y,
            width: item.width || DEFAULT_NOTE_WIDTH,
            height: item.height || DEFAULT_NOTE_HEIGHT,
            color: item.color,
            thumbtack_color: item.thumbtackColor,
            metadata: item.metadata,
            files: item.files,
            z_index: item.zIndex,
            rotation: item.rotation,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('items')
            .update({
              content: item.content,
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              color: item.color,
              thumbtack_color: item.thumbtackColor,
              metadata: item.metadata,
              files: item.files,
              z_index: item.zIndex,
              rotation: item.rotation,
            })
            .eq('id', item.id);
          if (error) throw error;
        }
      } catch (error) {
        console.error('Error syncing item:', error);
      } finally {
        setIsSyncing(false);
      }
    },
    [boardId]
  );

  const addNote = useCallback(() => {
    const newNote: BoardItem = {
      id: generateId(),
      type: 'note',
      content: 'New clue...',
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      width: DEFAULT_NOTE_WIDTH,
      height: DEFAULT_NOTE_HEIGHT,
      color: DEFAULT_NOTE_COLOR,
      thumbtackColor: DEFAULT_NOTE_THUMBTACK_COLOR,
      files: [],
      metadata: {},
    };
    setItems((prev) => [...prev, newNote]);
    void syncItem(newNote, true);
  }, [syncItem]);

  const addImage = useCallback(() => {
    const newImage: BoardItem = {
      id: generateId(),
      type: 'image',
      content: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=300&h=200&fit=crop',
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      width: DEFAULT_IMAGE_WIDTH,
      height: DEFAULT_IMAGE_HEIGHT,
      color: 'white',
      thumbtackColor: DEFAULT_IMAGE_THUMBTACK_COLOR,
      files: [],
      metadata: {
        title: 'Evidence Photo',
        description: 'Suspicious activity',
        tags: ['evidence', 'important'],
        date: new Date().toISOString().split('T')[0],
        location: 'Unknown',
      },
    };
    setItems((prev) => [...prev, newImage]);
    void syncItem(newImage, true);
  }, [syncItem]);

  const updateItemPosition = useCallback(
    (id: string, x: number, y: number) => {
      setItems((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, x, y } : item));
        const updatedItem = updated.find((item) => item.id === id);
        if (updatedItem) void syncItem(updatedItem);
        return updated;
      });
    },
    [syncItem]
  );

  const updateItemSize = useCallback(
    (id: string, width: number, height: number) => {
      setItems((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, width, height } : item));
        const updatedItem = updated.find((item) => item.id === id);
        if (updatedItem) void syncItem(updatedItem);
        return updated;
      });
    },
    [syncItem]
  );

  const updateItemContent = useCallback(
    (id: string, content: string) => {
      setItems((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, content } : item));
        const updatedItem = updated.find((item) => item.id === id);
        if (updatedItem) void syncItem(updatedItem);
        return updated;
      });
    },
    [syncItem]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<BoardItem>) => {
      setItems((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
        const updatedItem = updated.find((item) => item.id === id);
        if (updatedItem) void syncItem(updatedItem);
        return updated;
      });
    },
    [syncItem]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      try {
        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    },
    []
  );

  const openItemEditor = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        setEditingItem(item);
      }
    },
    [items]
  );

  const closeItemEditor = useCallback(() => {
    setEditingItem(null);
  }, []);

  const getItemCenter = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return { x: 0, y: 0 };

      const defaultWidth = item.type === 'note' ? DEFAULT_NOTE_WIDTH : DEFAULT_IMAGE_WIDTH;
      return {
        x: item.x + (item.width || defaultWidth) / 2,
        y: item.y - 3, // Thumbtack offset
      };
    },
    [items]
  );

  return {
    items,
    editingItem,
    isLoading,
    isSyncing,
    addNote,
    addImage,
    updateItemPosition,
    updateItemSize,
    updateItemContent,
    updateItem,
    deleteItem,
    openItemEditor,
    closeItemEditor,
    getItemCenter,
  };
}
