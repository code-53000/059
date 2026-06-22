<script setup lang="ts">
import { computed } from 'vue';
import { X, Zap, Trophy, Target, Clock, Plus, Trash2 } from 'lucide-vue-next';
import { useTrickStore } from '@/stores/trick';
import { useSpotStore } from '@/stores/spot';
import { TRICK_STATUS_LABELS, STATUS_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types/trick';

const props = defineProps<{
  trickId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'addLog'): void;
}>();

const trickStore = useTrickStore();
const spotStore = useSpotStore();

const trick = computed(() => trickStore.getTrickById(props.trickId));
const stats = computed(() => trickStore.getTrickStats(props.trickId));
const logs = computed(() => trickStore.getLogsByTrickId(props.trickId));

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getSpotName(spotId?: string): string {
  if (!spotId) return '未关联场地';
  const spot = spotStore.getSpotById(spotId);
  return spot ? spot.name : '未知场地';
}

function handleDeleteLog(logId: string) {
  if (confirm('确定要删除这条练习记录吗？')) {
    trickStore.deletePracticeLog(logId);
  }
}
</script>

<template>
  <div v-if="trick" class="detail-panel">
    <div class="panel-header">
      <div class="header-content">
        <div class="badges">
          <span
            class="status-badge"
            :style="{ backgroundColor: STATUS_COLORS[trick.status] + '20', color: STATUS_COLORS[trick.status] }"
          >
            {{ TRICK_STATUS_LABELS[trick.status] }}
          </span>
          <span
            class="diff-badge"
            :style="{ backgroundColor: DIFFICULTY_COLORS[trick.difficulty] + '20', color: DIFFICULTY_COLORS[trick.difficulty] }"
          >
            {{ DIFFICULTY_LABELS[trick.difficulty] }}
          </span>
        </div>
        <h2 class="panel-title">{{ trick.name }}</h2>
      </div>
      <button class="close-btn" @click="emit('close')">
        <X :size="18" />
      </button>
    </div>

    <div class="panel-body">
      <section class="stats-section">
      <div class="stat-card">
        <div class="stat-icon attempts">
          <Target :size="20" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.totalAttempts }}</span>
          <span class="stat-label">总尝试次数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <Trophy :size="20" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.totalSuccesses }}</span>
          <span class="stat-label">成功次数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rate">
          <Zap :size="20" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ Math.round(stats.successRate) }}%</span>
          <span class="stat-label">成功率</span>
        </div>
      </div>
    </section>

    <section class="info-section">
      <h3 class="section-title">
        <Clock :size="16" />
        练习心得
      </h3>
      <p class="text-content">{{ trick.notes || '暂无心得' }}</p>
    </section>

    <section class="info-section">
      <div class="section-header">
        <h3 class="section-title">
          <Target :size="16" />
          练习记录
          <span class="count-badge">{{ stats.sessionCount }}</span>
        </h3>
        <button class="add-log-btn" @click="emit('addLog')">
          <Plus :size="14" />
          记录
        </button>
      </div>

      <div class="logs-timeline">
        <div v-for="log in logs" :key="log.id" class="log-entry">
          <div class="log-dot"></div>
          <div class="log-content">
            <div class="log-header">
              <span class="log-date">{{ formatDate(log.date) }}</span>
              <button class="delete-log-btn" @click="handleDeleteLog(log.id)">
                <Trash2 :size="12" />
              </button>
            </div>
            <div class="log-spot">
              <span class="spot-name">{{ getSpotName(log.spotId) }}</span>
            </div>
            <div class="log-stats">
              <span class="stat-item">
                <span class="num">{{ log.attempts }}</span>
                <span class="label">尝试</span>
              </span>
              <span class="stat-item success">
                <span class="num">{{ log.successes }}</span>
                <span class="label">成功</span>
              </span>
              <span class="stat-item rate">
                <span class="num">
                  {{ log.attempts > 0 ? Math.round((log.successes / log.attempts) * 100) : 0 }}%
                </span>
                <span class="label">成功率</span>
              </span>
            </div>
            <p v-if="log.notes" class="log-notes">{{ log.notes }}</p>
          </div>
        </div>

        <div v-if="logs.length === 0" class="empty-logs">
          <Target :size="24" class="empty-icon" />
          <p>还没有练习记录</p>
          <button class="empty-btn" @click="emit('addLog')">
            添加第一次记录
          </button>
        </div>
      </div>
    </section>
    </div>

    <div class="panel-footer">
      <button class="btn btn-danger" @click="emit('delete')">删除动作</button>
      <button class="btn btn-primary" @click="emit('edit')">编辑</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.detail-panel {
  width: 360px;
  height: 100%;
  background: rgba(18, 18, 18, 0.98);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .header-content {
    flex: 1;
  }

  .badges {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;

    .status-badge,
    .diff-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  }

  .panel-title {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }

  .close-btn {
    width: 32px;
    height: 32px;
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

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;

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

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  text-align: center;

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.attempts {
      background: rgba(0, 212, 255, 0.15);
      color: #00D4FF;
    }

    &.success {
      background: rgba(57, 255, 20, 0.15);
      color: #39FF14;
    }

    &.rate {
      background: rgba(255, 107, 53, 0.15);
      color: #FF6B35;
    }
  }

  .stat-info {
    display: flex;
    flex-direction: column;

    .stat-number {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    .stat-label {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

.info-section {
  margin-bottom: 20px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #FF6B35;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;

    .count-badge {
      margin-left: 4px;
      background: rgba(255, 107, 53, 0.2);
      color: #FF6B35;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
    }
  }

  .add-log-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: rgba(57, 255, 20, 0.15);
    border: 1px solid rgba(57, 255, 20, 0.3);
    color: #39FF14;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(57, 255, 20, 0.25);
    }
  }
}

.text-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin: 0;
}

