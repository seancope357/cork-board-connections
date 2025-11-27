// Core application types

export interface BoardItem {
  id: string;
  type: 'note' | 'image';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  thumbtackColor?: string;
  files?: FileAttachment[];
  metadata?: ItemMetadata;
  zIndex?: number;
  rotation?: number;
}

export interface FileAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface ItemMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  location?: string;
  [key: string]: string | string[] | undefined;
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

// UI State types
export interface DragState {
  isDragging: boolean;
  offset: { x: number; y: number };
}

export interface ResizeState {
  isResizing: boolean;
  direction: string;
  startPos: { x: number; y: number };
  startSize: { width: number; height: number };
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
