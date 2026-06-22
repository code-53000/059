<script setup lang="ts">
import { ZoomIn, ZoomOut, RotateCcw, MapPin, X } from 'lucide-vue-next';
import { useCanvasStore } from '@/stores/canvas';

const props = defineProps<{
  showAddButton?: boolean;
}>();

const emit = defineEmits<{
  (e: 'addSpot'): void;
  (e: 'cancelPlace'): void;
}>();

const canvasStore = useCanvasStore();
</script>

<template>
  <div class="canvas-controls">
    <div class="control-group">
      <button class="control-btn" @click="canvasStore.zoomIn()" title="放大">
        <ZoomIn :size="18" />
      </button>
      <div class="zoom-level">{{ canvasStore.zoomPercent }}</div>
      <button class="control-btn" @click="canvasStore.zoomOut()" title="缩小">
        <ZoomOut :size="18" />
      </button>
    </div>

    <div class="control-group">
      <button class="control-btn" @click="canvasStore.resetView()" title="重置视图">
        <RotateCcw :size="18" />
      </button>
    </div>

    <div class="control-group add-group">
      <button
        v-if="!canvasStore.interaction.isPlacingSpot"
        class="control-btn add-btn"
        @click="emit('addSpot')"
        title="添加场地"
      >
        <MapPin :size="18" />
      </button>
      <button
        v-else
        class="control-btn cancel-btn"
        @click="emit('cancelPlace')"
        title="取消"
      >
        <X :size="18" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.canvas-controls {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
}

.control-group {
  display: flex;
  flex-direction: column;
  background: rgba(20, 20, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.control-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &:active {
    transform: scale(0.95);
  }
}

.zoom-level {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-family: monospace;
}

.add-btn {
  color: #FF6B35;

  &:hover {
    background: rgba(255, 107, 53, 0.2);
    color: #FF6B35;
  }
}

.cancel-btn {
  color: #FF3366;

  &:hover {
    background: rgba(255, 51, 102, 0.2);
    color: #FF3366;
  }
}
</style>
