<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCanvasStore } from '@/stores/canvas';
import { useSpotStore } from '@/stores/spot';
import { useTrickStore } from '@/stores/trick';
import Sidebar from '@/components/sidebar/Sidebar.vue';
import CityMapCanvas from '@/components/canvas/CityMapCanvas.vue';
import CanvasControls from '@/components/canvas/CanvasControls.vue';
import SpotDetailPanel from '@/components/detail/SpotDetailPanel.vue';
import TrickDetailPanel from '@/components/detail/TrickDetailPanel.vue';
import SpotModal from '@/components/modals/SpotModal.vue';
import TrickModal from '@/components/modals/TrickModal.vue';
import PracticeLogModal from '@/components/modals/PracticeLogModal.vue';
import type { Spot } from '@/types/spot';
import type { Trick } from '@/types/trick';

const canvasStore = useCanvasStore();
const spotStore = useSpotStore();
const trickStore = useTrickStore();

const selectedSpotId = ref<string | null>(null);
const selectedTrickId = ref<string | null>(null);
const detailType = ref<'spot' | 'trick' | null>(null);

const showSpotModal = ref(false);
const showTrickModal = ref(false);
const showLogModal = ref(false);

const editingSpot = ref<Spot | null>(null);
const editingTrick = ref<Trick | null>(null);
const newSpotPosition = ref<{ x: number; y: number } | null>(null);
const logModalTrickId = ref<string>('');
const logModalSpotId = ref<string>('');

const showDetailPanel = computed(() => detailType.value !== null);

function handleSpotClick(spotId: string) {
  selectedSpotId.value = spotId;
  selectedTrickId.value = null;
  detailType.value = 'spot';
}

function handleTrickClick(trickId: string) {
  selectedTrickId.value = trickId;
  selectedSpotId.value = null;
  detailType.value = 'trick';
}

function handleCanvasSpotClick(spotId: string) {
  handleSpotClick(spotId);
}

function handlePlaceSpot(x: number, y: number) {
  newSpotPosition.value = { x, y };
  canvasStore.setPlacingMode(false);
  showSpotModal.value = true;
  editingSpot.value = null;
}

function handleAddSpot() {
  if (canvasStore.interaction.isPlacingSpot) {
    canvasStore.setPlacingMode(false);
  } else {
    canvasStore.setPlacingMode(true);
    detailType.value = null;
  }
}

function handleCancelPlace() {
  canvasStore.setPlacingMode(false);
}

function handleAddTrick() {
  editingTrick.value = null;
  showTrickModal.value = true;
}

function handleEditSpot() {
  if (selectedSpotId.value) {
    editingSpot.value = spotStore.getSpotById(selectedSpotId.value) || null;
    showSpotModal.value = true;
  }
}

function handleDeleteSpot() {
  if (selectedSpotId.value && confirm('确定要删除这个场地吗？相关的练习记录不会被删除。')) {
    spotStore.deleteSpot(selectedSpotId.value);
    detailType.value = null;
    selectedSpotId.value = null;
    canvasStore.setSelectedSpot(null);
  }
}

function handleEditTrick() {
  if (selectedTrickId.value) {
    editingTrick.value = trickStore.getTrickById(selectedTrickId.value) || null;
    showTrickModal.value = true;
  }
}

function handleDeleteTrick() {
  if (selectedTrickId.value && confirm('确定要删除这个动作吗？相关的练习记录也会被删除。')) {
    trickStore.deleteTrick(selectedTrickId.value);
    detailType.value = null;
    selectedTrickId.value = null;
  }
}

function handleSpotSaved(spot: Spot) {
  selectedSpotId.value = spot.id;
  detailType.value = 'spot';
  canvasStore.setSelectedSpot(spot.id);
  canvasStore.centerOnSpot(spot.x, spot.y);
}

function handleTrickSaved(trick: Trick) {
  selectedTrickId.value = trick.id;
  detailType.value = 'trick';
}

function handleAddLog() {
  logModalTrickId.value = selectedTrickId.value || '';
  logModalSpotId.value = selectedSpotId.value || '';
  showLogModal.value = true;
}

function handleCloseDetail() {
  detailType.value = null;
  selectedSpotId.value = null;
  selectedTrickId.value = null;
  canvasStore.setSelectedSpot(null);
}
</script>

<template>
  <div class="home-page">
    <Sidebar
      @select-spot="handleSpotClick"
      @select-trick="handleTrickClick"
      @add-spot="handleAddSpot"
      @add-trick="handleAddTrick"
    />

    <main class="canvas-container">
      <CityMapCanvas
        @spot-click="handleCanvasSpotClick"
        @place-spot="handlePlaceSpot"
      />
      <CanvasControls
        @add-spot="handleAddSpot"
        @cancel-place="handleCancelPlace"
      />

      <div v-if="canvasStore.interaction.isPlacingSpot" class="placing-hint">
        点击地图选择场地位置
      </div>
    </main>

    <transition name="slide">
      <SpotDetailPanel
        v-if="detailType === 'spot' && selectedSpotId"
        :spot-id="selectedSpotId"
        @close="handleCloseDetail"
        @edit="handleEditSpot"
        @delete="handleDeleteSpot"
        @add-log="handleAddLog"
      />
    </transition>

    <transition name="slide">
      <TrickDetailPanel
        v-if="detailType === 'trick' && selectedTrickId"
        :trick-id="selectedTrickId"
        @close="handleCloseDetail"
        @edit="handleEditTrick"
        @delete="handleDeleteTrick"
        @add-log="handleAddLog"
      />
    </transition>

    <SpotModal
      :visible="showSpotModal"
      :edit-spot="editingSpot"
      :initial-x="newSpotPosition?.x"
      :initial-y="newSpotPosition?.y"
      @close="showSpotModal = false; newSpotPosition = null"
      @saved="handleSpotSaved"
    />

    <TrickModal
      :visible="showTrickModal"
      :edit-trick="editingTrick"
      @close="showTrickModal = false"
      @saved="handleTrickSaved"
    />

    <PracticeLogModal
      :visible="showLogModal"
      :trick-id="logModalTrickId"
      :spot-id="logModalSpotId"
      @close="showLogModal = false"
      @saved="() => {}"
    />
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #0a0a0a;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.placing-hint {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: rgba(255, 107, 53, 0.9);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  z-index: 20;
  animation: pulse 2s infinite;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
