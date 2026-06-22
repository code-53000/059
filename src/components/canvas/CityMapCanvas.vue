<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useCanvasStore } from '@/stores/canvas';
import { useSpotStore } from '@/stores/spot';
import { CanvasRenderer } from '@/renderers/CanvasRenderer';
import { screenToWorld } from '@/utils/coordinate';
import type { SpotRenderData, InteractionState } from '@/renderers/types';

const emit = defineEmits<{
  (e: 'spotClick', spotId: string): void;
  (e: 'placeSpot', x: number, y: number): void;
}>(); 

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasStore = useCanvasStore();
const spotStore = useSpotStore();

let renderer: CanvasRenderer | null = null;
let animationFrameId: number | null = null;
const mousePos = ref({ x: 0, y: 0 });

function render() {
  if (!renderer) return;

  const spotData: SpotRenderData[] = spotStore.spots.map(s => ({
    id: s.id,
    type: s.type,
    name: s.name,
    x: s.x,
    y: s.y,
  }));

  const interaction: InteractionState = {
    hoveredSpotId: canvasStore.interaction.hoveredSpotId,
    selectedSpotId: canvasStore.interaction.selectedSpotId,
    isPlacingSpot: canvasStore.interaction.isPlacingSpot,
    mousePosition: canvasStore.interaction.isPlacingSpot ? mousePos.value : null,
  };

  renderer.render(spotData, canvasStore.viewport, interaction);
}

function startRenderLoop() {
  function loop() {
    render();
    animationFrameId = requestAnimationFrame(loop);
  }
  loop();
}

function stopRenderLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function handleResize() {
  if (!canvasRef.value || !renderer) return;
  const rect = canvasRef.value.getBoundingClientRect();
  canvasStore.setCanvasSize(rect.width, rect.height);
  renderer.resize(rect.width, rect.height);
}

function getMousePos(e: MouseEvent) {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function handleMouseMove(e: MouseEvent) {
  const pos = getMousePos(e);
  mousePos.value = pos;

  if (canvasStore.interaction.isDragging) {
    canvasStore.doDrag(pos.x, pos.y);
    return;
  }

  if (canvasStore.interaction.isPlacingSpot) {
    return;
  }

  if (!renderer) return;

  const spotData: SpotRenderData[] = spotStore.spots.map(s => ({
    id: s.id,
    type: s.type,
    name: s.name,
    x: s.x,
    y: s.y,
  }));

  const hit = renderer.findSpotAt(pos.x, pos.y, spotData, canvasStore.viewport);
  canvasStore.setHoveredSpot(hit ? hit.id : null);
}

function handleMouseDown(e: MouseEvent) {
  if (e.button !== 0) return;

  const pos = getMousePos(e);

  if (canvasStore.interaction.isPlacingSpot) {
    const worldPos = screenToWorld(pos.x, pos.y, canvasStore.viewport);
    emit('placeSpot', worldPos.x, worldPos.y);
    return;
  }

  if (!renderer) return;

  const spotData: SpotRenderData[] = spotStore.spots.map(s => ({
    id: s.id,
    type: s.type,
    name: s.name,
    x: s.x,
    y: s.y,
  }));

  const hit = renderer.findSpotAt(pos.x, pos.y, spotData, canvasStore.viewport);

  if (hit) {
    canvasStore.setSelectedSpot(hit.id);
    emit('spotClick', hit.id);
  } else {
    canvasStore.startDrag(pos.x, pos.y);
    canvasStore.setSelectedSpot(null);
  }
}

function handleMouseUp() {
  canvasStore.endDrag();
}

function handleWheel(e: WheelEvent) {
  e.preventDefault();
  const pos = getMousePos(e);
  const factor = e.deltaY > 0 ? 0.9 : 1.1;
  canvasStore.zoomBy(pos.x, pos.y, factor);
}

function handleMouseLeave() {
  canvasStore.setHoveredSpot(null);
  canvasStore.endDrag();
}

onMounted(() => {
  if (!canvasRef.value) return;

  renderer = new CanvasRenderer(canvasRef.value);
  handleResize();
  startRenderLoop();

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  stopRenderLoop();
  window.removeEventListener('resize', handleResize);
  renderer = null;
});

defineExpose({
  render,
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="city-map-canvas"
    :class="{
      'cursor-grab': !canvasStore.interaction.isPlacingSpot && !canvasStore.interaction.isDragging,
      'cursor-grabbing': canvasStore.interaction.isDragging,
      'cursor-crosshair': canvasStore.interaction.isPlacingSpot,
      'cursor-pointer': canvasStore.interaction.hoveredSpotId && !canvasStore.interaction.isPlacingSpot,
    }"
    @mousemove="handleMouseMove"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @wheel="handleWheel"
  />
</template>

<style lang="scss" scoped>
.city-map-canvas {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  touch-action: none;

  &.cursor-grab {
    cursor: grab;
  }

  &.cursor-grabbing {
    cursor: grabbing;
  }

  &.cursor-crosshair {
    cursor: crosshair;
  }

  &.cursor-pointer {
    cursor: pointer;
  }
}
</style>
