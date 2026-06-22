export interface Viewport {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasInteraction {
  isDragging: boolean;
  isPlacingSpot: boolean;
  hoveredSpotId: string | null;
  selectedSpotId: string | null;
}

export interface Point {
  x: number;
  y: number;
}

export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.1;
