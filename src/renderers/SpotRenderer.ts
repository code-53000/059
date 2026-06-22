import type { RenderContext, SpotRenderData, InteractionState } from './types';
import { worldToScreen } from '@/utils/coordinate';
import { SPOT_TYPE_COLORS, SPOT_TYPE_LABELS } from '@/types/spot';
import type { SpotType } from '@/types/spot';

const BASE_MARKER_SIZE = 16;

export function drawSpots(
  context: RenderContext,
  spots: SpotRenderData[],
  interaction: InteractionState,
) {
  const { ctx, viewport } = context;

  for (const spot of spots) {
    const screenPos = worldToScreen(spot.x, spot.y, viewport);
    const isHovered = interaction.hoveredSpotId === spot.id;
    const isSelected = interaction.selectedSpotId === spot.id;
    const scale = viewport.zoom;

    if (isSelected) {
      drawGlow(ctx, screenPos.x, screenPos.y, BASE_MARKER_SIZE * scale * 2, SPOT_TYPE_COLORS[spot.type]);
    }

    drawSpotMarker(ctx, screenPos.x, screenPos.y, spot.type, scale, isHovered || isSelected);

    if (isHovered || isSelected) {
      drawSpotLabel(ctx, screenPos.x, screenPos.y, spot.name, SPOT_TYPE_COLORS[spot.type], scale);
    }
  }
}

export function hitTestSpot(
  screenX: number,
  screenY: number,
  spot: SpotRenderData,
  viewport: RenderContext['viewport'],
): boolean {
  const screenPos = worldToScreen(spot.x, spot.y, viewport);
  const hitRadius = BASE_MARKER_SIZE * viewport.zoom * 1.2;
  const dx = screenX - screenPos.x;
  const dy = screenY - screenPos.y;
  return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
}

function drawSpotMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: SpotType,
  scale: number,
  highlighted: boolean,
) {
  const size = BASE_MARKER_SIZE * scale;
  const color = SPOT_TYPE_COLORS[type];

  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = color;
  ctx.shadowBlur = highlighted ? 15 * scale : 8 * scale;

  ctx.fillStyle = color;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2 * scale;

  switch (type) {
    case 'stairs':
      drawStairsMarker(ctx, size);
      break;
    case 'rail':
      drawRailMarker(ctx, size);
      break;
    case 'bowl':
      drawBowlMarker(ctx, size);
      break;
    case 'flat':
      drawFlatMarker(ctx, size);
      break;
    case 'ramp':
      drawRampMarker(ctx, size);
      break;
    default:
      drawOtherMarker(ctx, size);
  }

  ctx.restore();
}

function drawStairsMarker(ctx: CanvasRenderingContext2D, size: number) {
  const half = size / 2;
  const stepH = size / 4;

  ctx.beginPath();
  ctx.rect(-half, -half, size, size);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-half, -half + i * stepH);
    ctx.lineTo(half, -half + i * stepH);
    ctx.stroke();
  }
}

function drawRailMarker(ctx: CanvasRenderingContext2D, size: number) {
  const half = size / 2;

  ctx.beginPath();
  ctx.moveTo(-half, half);
  ctx.lineTo(half, -half);
  ctx.lineWidth = size * 0.4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.stroke();

  ctx.lineWidth = size * 0.15;
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(-half * 0.6, half * 0.6);
  ctx.lineTo(half * 0.6, -half * 0.6);
  ctx.stroke();
}

function drawBowlMarker(ctx: CanvasRenderingContext2D, size: number) {
  const radius = size / 2;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFlatMarker(ctx: CanvasRenderingContext2D, size: number) {
  const half = size / 2;

  ctx.beginPath();
  ctx.moveTo(-half, size * 0.2);
  ctx.lineTo(0, -half);
  ctx.lineTo(half, size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawRampMarker(ctx: CanvasRenderingContext2D, size: number) {
  const half = size / 2;

  ctx.beginPath();
  ctx.moveTo(-half, half);
  ctx.lineTo(-half, -half * 0.3);
  ctx.lineTo(half, half);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawOtherMarker(ctx: CanvasRenderingContext2D, size: number) {
  const radius = size / 2;
  const sides = 6;

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color + '60');
  gradient.addColorStop(0.5, color + '20');
  gradient.addColorStop(1, color + '00');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpotLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  color: string,
  scale: number,
) {
  const fontSize = 12 * Math.max(scale, 0.8);
  const paddingX = 8 * Math.max(scale, 0.8);
  const paddingY = 4 * Math.max(scale, 0.8);
  const offsetY = BASE_MARKER_SIZE * scale + 12 * scale;

  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  const textWidth = ctx.measureText(name).width;
  const bgWidth = textWidth + paddingX * 2;
  const bgHeight = fontSize + paddingY * 2;

  ctx.fillStyle = 'rgba(15, 15, 15, 0.95)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  const bgX = x - bgWidth / 2;
  const bgY = y + offsetY - bgHeight / 2;

  roundRect(ctx, bgX, bgY, bgWidth, bgHeight, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, x, y + offsetY);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export { SPOT_TYPE_LABELS };
