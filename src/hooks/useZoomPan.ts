import { useState, useCallback, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ZoomPanState {
  zoom: number;
  pan: Point;
}

interface UseZoomPanOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
}

export function useZoomPan(options: UseZoomPanOptions = {}) {
  const { minZoom = 0.1, maxZoom = 5, zoomSpeed = 0.001 } = options;

  const [state, setState] = useState<ZoomPanState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
  });

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom
      const delta = -e.deltaY * zoomSpeed;
      const newZoom = Math.min(maxZoom, Math.max(minZoom, state.zoom * (1 + delta)));

      // Zoom towards cursor position
      const zoomRatio = newZoom / state.zoom;
      const newPanX = mouseX - (mouseX - state.pan.x) * zoomRatio;
      const newPanY = mouseY - (mouseY - state.pan.y) * zoomRatio;

      setState({
        zoom: newZoom,
        pan: { x: newPanX, y: newPanY },
      });
    },
    [state.zoom, state.pan, minZoom, maxZoom, zoomSpeed]
  );

  // Handle pan start (middle mouse button or spacebar + left mouse)
  const handlePanStart = useCallback((e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or Shift + left mouse
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Handle pan move
  const handlePanMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;

      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;

      setState((prev) => ({
        ...prev,
        pan: {
          x: prev.pan.x + deltaX,
          y: prev.pan.y + deltaY,
        },
      }));

      setPanStart({ x: e.clientX, y: e.clientY });
    },
    [isPanning, panStart]
  );

  // Handle pan end
  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handlePanStart);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handlePanStart);
    };
  }, [handleWheel, handlePanStart]);

  // Global mouse move and up listeners for panning
  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handlePanMove);
      window.addEventListener('mouseup', handlePanEnd);

      return () => {
        window.removeEventListener('mousemove', handlePanMove);
        window.removeEventListener('mouseup', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  // Programmatic zoom controls
  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.min(maxZoom, prev.zoom * 1.2),
    }));
  }, [maxZoom]);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(minZoom, prev.zoom / 1.2),
    }));
  }, [minZoom]);

  const resetZoom = useCallback(() => {
    setState({
      zoom: 1,
      pan: { x: 0, y: 0 },
    });
  }, []);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setState({
      zoom: 1,
      pan: { x: rect.width / 2, y: rect.height / 2 },
    });
  }, []);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      return {
        x: (screenX - state.pan.x) / state.zoom,
        y: (screenY - state.pan.y) / state.zoom,
      };
    },
    [state.zoom, state.pan]
  );

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number): Point => {
      return {
        x: canvasX * state.zoom + state.pan.x,
        y: canvasY * state.zoom + state.pan.y,
      };
    },
    [state.zoom, state.pan]
  );

  return {
    zoom: state.zoom,
    pan: state.pan,
    isPanning,
    containerRef,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    screenToCanvas,
    canvasToScreen,
  };
}
