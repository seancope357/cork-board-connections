// Application constants

export const DEFAULT_NOTE_WIDTH = 200;
export const DEFAULT_NOTE_HEIGHT = 150;
export const DEFAULT_IMAGE_WIDTH = 250;
export const DEFAULT_IMAGE_HEIGHT = 200;

export const MIN_ITEM_WIDTH = 100;
export const MIN_ITEM_HEIGHT = 80;
export const MAX_ITEM_WIDTH = 800;
export const MAX_ITEM_HEIGHT = 600;

export const DEFAULT_NOTE_COLOR = 'yellow';
export const DEFAULT_NOTE_THUMBTACK_COLOR = 'red';
export const DEFAULT_IMAGE_THUMBTACK_COLOR = 'blue';

export const THUMBTACK_OFFSET_Y = -3;

export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const LOCAL_STORAGE_KEY = 'cork-board-data';
export const LOCAL_STORAGE_BACKUP_KEY = 'cork-board-backup';

export const CORK_BOARD_BACKGROUND_COLOR = '#a67c52';

export const NOTE_COLORS = {
  yellow: '#fef08a',
  orange: '#fed7aa',
  pink: '#fbcfe8',
  purple: '#e9d5ff',
  blue: '#bfdbfe',
  green: '#bbf7d0',
  white: '#ffffff',
} as const;

export const THUMBTACK_COLORS = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  purple: '#9333ea',
  orange: '#ea580c',
} as const;

export const CONNECTION_COLORS = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
} as const;
