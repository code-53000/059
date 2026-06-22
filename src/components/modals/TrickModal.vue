<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, Zap } from 'lucide-vue-next';
import { useTrickStore } from '@/stores/trick';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, TRICK_STATUS_LABELS, STATUS_COLORS } from '@/types/trick';
import type { Trick, Difficulty, TrickStatus } from '@/types/trick';

const props = defineProps<{
  visible: boolean;
  editTrick?: Trick | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', trick: Trick): void;
}>();

const trickStore = useTrickStore();

const name = ref('');
const difficulty = ref<Difficulty>('medium');
const status = ref<TrickStatus>('learning');
const notes = ref('');

const isEdit = computed(() => !!props.editTrick);
const title = computed(() => isEdit.value ? '编辑动作' : '添加动作');

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];
const statuses: TrickStatus[] = ['learning', 'progressing', 'mastered'];

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.editTrick) {
        name.value = props.editTrick.name;
        difficulty.value = props.editTrick.difficulty;
        status.value = props.editTrick.status;
        notes.value = props.editTrick.notes;
      } else {
        name.value = '';
        difficulty.value = 'medium';
        status.value = 'learning';
        notes.value = '';
      }
    }
  },
  { immediate: true },
);

function handleSubmit() {
  if (!name.value.trim()) return;

  if (isEdit.value && props.editTrick) {
    trickStore.updateTrick(props.editTrick.id, {
      name: name.value.trim(),
      difficulty: difficulty.value,
      status: status.value,
      notes: notes.value,
    });
    const updated = trickStore.getTrickById(props.editTrick.id);
    if (updated) {
      emit('saved', updated);
    }
  } else {
    const newTrick = trickStore.addTrick({
      name: name.value.trim(),
      difficulty: difficulty.value,
      status: status.value,
      notes: notes.value,
    });
    emit('saved', newTrick);
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
            <Zap :size="18" />
            {{ title }}
          </h2>
          <button class="close-btn" @click="emit('close')">
            <X :size="18" />
          </button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">动作名称</label>
            <input
              v-model="name"
              type="text"
              class="form-input"
              placeholder="例如：Ollie, Kickflip"
              autofocus
            />
          </div>

          <div class="form-group">
            <label class="form-label">难度</label>
            <div class="option-row">
              <button
                v-for="diff in difficulties"
                :key="diff"
                type="button"
                class="option-btn"
                :class="{ active: difficulty === diff }"
                :style="difficulty === diff ? { borderColor: DIFFICULTY_COLORS[diff], color: DIFFICULTY_COLORS[diff] } : {}"
                @click="difficulty = diff"
              >
                {{ DIFFICULTY_LABELS[diff] }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">当前状态</label>
            <div class="option-row">
              <button
                v-for="s in statuses"
                :key="s"
                type="button"
                class="option-btn"
                :class="{ active: status === s }"
                :style="status === s ? { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s] } : {}"
                @click="status = s"
              >
                {{ TRICK_STATUS_LABELS[s] }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">练习心得</label>
            <textarea
              v-model="notes"
              class="form-textarea"
              placeholder="记录一下这个动作的要点和心得..."
              rows="4"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="emit('close')">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!name.trim()">
              {{ isEdit ? '保存修改' : '添加动作' }}
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
  gap: 8px;
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
  min-height: 80px;
}

.option-row {
  display: flex;
  gap: 8px;
}

.option-btn {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background: rgba(255, 255, 255, 0.06);
    font-weight: 600;
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
