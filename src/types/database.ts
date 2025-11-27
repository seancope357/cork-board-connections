// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          board_id: string;
          type: 'note' | 'image';
          content: string;
          x: number;
          y: number;
          width: number;
          height: number;
          color: string | null;
          thumbtack_color: string | null;
          metadata: Record<string, any> | null;
          files: Array<{ name: string; url: string; size?: number; type?: string }> | null;
          z_index: number | null;
          rotation: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          type: 'note' | 'image';
          content: string;
          x: number;
          y: number;
          width?: number;
          height?: number;
          color?: string | null;
          thumbtack_color?: string | null;
          metadata?: Record<string, any> | null;
          files?: Array<{ name: string; url: string; size?: number; type?: string }> | null;
          z_index?: number | null;
          rotation?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          type?: 'note' | 'image';
          content?: string;
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          color?: string | null;
          thumbtack_color?: string | null;
          metadata?: Record<string, any> | null;
          files?: Array<{ name: string; url: string; size?: number; type?: string }> | null;
          z_index?: number | null;
          rotation?: number | null;
          updated_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          board_id: string;
          from_item_id: string;
          to_item_id: string;
          style: Record<string, any> | null;
          label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          from_item_id: string;
          to_item_id: string;
          style?: Record<string, any> | null;
          label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          from_item_id?: string;
          to_item_id?: string;
          style?: Record<string, any> | null;
          label?: string | null;
        };
      };
    };
  };
}
