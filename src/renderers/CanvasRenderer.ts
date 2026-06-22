import type { RenderContext, SpotRenderData, InteractionState } from './types';
import { drawGrid } from './GridRenderer';
import { drawSpots, hitTestSpot } from './SpotRenderer';
import type { Viewport } from '@/types/canvas';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
  }

  resize(width: number, height: number) {
    const dpr = window.devicePixelRatio || 1;
    this.width = width;
    this.height = height;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(spots: SpotRenderData[], viewport: Viewport, interaction: InteractionState) {
    if (this.width <= 0 || this.height <= 0) return;

    const context: RenderContext = {
      ctx: this.ctx,
      width: this.width,
      height: this.height,
      viewport,
    };

    this.ctx.clearRect(0, 0, this.width, this.height);

    drawGrid(context);

    drawSpots(context, spots, interaction);

    if (interaction.isPlacingSpot && interaction.mousePosition) {
      this.drawPlacingCursor(interaction.mousePosition.x, interaction.mousePosition.y);
    }
  }

  private drawPlacingCursor(x: number, y: number) {
    const ctx = this.ctx;

    ctx.save();
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#FF6B35';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x - 10, y);
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 30, y);
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x, y - 10);
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x, y + 30);
    ctx.stroke();

    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  findSpotAt(
    screenX: number,
    screenY: number,
    spots: SpotRenderData[],
    viewport: Viewport,
  ): SpotRenderData | null {
    for (let i = spots.length - 1; i >= 0; i--) {
      if (hitTestSpot(screenX, screenY, spots[i], viewport)) {
        return spots[i];
      }
    }
    return null;
  }
}
