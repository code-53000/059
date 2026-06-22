export type TrickStatus = 'learning' | 'progressing' | 'mastered';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'pro';

export interface Trick {
  id: string;
  name: string;
  difficulty: Difficulty;
  status: TrickStatus;
  notes: string;
  createdAt: number;
}

export interface PracticeLog {
  id: string;
  trickId: string;
  spotId?: string;
  date: number;
  attempts: number;
  successes: number;
  notes: string;
}

export const TRICK_STATUS_LABELS: Record<TrickStatus, string> = {
  learning: '练习中',
  progressing: '进步中',
  mastered: '已掌握',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  pro: '专业',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#39FF14',
  medium: '#FFD700',
  hard: '#FF6B35',
  pro: '#FF3366',
};

export const STATUS_COLORS: Record<TrickStatus, string> = {
  learning: '#FF3366',
  progressing: '#FFD700',
  mastered: '#39FF14',
};
