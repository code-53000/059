import type { Viewport, Point } from '@/types/canvas';

export function screenToWorld(screenX: number, screenY: number, viewport: Viewport): Point {
  return {
    x: (screenX - viewport.offsetX) / viewport.zoom,
    y: (screenY - viewport.offsetY) / viewport.zoom,
  };
}

export function worldToScreen(worldX: number, worldY: number, viewport: Viewport): Point {
  return {
    x: worldX * viewport.zoom + viewport.offsetX,
    y: worldY * viewport.zoom + viewport.offsetY,
  };
}

export function zoomAtPoint(
  screenX: number,
  screenY: number,
  oldZoom: number,
  newZoom: number,
  offset: Point,
): Point {
  const worldX = (screenX - offset.x) / oldZoom;
  const worldY = (screenY - offset.y) / oldZoom;

  return {
    x: screenX - worldX * newZoom,
    y: screenY - worldY * newZoom,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
