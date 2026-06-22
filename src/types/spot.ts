export type SpotType = 'stairs' | 'rail' | 'bowl' | 'flat' | 'ramp' | 'other';

export interface Spot {
  id: string;
  name: string;
  type: SpotType;
  x: number;
  y: number;
  tags: string[];
  condition: string;
  bestTime: string;
  description: string;
  createdAt: number;
}

export const SPOT_TYPE_LABELS: Record<SpotType, string> = {
  stairs: '台阶',
  rail: '扶手',
  bowl: '碗池',
  flat: '平地',
  ramp: '斜坡',
  other: '其他',
};

export const SPOT_TYPE_COLORS: Record<SpotType, string> = {
  stairs: '#FF6B35',
  rail: '#00D4FF',
  bowl: '#39FF14',
  flat: '#FFD700',
  ramp: '#FF3366',
  other: '#9966FF',
};
