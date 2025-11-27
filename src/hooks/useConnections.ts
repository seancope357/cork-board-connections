import { useState, useCallback } from 'react';
import type { Connection } from '@/types';
import { generateId } from '@/utils';

const INITIAL_CONNECTIONS: Connection[] = [
  { id: 'c1', from: '1', to: '2' },
  { id: 'c2', from: '2', to: '3' },
];

export function useConnections(_onItemDelete?: (itemId: string) => void) {
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const createConnection = useCallback((fromId: string, toId: string) => {
    // Prevent duplicate connections
    setConnections((prev) => {
      const exists = prev.some((conn) => conn.from === fromId && conn.to === toId);
      if (exists) return prev;

      const newConnection: Connection = {
        id: generateId(),
        from: fromId,
        to: toId,
      };
      return [...prev, newConnection];
    });
  }, []);

  const deleteConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id));
  }, []);

  const deleteConnectionsByItem = useCallback((itemId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.from !== itemId && conn.to !== itemId));
  }, []);

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
        createConnection(connectingFrom, id);
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
    createConnection,
    deleteConnection,
    deleteConnectionsByItem,
    startConnection,
    cancelConnection,
  };
}
