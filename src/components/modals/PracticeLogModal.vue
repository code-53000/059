<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, Target } from 'lucide-vue-next';
import { useTrickStore } from '@/stores/trick';
import { useSpotStore } from '@/stores/spot';
import type { Trick } from '@/types/trick';

const props = defineProps<{
  visible: boolean;
  trickId?: string;
  spotId?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const trickStore = useTrickStore();
const spotStore = useSpotStore();

const selectedTrickId = ref('');
const selectedSpotId = ref('');
const attempts = ref(10);
const successes = ref(0);
const notes = ref('');

const tricks = computed(() => trickStore.tricks);
const spots = computed(() => spotStore.spots);

const successRate = computed(() => {
  if (attempts.value === 0) return 0;
  return Math.round((successes.value / attempts.value) * 100);
});

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      selectedTrickId.value = props.trickId || (tricks.value[0]?.id ?? '');
      selectedSpotId.value = props.spotId || '';
      attempts.value = 10;
      successes.value = 0;
      notes.value = '';
    }
  },
  { immediate: true },
);

function handleSubmit() {
  if (!selectedTrickId.value) return;

  trickStore.addPracticeLog({
    trickId: selectedTrickId.value,
    spotId: selectedSpotId.value || undefined,
    date: Date.now(),
    attempts: attempts.value,
    successes: successes.value,
    notes: notes.value.trim(),
  });

  emit('saved');
  emit('close');
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close');
  }
}

function increment(field: 'attempts' | 'successes', delta: number) {
  if (field === 'attempts') {
    attempts.value = Math.max(0, attempts.value + delta);
    if (successes.value > attempts.value) {
      successes.value = attempts.value;
    }
  } else {
    successes.value = Math.max(0, Math.min(attempts.value, successes.value + delta));
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleBackdropClick">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">
            <Target :size="18" />
            记录练习
          </h2>
          <button class="close-btn" @click="emit('close')">
            <X :size="18" />
          </button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">动作</label>
            <select v-model="selectedTrickId" class="form-select">
              <option v-for="trick in tricks" :key="trick.id" :value="trick.id">
                {{ trick.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">场地（可选）</label>
            <select v-model="selectedSpotId" class="form-select">
              <option value="">不关联场地</option>
              <option v-for="spot in spots" :key="spot.id" :value="spot.id">
                {{ spot.name }}
              </option>
            </select>
          </div>

          <div class="counter-section">
            <div class="counter-group">
              <label class="form-label">尝试次数</label>
              <div class="counter">
                <button type="button" class="counter-btn" @click="increment('attempts', -5)">
                  -5
                </button>
                <button type="button" class="counter-btn" @click="increment('attempts', -1)">
                  -
                </button>
                <span class="counter-value">{{ attempts }}</span>
                <button type="button" class="counter-btn" @click="increment('attempts', 1)">
                  +
                </button>
                <button type="button" class="counter-btn" @click="increment('attempts', 5)">
                  +5
                </button>
              </div>
            </div>

            <div class="counter-group">
              <label class="form-label">成功次数</label>
              <div class="counter">
                <button type="button" class="counter-btn success" @click="increment('successes', -5)">
                  -5
                </button>
                <button type="button" class="counter-btn success" @click="increment('successes', -1)">
                  -
                </button>
                <span class="counter-value success">{{ successes }}</span>
                <button type="button" class="counter-btn success" @click="increment('successes', 1)">
                  +
                </button>
                <button type="button" class="counter-btn success" @click="increment('successes', 5)">
                  +5
                </button>
              </div>
            </div>
          </div>

          <div class="rate-display">
            <div class="rate-bar">
              <div
                class="rate-fill"
                :style="{ width: successRate + '%' }"
              ></div>
            </div>
            <span class="rate-text">成功率 {{ successRate }}%</span>
          </div>

          <div class="form-group">
            <label class="form-label">练习心得</label>
            <textarea
              v-model="notes"
              class="form-textarea"
              placeholder="今天练得怎么样？有什么感想..."
              rows="3"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="emit('close')">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!selectedTrickId">
              保存记录
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
  width: 420px;
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

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

.form-select {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
  cursor: pointer;

  &:focus {
    border-color: rgba(255, 107, 53, 0.5);
  }
}

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
  resize: vertical;
  min-height: 60px;

  &:focus {
    border-color: rgba(255, 107, 53, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
}

.counter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.counter-group {
  .form-label {
    margin-bottom: 8px;
    display: block;
  }
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.counter-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  &:active {
    transform: scale(0.95);
  }

  &.success {
    color: #39FF14;
    border-color: rgba(57, 255, 20, 0.2);

    &:hover {
      background: rgba(57, 255, 20, 0.1);
    }
  }
}

.counter-value {
  min-width: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  font-family: monospace;

  &.success {
    color: #39FF14;
  }
}

.rate-display {
  display: flex;
  align-items: center;
  gap: 12px;

  .rate-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;

    .rate-fill {
      height: 100%;
      background: linear-gradient(90deg, #FF3366, #FFD700, #39FF14);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
  }

  .rate-text {
    font-size: 13px;
    font-weight: 600;
    color: #00D4FF;
    font-family: monospace;
    min-width: 60px;
    text-align: right;
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
