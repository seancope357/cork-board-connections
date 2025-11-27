import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { BoardItem, Connection } from '@/types';

interface SupabaseBoardData {
  items: BoardItem[];
  connections: Connection[];
  isLoading: boolean;
  error: Error | null;
  boardId: string | null;
  saveItem: (item: BoardItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<BoardItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  saveConnection: (connection: Connection) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  createBoard: (title: string, description?: string) => Promise<string>;
}

export function useSupabaseBoard(initialBoardId?: string): SupabaseBoardData {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [boardId, setBoardId] = useState<string | null>(initialBoardId || null);

  // Create a new board
  const createBoard = useCallback(async (title: string, description?: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('boards')
        .insert({ title, description })
        .select()
        .single();

      if (error) throw error;
      setBoardId(data.id);
      return data.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create board');
      setError(error);
      throw error;
    }
  }, []);

  // Load board data
  const loadBoardData = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('board_id', id);

      if (itemsError) throw itemsError;

      // Load connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .eq('board_id', id);

      if (connectionsError) throw connectionsError;

      // Transform data to match app types
      const transformedItems: BoardItem[] = (itemsData || []).map((item) => ({
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

      const transformedConnections: Connection[] = (connectionsData || []).map((conn) => ({
        id: conn.id,
        from: conn.from_item_id,
        to: conn.to_item_id,
        style: conn.style || undefined,
        label: conn.label || undefined,
      }));

      setItems(transformedItems);
      setConnections(transformedConnections);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load board');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save item
  const saveItem = useCallback(
    async (item: BoardItem) => {
      if (!boardId) throw new Error('No board selected');

      try {
        const { error } = await supabase.from('items').insert({
          id: item.id,
          board_id: boardId,
          type: item.type,
          content: item.content,
          x: item.x,
          y: item.y,
          width: item.width || 200,
          height: item.height || 150,
          color: item.color,
          thumbtack_color: item.thumbtackColor,
          metadata: item.metadata,
          files: item.files,
          z_index: item.zIndex,
          rotation: item.rotation,
        });

        if (error) throw error;
        setItems((prev) => [...prev, item]);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save item');
        setError(error);
        throw error;
      }
    },
    [boardId]
  );

  // Update item
  const updateItem = useCallback(
    async (id: string, updates: Partial<BoardItem>) => {
      try {
        const { error } = await supabase
          .from('items')
          .update({
            content: updates.content,
            x: updates.x,
            y: updates.y,
            width: updates.width,
            height: updates.height,
            color: updates.color,
            thumbtack_color: updates.thumbtackColor,
            metadata: updates.metadata,
            files: updates.files,
            z_index: updates.zIndex,
            rotation: updates.rotation,
          })
          .eq('id', id);

        if (error) throw error;
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update item');
        setError(error);
        throw error;
      }
    },
    []
  );

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('items').delete().eq('id', id);

      if (error) throw error;
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete item');
      setError(error);
      throw error;
    }
  }, []);

  // Save connection
  const saveConnection = useCallback(
    async (connection: Connection) => {
      if (!boardId) throw new Error('No board selected');

      try {
        const { error } = await supabase.from('connections').insert({
          id: connection.id,
          board_id: boardId,
          from_item_id: connection.from,
          to_item_id: connection.to,
          style: connection.style,
          label: connection.label,
        });

        if (error) throw error;
        setConnections((prev) => [...prev, connection]);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save connection');
        setError(error);
        throw error;
      }
    },
    [boardId]
  );

  // Delete connection
  const deleteConnection = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('connections').delete().eq('id', id);

      if (error) throw error;
      setConnections((prev) => prev.filter((conn) => conn.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete connection');
      setError(error);
      throw error;
    }
  }, []);

  // Load board data when boardId changes
  useEffect(() => {
    if (boardId) {
      void loadBoardData(boardId);
    }
  }, [boardId, loadBoardData]);

  return {
    items,
    connections,
    isLoading,
    error,
    boardId,
    saveItem,
    updateItem,
    deleteItem,
    saveConnection,
    deleteConnection,
    createBoard,
  };
}
