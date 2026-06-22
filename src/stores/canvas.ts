import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Viewport, CanvasSize, CanvasInteraction } from '@/types/canvas';
import { MIN_ZOOM, MAX_ZOOM } from '@/types/canvas';
import { zoomAtPoint, clamp } from '@/utils/coordinate';

export const useCanvasStore = defineStore('canvas', () => {
  const viewport = ref<Viewport>({
    zoom: 1,
    offsetX: 100,
    offsetY: 100,
  });

  const canvasSize = ref<CanvasSize>({
    width: 800,
    height: 600,
  });

  const interaction = ref<CanvasInteraction>({
    isDragging: false,
    isPlacingSpot: false,
    hoveredSpotId: null,
    selectedSpotId: null,
  });

  const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const zoomPercent = computed(() => Math.round(viewport.value.zoom * 100) + '%');

  function setCanvasSize(width: number, height: number) {
    canvasSize.value = { width, height };
  }

  function zoomBy(screenX: number, screenY: number, factor: number) {
    const oldZoom = viewport.value.zoom;
    const newZoom = clamp(oldZoom * factor, MIN_ZOOM, MAX_ZOOM);

    if (newZoom === oldZoom) return;

    const newOffset = zoomAtPoint(
      screenX,
      screenY,
      oldZoom,
      newZoom,
      { x: viewport.value.offsetX, y: viewport.value.offsetY },
    );

    viewport.value.zoom = newZoom;
    viewport.value.offsetX = newOffset.x;
    viewport.value.offsetY = newOffset.y;
  }

  function zoomIn() {
    const centerX = canvasSize.value.width / 2;
    const centerY = canvasSize.value.height / 2;
    zoomBy(centerX, centerY, 1.2);
  }

  function zoomOut() {
    const centerX = canvasSize.value.width / 2;
    const centerY = canvasSize.value.height / 2;
    zoomBy(centerX, centerY, 0.8);
  }

  function resetView() {
    viewport.value.zoom = 1;
    viewport.value.offsetX = 100;
    viewport.value.offsetY = 100;
    interaction.value.selectedSpotId = null;
  }

  function startDrag(screenX: number, screenY: number) {
    interaction.value.isDragging = true;
    dragStart.value = {
      x: screenX,
      y: screenY,
      offsetX: viewport.value.offsetX,
      offsetY: viewport.value.offsetY,
    };
  }

  function doDrag(screenX: number, screenY: number) {
    if (!interaction.value.isDragging) return;
    viewport.value.offsetX = dragStart.value.offsetX + (screenX - dragStart.value.x);
    viewport.value.offsetY = dragStart.value.offsetY + (screenY - dragStart.value.y);
  }

  function endDrag() {
    interaction.value.isDragging = false;
  }

  function setPlacingMode(active: boolean) {
    interaction.value.isPlacingSpot = active;
    if (active) {
      interaction.value.selectedSpotId = null;
    }
  }

  function setHoveredSpot(spotId: string | null) {
    interaction.value.hoveredSpotId = spotId;
  }

  function setSelectedSpot(spotId: string | null) {
    interaction.value.selectedSpotId = spotId;
  }

  function centerOnSpot(worldX: number, worldY: number) {
    const centerX = canvasSize.value.width / 2;
    const centerY = canvasSize.value.height / 2;
    viewport.value.offsetX = centerX - worldX * viewport.value.zoom;
    viewport.value.offsetY = centerY - worldY * viewport.value.zoom;
  }

  return {
    viewport,
    canvasSize,
    interaction,
    zoomPercent,
    setCanvasSize,
    zoomBy,
    zoomIn,
    zoomOut,
    resetView,
    startDrag,
    doDrag,
    endDrag,
    setPlacingMode,
    setHoveredSpot,
    setSelectedSpot,
    centerOnSpot,
  };
});
