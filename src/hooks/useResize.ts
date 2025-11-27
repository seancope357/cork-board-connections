import { useState, useCallback, useEffect } from 'react';
import type { ResizeState } from '@/types';
import { clamp } from '@/utils';
import { MIN_ITEM_WIDTH, MIN_ITEM_HEIGHT, MAX_ITEM_WIDTH, MAX_ITEM_HEIGHT } from '@/constants';

interface UseResizeOptions {
  onResizeEnd?: (width: number, height: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useResize(
  initialWidth: number,
  initialHeight: number,
  options: UseResizeOptions = {}
) {
  const {
    onResizeEnd,
    minWidth = MIN_ITEM_WIDTH,
    minHeight = MIN_ITEM_HEIGHT,
    maxWidth = MAX_ITEM_WIDTH,
    maxHeight = MAX_ITEM_HEIGHT,
  } = options;

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    direction: '',
    startPos: { x: 0, y: 0 },
    startSize: { width: initialWidth, height: initialHeight },
  });

  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });

  const startResize = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      setResizeState({
        isResizing: true,
        direction,
        startPos: { x: e.clientX, y: e.clientY },
        startSize: { width: size.width, height: size.height },
      });
    },
    [size]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing) return;

      const deltaX = e.clientX - resizeState.startPos.x;
      const deltaY = e.clientY - resizeState.startPos.y;

      let newWidth = resizeState.startSize.width;
      let newHeight = resizeState.startSize.height;

      // Calculate new dimensions based on resize direction
      if (resizeState.direction.includes('e')) {
        newWidth = resizeState.startSize.width + deltaX;
      }
      if (resizeState.direction.includes('w')) {
        newWidth = resizeState.startSize.width - deltaX;
      }
      if (resizeState.direction.includes('s')) {
        newHeight = resizeState.startSize.height + deltaY;
      }
      if (resizeState.direction.includes('n')) {
        newHeight = resizeState.startSize.height - deltaY;
      }

      // Apply constraints
      newWidth = clamp(newWidth, minWidth, maxWidth);
      newHeight = clamp(newHeight, minHeight, maxHeight);

      setSize({ width: newWidth, height: newHeight });
    },
    [resizeState, minWidth, minHeight, maxWidth, maxHeight]
  );

  const handleMouseUp = useCallback(() => {
    if (resizeState.isResizing) {
      setResizeState({
        isResizing: false,
        direction: '',
        startPos: { x: 0, y: 0 },
        startSize: { width: size.width, height: size.height },
      });
      if (onResizeEnd) {
        onResizeEnd(size.width, size.height);
      }
    }
  }, [resizeState.isResizing, size, onResizeEnd]);

  useEffect(() => {
    if (resizeState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizeState.isResizing, handleMouseMove, handleMouseUp]);

  return {
    size,
    isResizing: resizeState.isResizing,
    resizeDirection: resizeState.direction,
    startResize,
  };
}
