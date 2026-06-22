import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Spot, SpotType } from '@/types/spot';
import { generateId } from '@/utils/id';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { initialSpots } from '@/mock/initialData';

const STORAGE_KEY = 'spots';

export const useSpotStore = defineStore('spot', () => {
  const spots = ref<Spot[]>(loadFromStorage<Spot[]>(STORAGE_KEY, initialSpots));

  const spotCount = computed(() => spots.value.length);

  const spotsByType = computed(() => {
    const map = new Map<SpotType, Spot[]>();
    for (const spot of spots.value) {
      if (!map.has(spot.type)) {
        map.set(spot.type, []);
      }
      map.get(spot.type)!.push(spot);
    }
    return map;
  });

  function getSpotById(id: string): Spot | undefined {
    return spots.value.find(s => s.id === id);
  }

  function addSpot(data: Omit<Spot, 'id' | 'createdAt'>): Spot {
    const newSpot: Spot = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    spots.value.push(newSpot);
    persist();
    return newSpot;
  }

  function updateSpot(id: string, updates: Partial<Spot>): boolean {
    const index = spots.value.findIndex(s => s.id === id);
    if (index === -1) return false;
    spots.value[index] = { ...spots.value[index], ...updates };
    persist();
    return true;
  }

  function deleteSpot(id: string): boolean {
    const index = spots.value.findIndex(s => s.id === id);
    if (index === -1) return false;
    spots.value.splice(index, 1);
    persist();
    return true;
  }

  function persist() {
    saveToStorage(STORAGE_KEY, spots.value);
  }

  return {
    spots,
    spotCount,
    spotsByType,
    getSpotById,
    addSpot,
    updateSpot,
    deleteSpot,
    persist,
  };
});
