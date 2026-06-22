<script setup lang="ts">import { ref, computed } from 'vue';
import { MapPin, Zap, Plus, Filter } from 'lucide-vue-next';
import { useSpotStore } from '@/stores/spot';
import { useTrickStore } from '@/stores/trick';
import { SPOT_TYPE_LABELS, SPOT_TYPE_COLORS } from '@/types/spot';
import type { SpotType } from '@/types/spot';
import { TRICK_STATUS_LABELS, STATUS_COLORS } from '@/types/trick';
import type { TrickStatus } from '@/types/trick';
const emit = defineEmits<{
 (e: 'selectSpot', spotId: string): void;
 (e: 'selectTrick', trickId: string): void;
 (e: 'addSpot'): void;
 (e: 'addTrick'): void;
}>();
const spotStore = useSpotStore();
const trickStore = useTrickStore();
const activeTab = ref<'spots' | 'tricks'>('spots');
const spotFilter = ref<SpotType | 'all'>('all');
const trickFilter = ref<TrickStatus | 'all'>('all');
const filteredSpots = computed(() => {
 if (spotFilter.value === 'all')
 return spotStore.spots;
 return spotStore.spots.filter(s => s.type === spotFilter.value);
});
const filteredTricks = computed(() => {
 if (trickFilter.value === 'all')
 return trickStore.tricks;
 return trickStore.tricks.filter(t => t.status === trickFilter.value);
});
const spotTypes: SpotType[] = ['stairs', 'rail', 'bowl', 'flat', 'ramp', 'other'];
const trickStatuses: TrickStatus[] = ['learning', 'progressing', 'mastered'];
function handleSpotClick(spotId: string) {
 emit('selectSpot', spotId);
}
function handleTrickClick(trickId: string) {
 emit('selectTrick', trickId);
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="app-title">
        <span class="title-icon">🛹</span>
        SKATE MAP
      </h1>
      <p class="app-subtitle">你的街头滑板图谱</p>
    </div>

    <div class="sidebar-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'spots' }"
        @click="activeTab = 'spots'"
      >
        <MapPin :size="16" />
        <span>场地</span>
        <span class="tab-count">{{ spotStore.spotCount }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'tricks' }"
        @click="activeTab = 'tricks'"
      >
        <Zap :size="16" />
        <span>动作</span>
        <span class="tab-count">{{ trickStore.trickCount }}</span>
      </button>
    </div>

    <div class="sidebar-content">
      <template v-if="activeTab === 'spots'">
        <div class="filter-bar">
          <Filter :size="14" class="filter-icon" />
          <select v-model="spotFilter" class="filter-select">
            <option value="all">全部类型</option>
            <option v-for="type in spotTypes" :key="type" :value="type">
              {{ SPOT_TYPE_LABELS[type] }}
            </option>
          </select>
          <button class="add-btn" @click="emit('addSpot')">
            <Plus :size="14" />
            添加
          </button>
        </div>

        <div class="list-container">
          <div
            v-for="spot in filteredSpots"
            :key="spot.id"
            class="list-item spot-item"
            @click="handleSpotClick(spot.id)"
          >
            <div
              class="spot-icon"
              :style="{ backgroundColor: SPOT_TYPE_COLORS[spot.type] }"
            >
              <MapPin :size="14" />
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ spot.name }}</h3>
              <p class="item-subtitle">{{ SPOT_TYPE_LABELS[spot.type] }}</p>
            </div>
            <div class="item-tags">
              <span
                v-for="tag in spot.tags.slice(0, 2)"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div v-if="filteredSpots.length === 0" class="empty-state">
            <MapPin :size="32" class="empty-icon" />
            <p>还没有场地记录</p>
            <button class="empty-btn" @click="emit('addSpot')">
              添加第一个场地
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="filter-bar">
          <Filter :size="14" class="filter-icon" />
          <select v-model="trickFilter" class="filter-select">
            <option value="all">全部状态</option>
            <option v-for="status in trickStatuses" :key="status" :value="status">
              {{ TRICK_STATUS_LABELS[status] }}
            </option>
          </select>
          <button class="add-btn" @click="emit('addTrick')">
            <Plus :size="14" />
            添加
          </button>
        </div>

        <div class="list-container">
          <div
            v-for="trick in filteredTricks"
            :key="trick.id"
            class="list-item trick-item"
            @click="handleTrickClick(trick.id)"
          >
            <div
              class="trick-status-dot"
              :style="{ backgroundColor: STATUS_COLORS[trick.status] }"
            ></div>
            <div class="item-info">
              <h3 class="item-title">{{ trick.name }}</h3>
              <p class="item-subtitle">{{ TRICK_STATUS_LABELS[trick.status] }}</p>
            </div>
            <div class="trick-stats">
              <div class="stat">
                <span class="stat-value">{{ trickStore.getTrickStats(trick.id).totalAttempts }}</span>
                <span class="stat-label">次</span>
              </div>
            </div>
          </div>

          <div v-if="filteredTricks.length === 0" class="empty-state">
            <Zap :size="32" class="empty-icon" />
            <p>还没有动作记录</p>
            <button class="empty-btn" @click="emit('addTrick')">
              添加第一个动作
            </button>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.sidebar {
  width: 320px;
  height: 100%;
  background: rgba(15, 15, 15, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
}

.sidebar-header {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .app-title {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;

    .title-icon {
      font-size: 24px;
    }
  }

  .app-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    margin: 6px 0 0;
    letter-spacing: 1px;
  }
}

.sidebar-tabs {
  display: flex;
  padding: 0 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  &.active {
    color: #FF6B35;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20%;
      right: 20%;
      height: 2px;
      background: #FF6B35;
      border-radius: 2px 2px 0 0;
      box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
    }
  }

  .tab-count {
    background: rgba(255, 255, 255, 0.1);
    padding: 1px 6px;
    border-radius: 10px;
    font-size: 11px;
  }

  &.active .tab-count {
    background: rgba(255, 107, 53, 0.2);
  }
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  .filter-icon {
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }

  .filter-select {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    outline: none;

    &:focus {
      border-color: rgba(255, 107, 53, 0.5);
    }
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: #FF6B35;
    border: none;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #ff8559;
    }
  }
}

.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;

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

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.spot-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.trick-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.item-info {
  flex: 1;
  min-width: 0;

  .item-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-subtitle {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }
}

.item-tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;

  .tag {
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
    font-size: 10px;
    border-radius: 3px;
    white-space: nowrap;
  }
}

.trick-stats {
  .stat {
    text-align: right;

    .stat-value {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #00D4FF;
    }

    .stat-label {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.4);
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  .empty-icon {
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 12px;
  }

  p {
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    margin: 0 0 16px;
  }

  .empty-btn {
    padding: 8px 16px;
    background: rgba(255, 107, 53, 0.2);
    border: 1px solid rgba(255, 107, 53, 0.4);
    color: #FF6B35;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 107, 53, 0.3);
    }
  }
}
</style>
