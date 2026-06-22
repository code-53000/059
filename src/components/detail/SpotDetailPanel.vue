<script setup lang="ts">
import { computed } from 'vue';
import { X, MapPin, Clock, Tag, FileText, Calendar, Zap } from 'lucide-vue-next';
import { useSpotStore } from '@/stores/spot';
import { useTrickStore } from '@/stores/trick';
import { useCanvasStore } from '@/stores/canvas';
import { SPOT_TYPE_LABELS, SPOT_TYPE_COLORS } from '@/types/spot';
import { TRICK_STATUS_LABELS, STATUS_COLORS } from '@/types/trick';

const props = defineProps<{
  spotId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'addLog'): void;
}>();

const spotStore = useSpotStore();
const trickStore = useTrickStore();
const canvasStore = useCanvasStore();

const spot = computed(() => spotStore.getSpotById(props.spotId));
const relatedLogs = computed(() => trickStore.getLogsBySpotId(props.spotId));

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

function getTrickName(trickId: string): string {
  const trick = trickStore.getTrickById(trickId);
  return trick ? trick.name : '未知动作';
}

function handleLocate() {
  if (spot.value) {
    canvasStore.centerOnSpot(spot.value.x, spot.value.y);
  }
}
</script>

<template>
  <div v-if="spot" class="detail-panel">
    <div class="panel-header">
      <div class="header-content">
        <div
          class="spot-type-badge"
          :style="{ backgroundColor: SPOT_TYPE_COLORS[spot.type], color: '#fff' }"
        >
          {{ SPOT_TYPE_LABELS[spot.type] }}
        </div>
        <h2 class="panel-title">{{ spot.name }}</h2>
      </div>
      <button class="close-btn" @click="emit('close')">
        <X :size="18" />
      </button>
    </div>

    <div class="panel-body">
      <section class="info-section">
        <h3 class="section-title">
          <MapPin :size="16" />
          位置信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">坐标</span>
            <span class="info-value">{{ Math.round(spot.x) }}, {{ Math.round(spot.y) }}</span>
          </div>
          <button class="locate-btn" @click="handleLocate">
            <MapPin :size="14" />
            在地图上定位
          </button>
        </div>
      </section>

      <section class="info-section">
        <h3 class="section-title">
          <Tag :size="16" />
          标签
        </h3>
        <div class="tags-container">
          <span v-for="tag in spot.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
          <span v-if="spot.tags.length === 0" class="empty-text">暂无标签</span>
        </div>
      </section>

      <section class="info-section">
        <h3 class="section-title">
          <Clock :size="16" />
          最佳时段
        </h3>
        <p class="text-content">{{ spot.bestTime || '未设置' }}</p>
      </section>

      <section class="info-section">
        <h3 class="section-title">
          <FileText :size="16" />
          路况描述
        </h3>
        <p class="text-content">{{ spot.condition || '未描述' }}</p>
      </section>

      <section class="info-section">
        <h3 class="section-title">
          <Calendar :size="16" />
          场地备注
        </h3>
        <p class="text-content">{{ spot.description || '无备注' }}</p>
      </section>

      <section class="info-section">
        <h3 class="section-title">
          <Zap :size="16" />
          在这里练过的动作
          <span class="count-badge">{{ relatedLogs.length }}</span>
        </h3>
        <div class="logs-list">
          <div v-for="log in relatedLogs" :key="log.id" class="log-item">
            <div class="log-header">
              <span class="log-trick-name">{{ getTrickName(log.trickId) }}</span>
              <span class="log-date">{{ formatDate(log.date) }}</span>
            </div>
            <div class="log-stats">
              <span class="log-stat">
                <span class="stat-num">{{ log.attempts }}</span>
                <span class="stat-label">尝试</span>
              </span>
              <span class="log-stat success">
                <span class="stat-num">{{ log.successes }}</span>
                <span class="stat-label">成功</span>
              </span>
              <span class="log-stat rate">
                <span class="stat-num">
                  {{ log.attempts > 0 ? Math.round((log.successes / log.attempts) * 100) : 0 }}%
                </span>
                <span class="stat-label">成功率</span>
              </span>
            </div>
            <p v-if="log.notes" class="log-notes">{{ log.notes }}</p>
          </div>
          <div v-if="relatedLogs.length === 0" class="empty-text">
            还没有在这里的练习记录
          </div>
        </div>
      </section>
    </div>

    <div class="panel-footer">
      <button class="btn btn-danger" @click="emit('delete')">删除</button>
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

  .spot-type-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 10px;
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

.info-section {
  margin-bottom: 20px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #FF6B35;
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 1px;

    .count-badge {
      margin-left: auto;
      background: rgba(255, 107, 53, 0.2);
      color: #FF6B35;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.info-item {
  .info-label {
    display: block;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 2px;
  }

  .info-value {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    font-family: monospace;
  }
}

.locate-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00D4FF;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.25);
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .tag {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.text-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin: 0;
}

.empty-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  font-style: italic;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .log-trick-name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }

    .log-date {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .log-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;

    .log-stat {
      display: flex;
      flex-direction: column;

      .stat-num {
        font-size: 16px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.8);
      }

      .stat-label {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
      }

      &.success .stat-num {
        color: #39FF14;
      }

      &.rate .stat-num {
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
