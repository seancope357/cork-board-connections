import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Connection } from '@/types';
import { generateId } from '@/utils';

const INITIAL_CONNECTIONS: Connection[] = [
  { id: 'c1', from: '1', to: '2' },
  { id: 'c2', from: '2', to: '3' },
];

export function useConnectionsWithSync(boardId: string) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load connections from Supabase on mount
  useEffect(() => {
    async function loadConnections() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('connections')
          .select('*')
          .eq('board_id', boardId);

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform Supabase data to app format
          const transformedConnections: Connection[] = data.map((conn) => ({
            id: conn.id,
            from: conn.from_item_id,
            to: conn.to_item_id,
            style: conn.style || undefined,
            label: conn.label || undefined,
          }));
          setConnections(transformedConnections);
        } else {
          // No connections in database, use demo connections and save them
          setConnections(INITIAL_CONNECTIONS);
          // Save demo connections to Supabase
          for (const conn of INITIAL_CONNECTIONS) {
            await supabase.from('connections').insert({
              id: conn.id,
              board_id: boardId,
              from_item_id: conn.from,
              to_item_id: conn.to,
            });
          }
        }
      } catch (error) {
        console.error('Error loading connections:', error);
        // Fallback to demo connections on error
        setConnections(INITIAL_CONNECTIONS);
      } finally {
        setIsLoading(false);
      }
    }

    void loadConnections();
  }, [boardId]);

  const createConnection = useCallback(
    async (fromId: string, toId: string) => {
      // Prevent duplicate connections
      const exists = connections.some((conn) => conn.from === fromId && conn.to === toId);
      if (exists) return;

      const newConnection: Connection = {
        id: generateId(),
        from: fromId,
        to: toId,
      };

      setConnections((prev) => [...prev, newConnection]);

      // Sync to Supabase
      try {
        const { error } = await supabase.from('connections').insert({
          id: newConnection.id,
          board_id: boardId,
          from_item_id: fromId,
          to_item_id: toId,
        });
        if (error) throw error;
      } catch (error) {
        console.error('Error creating connection:', error);
      }
    },
    [connections, boardId]
  );

  const deleteConnection = useCallback(async (id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id));

    // Delete from Supabase
    try {
      const { error } = await supabase.from('connections').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  }, []);

  const deleteConnectionsByItem = useCallback(
    async (itemId: string) => {
      const toDelete = connections.filter((conn) => conn.from === itemId || conn.to === itemId);
      setConnections((prev) => prev.filter((conn) => conn.from !== itemId && conn.to !== itemId));

      // Delete from Supabase
      try {
        for (const conn of toDelete) {
          await supabase.from('connections').delete().eq('id', conn.id);
        }
      } catch (error) {
        console.error('Error deleting connections by item:', error);
      }
    },
    [connections]
  );

  const startConnection = useCallback(
    (id: string) => {
      if (connectingFrom === id) {
        // Cancel if clicking the same item
        setConnectingFrom(null);
      } else if (connectingFrom === null) {
        // Start connection from this item
        setConnectingFrom(id);
      } else {
        // Complete connection
        void createConnection(connectingFrom, id);
        setConnectingFrom(null);
      }
    },
    [connectingFrom, createConnection]
  );

  const cancelConnection = useCallback(() => {
    setConnectingFrom(null);
  }, []);

  return {
    connections,
    connectingFrom,
    isLoading,
    createConnection,
    deleteConnection,
    deleteConnectionsByItem,
    startConnection,
    cancelConnection,
  };
}
