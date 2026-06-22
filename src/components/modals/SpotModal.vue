<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, MapPin } from 'lucide-vue-next';
import { useSpotStore } from '@/stores/spot';
import { SPOT_TYPE_LABELS } from '@/types/spot';
import type { Spot, SpotType } from '@/types/spot';

const props = defineProps<{
  visible: boolean;
  editSpot?: Spot | null;
  initialX?: number;
  initialY?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', spot: Spot): void;
}>();

const spotStore = useSpotStore();

const name = ref('');
const type = ref<SpotType>('other');
const tagsInput = ref('');
const condition = ref('');
const bestTime = ref('');
const description = ref('');
const x = ref(0);
const y = ref(0);

const isEdit = computed(() => !!props.editSpot);
const title = computed(() => isEdit.value ? '编辑场地' : '添加场地');

const spotTypes: SpotType[] = ['stairs', 'rail', 'bowl', 'flat', 'ramp', 'other'];

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.editSpot) {
        name.value = props.editSpot.name;
        type.value = props.editSpot.type;
        tagsInput.value = props.editSpot.tags.join(', ');
        condition.value = props.editSpot.condition;
        bestTime.value = props.editSpot.bestTime;
        description.value = props.editSpot.description;
        x.value = props.editSpot.x;
        y.value = props.editSpot.y;
      } else {
        name.value = '';
        type.value = 'other';
        tagsInput.value = '';
        condition.value = '';
        bestTime.value = '';
        description.value = '';
        x.value = props.initialX ?? 0;
        y.value = props.initialY ?? 0;
      }
    }
  },
  { immediate: true },
);

function handleSubmit() {
  if (!name.value.trim()) return;

  const tags = tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  if (isEdit.value && props.editSpot) {
    spotStore.updateSpot(props.editSpot.id, {
      name: name.value.trim(),
      type: type.value,
      tags,
      condition: condition.value,
      bestTime: bestTime.value,
      description: description.value,
    });
    const updated = spotStore.getSpotById(props.editSpot.id);
    if (updated) {
      emit('saved', updated);
    }
  } else {
    const newSpot = spotStore.addSpot({
      name: name.value.trim(),
      type: type.value,
      x: x.value,
      y: y.value,
      tags,
      condition: condition.value,
      bestTime: bestTime.value,
      description: description.value,
    });
    emit('saved', newSpot);
  }

  emit('close');
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close');
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleBackdropClick">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">
            <MapPin :size="18" />
            {{ title }}
          </h2>
          <button class="close-btn" @click="emit('close')">
            <X :size="18" />
          </button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">场地名称</label>
            <input
              v-model="name"
              type="text"
              class="form-input"
              placeholder="给这个场地起个名字"
              autofocus
            />
          </div>

          <div class="form-group">
            <label class="form-label">场地类型</label>
            <div class="type-grid">
              <button
                v-for="spotType in spotTypes"
                :key="spotType"
                type="button"
                class="type-btn"
                :class="{ active: type === spotType }"
                @click="type = spotType"
              >
                {{ SPOT_TYPE_LABELS[spotType] }}
              </button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">X 坐标</label>
              <input
                v-model.number="x"
                type="number"
                class="form-input"
                step="1"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Y 坐标</label>
              <input
                v-model.number="y"
                type="number"
                class="form-input"
                step="1"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">标签（逗号分隔）</label>
            <input
              v-model="tagsInput"
              type="text"
              class="form-input"
              placeholder="例如：经典, 6阶, 大理石"
            />
          </div>

          <div class="form-group">
            <label class="form-label">最佳时段</label>
            <input
              v-model="bestTime"
              type="text"
              class="form-input"
              placeholder="例如：傍晚 5-7 点"
            />
          </div>

          <div class="form-group">
            <label class="form-label">路况描述</label>
            <input
              v-model="condition"
              type="text"
              class="form-input"
              placeholder="地面状况、有什么特别的"
            />
          </div>

          <div class="form-group">
            <label class="form-label">场地备注</label>
            <textarea
              v-model="description"
              class="form-textarea"
              placeholder="关于这个场地的更多描述..."
              rows="3"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="emit('close')">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!name.trim()">
              {{ isEdit ? '保存修改' : '添加场地' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  width: 440px;
  max-height: 90vh;
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .modal-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: inherit;

  &:focus {
    border-color: rgba(255, 107, 53, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type-btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background: rgba(255, 107, 53, 0.2);
    border-color: rgba(255, 107, 53, 0.5);
    color: #FF6B35;
  }
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding-top: 4px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.btn-primary {
    background: #FF6B35;
    color: #fff;

    &:hover:not(:disabled) {
      background: #ff8559;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &.btn-secondary {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
