import { useState, useCallback, useEffect, useRef } from 'react';
import type { DragState } from '@/types';
import { clamp } from '@/utils';

interface UseDragAndDropOptions {
  onDragEnd?: (x: number, y: number) => void;
  bounds?: {
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
  };
  containerRef?: React.RefObject<HTMLElement>;
  zoom?: number;
  pan?: { x: number; y: number };
}

// Default bounds - prevent items from going off-screen
const DEFAULT_BOUNDS = {
  minX: 0,
  minY: 0,
  maxX: 5000, // Large canvas
  maxY: 5000,
};

export function useDragAndDrop(
  initialX: number,
  initialY: number,
  options: UseDragAndDropOptions = {}
) {
  const {
    onDragEnd,
    bounds = DEFAULT_BOUNDS,
    containerRef,
    zoom = 1,
    pan = { x: 0, y: 0 },
  } = options;
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    offset: { x: 0, y: 0 },
  });
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const dragStartPos = useRef({ x: initialX, y: initialY });

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef?.current) {
        return { x: screenX, y: screenY };
      }
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = screenX - rect.left;
      const relativeY = screenY - rect.top;
      return {
        x: (relativeX - pan.x) / zoom,
        y: (relativeY - pan.y) / zoom,
      };
    },
    [containerRef, zoom, pan]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dragStartPos.current = { x: position.x, y: position.y };
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setDragState({
        isDragging: true,
        offset: {
          x: canvasPos.x - position.x,
          y: canvasPos.y - position.y,
        },
      });
    },
    [position, screenToCanvas]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      let newX = canvasPos.x - dragState.offset.x;
      let newY = canvasPos.y - dragState.offset.y;

      // Apply bounds with clamp utility
      newX = clamp(newX, bounds.minX ?? 0, bounds.maxX ?? Infinity);
      newY = clamp(newY, bounds.minY ?? 0, bounds.maxY ?? Infinity);

      setPosition({ x: newX, y: newY });
    },
    [dragState, bounds, screenToCanvas]
  );

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({ isDragging: false, offset: { x: 0, y: 0 } });
      if (onDragEnd) {
        onDragEnd(position.x, position.y);
      }
    }
  }, [dragState.isDragging, position, onDragEnd]);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return {
    position,
    isDragging: dragState.isDragging,
    handleMouseDown,
  };
}
