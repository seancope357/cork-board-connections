// Shared types between frontend and backend

export interface BoardItem {
  id: string;
  type: 'note' | 'image' | 'text' | 'shape';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  thumbtackColor?: string;
  zIndex?: number;
  rotation?: number;
  files?: FileAttachment[];
  metadata?: ItemMetadata;
}

export interface FileAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface ItemMetadata {
  [key: string]: string | string[] | undefined;
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  location?: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  style?: ConnectionStyle;
  label?: string;
}

export interface ConnectionStyle {
  color?: string;
  thickness?: number;
  pattern?: 'solid' | 'dashed' | 'dotted';
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  items: BoardItem[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
