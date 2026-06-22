import type { Viewport, Point } from '@/types/canvas';
import type { Spot } from '@/types/spot';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  viewport: Viewport;
}

export interface SpotRenderData extends Pick<Spot, 'id' | 'type' | 'name' | 'x' | 'y'> {}

export interface InteractionState {
  hoveredSpotId: string | null;
  selectedSpotId: string | null;
  isPlacingSpot: boolean;
  mousePosition: Point | null;
}
