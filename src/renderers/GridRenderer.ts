import type { RenderContext } from './types';
import { worldToScreen } from '@/utils/coordinate';

const GRID_SIZE = 100;
const MINOR_GRID_SIZE = 20;

export function drawGrid(context: RenderContext) {
  const { ctx, width, height, viewport } = context;

  if (width <= 0 || height <= 0) return;

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  drawNoiseTexture(ctx, width, height);

  const gridSize = GRID_SIZE * viewport.zoom;
  const minorGridSize = MINOR_GRID_SIZE * viewport.zoom;

  const offsetX = viewport.offsetX % gridSize;
  const offsetY = viewport.offsetY % gridSize;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;

  for (let x = offsetX; x < width; x += minorGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = offsetY; y < height; y += minorGridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  for (let x = offsetX; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = offsetY; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  drawOriginMarker(context);
}

function drawNoiseTexture(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 8;
    data[i] = 10 + noise;
    data[i + 1] = 10 + noise;
    data[i + 2] = 10 + noise;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

function drawOriginMarker(context: RenderContext) {
  const { ctx, viewport } = context;
  const origin = worldToScreen(0, 0, viewport);

  ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);

  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, context.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(context.width, origin.y);
  ctx.stroke();

  ctx.setLineDash([]);
}
