import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Trick, PracticeLog, TrickStatus, Difficulty } from '@/types/trick';
import { generateId } from '@/utils/id';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { initialTricks, initialLogs } from '@/mock/initialData';

const TRICKS_KEY = 'tricks';
const LOGS_KEY = 'logs';

export const useTrickStore = defineStore('trick', () => {
  const tricks = ref<Trick[]>(loadFromStorage<Trick[]>(TRICKS_KEY, initialTricks));
  const practiceLogs = ref<PracticeLog[]>(loadFromStorage<PracticeLog[]>(LOGS_KEY, initialLogs));

  const trickCount = computed(() => tricks.value.length);

  const masteredCount = computed(() =>
    tricks.value.filter(t => t.status === 'mastered').length,
  );

  function getTrickById(id: string): Trick | undefined {
    return tricks.value.find(t => t.id === id);
  }

  function getLogsByTrickId(trickId: string): PracticeLog[] {
    return practiceLogs.value
      .filter(log => log.trickId === trickId)
      .sort((a, b) => b.date - a.date);
  }

  function getLogsBySpotId(spotId: string): PracticeLog[] {
    return practiceLogs.value
      .filter(log => log.spotId === spotId)
      .sort((a, b) => b.date - a.date);
  }

  function getTrickStats(trickId: string) {
    const logs = getLogsByTrickId(trickId);
    const totalAttempts = logs.reduce((sum, log) => sum + log.attempts, 0);
    const totalSuccesses = logs.reduce((sum, log) => sum + log.successes, 0);
    const successRate = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0;
    return { totalAttempts, totalSuccesses, successRate, sessionCount: logs.length };
  }

  function addTrick(data: Omit<Trick, 'id' | 'createdAt'>): Trick {
    const newTrick: Trick = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    tricks.value.push(newTrick);
    persistTricks();
    return newTrick;
  }

  function updateTrick(id: string, updates: Partial<Trick>): boolean {
    const index = tricks.value.findIndex(t => t.id === id);
    if (index === -1) return false;
    tricks.value[index] = { ...tricks.value[index], ...updates };
    persistTricks();
    return true;
  }

  function deleteTrick(id: string): boolean {
    const index = tricks.value.findIndex(t => t.id === id);
    if (index === -1) return false;
    tricks.value.splice(index, 1);
    practiceLogs.value = practiceLogs.value.filter(log => log.trickId !== id);
    persistTricks();
    persistLogs();
    return true;
  }

  function addPracticeLog(data: Omit<PracticeLog, 'id'>): PracticeLog {
    const newLog: PracticeLog = {
      ...data,
      id: generateId(),
    };
    practiceLogs.value.push(newLog);
    persistLogs();
    updateTrickStatusFromLogs(data.trickId);
    return newLog;
  }

  function deletePracticeLog(id: string): boolean {
    const index = practiceLogs.value.findIndex(log => log.id === id);
    if (index === -1) return false;
    const trickId = practiceLogs.value[index].trickId;
    practiceLogs.value.splice(index, 1);
    persistLogs();
    updateTrickStatusFromLogs(trickId);
    return true;
  }

  function updateTrickStatusFromLogs(trickId: string) {
    const stats = getTrickStats(trickId);
    let status: TrickStatus = 'learning';

    if (stats.totalAttempts === 0) {
      status = 'learning';
    } else if (stats.successRate >= 70 && stats.sessionCount >= 3) {
      status = 'mastered';
    } else if (stats.successRate >= 30 || stats.sessionCount >= 2) {
      status = 'progressing';
    }

    updateTrick(trickId, { status });
  }

  function persistTricks() {
    saveToStorage(TRICKS_KEY, tricks.value);
  }

  function persistLogs() {
    saveToStorage(LOGS_KEY, practiceLogs.value);
  }

  return {
    tricks,
    practiceLogs,
    trickCount,
    masteredCount,
    getTrickById,
    getLogsByTrickId,
    getLogsBySpotId,
    getTrickStats,
    addTrick,
    updateTrick,
    deleteTrick,
    addPracticeLog,
    deletePracticeLog,
  };
});