.logs-timeline {
  position: relative;
  padding-left: 20px;
}

.log-entry {
  position: relative;
  padding-bottom: 16px;

  &:last-child {
    padding-bottom: 0;
  }

  .log-dot {
    position: absolute;
    left: -20px;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #FF6B35;
    box-shadow: 0 0 8px rgba(255, 107, 53, 0.5);
  }

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: -16px;
    top: 18px;
    width: 2px;
    height: calc(100% - 18px);
    background: rgba(255, 255, 255, 0.1);
  }
}

.log-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 12px;

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .log-date {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
    }

    .delete-log-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: rgba(255, 51, 102, 0.5);
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 51, 102, 0.1);
        color: #FF3366;
      }
    }
  }

  .log-spot {
    margin-bottom: 8px;

    .spot-name {
      font-size: 11px;
      color: #00D4FF;
      background: rgba(0, 212, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  .log-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;

    .stat-item {
      display: flex;
      flex-direction: column;

      .num {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.8);
      }

      .label {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
      }

      &.success .num {
        color: #39FF14;
      }

      &.rate .num {
        color: #00D4FF;
      }
    }
  }

  .log-notes {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    line-height: 1.5;
    padding-top: 8px;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
  }
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  text-align: center;

  .empty-icon {
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 10px;
  }

  p {
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    margin: 0 0 12px;
  }

  .empty-btn {
    padding: 8px 16px;
    background: rgba(57, 255, 20, 0.15);
    border: 1px solid rgba(57, 255, 20, 0.3);
    color: #39FF14;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(57, 255, 20, 0.25);
    }
  }
}

.panel-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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

    &:hover {
      background: #ff8559;
    }
  }

  &.btn-danger {
    background: transparent;
    border: 1px solid rgba(255, 51, 102, 0.4);
    color: #FF3366;

    &:hover {
      background: rgba(255, 51, 102, 0.1);
    }
  }
}
</style>
