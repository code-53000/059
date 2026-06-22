export type SpotType = 'stairs' | 'rail' | 'bowl' | 'flat' | 'slope' | 'other'
export type TrickCategory = 'flatground' | 'stairs' | 'rail' | 'bowl' | 'gap'
export type TrickDifficulty = 1 | 2 | 3 | 4 | 5

export interface Spot {
  id: string
  name: string
  type: SpotType
  x: number
  y: number
  tags: string[]
  roadCondition: string
  bestTime: string
  notes: string
  createdAt: number
}

export interface Trick {
  id: string
  name: string
  category: TrickCategory
  difficulty: TrickDifficulty
  notes: string
  createdAt: number
}

export interface Session {
  id: string
  trickId: string
  spotId: string | null
  date: string
  attempts: number
  successes: number
  landed: boolean
  notes: string
  createdAt: number
}

export interface Viewport {
  x: number
  y: number
  scale: number
}
