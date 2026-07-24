export type CardType =
  | 'crab'
  | 'boat'
  | 'fish'
  | 'swimmer'
  | 'shark'
  | 'shell'
  | 'octopus'
  | 'penguin'
  | 'sailor'
  | 'lighthouse'
  | 'shoal'
  | 'colony'
  | 'captain'
  | 'mermaid'
  | 'unknown'

export type CardColor =
  | 'yellow'
  | 'green'
  | 'pink'
  | 'purple'
  | 'lightblue'
  | 'darkblue'
  | 'black'
  | 'gray'
  | 'white'

export interface Card {
  id: string
  type: CardType
  color: CardColor
}

export interface ScoreLine {
  label: string
  points: number
  detail?: string
}

export interface ScoreResult {
  total: number
  win: boolean
  lines: ScoreLine[]
}

export interface ColorBucket {
  color: CardColor
  count: number
  label: string
}

export const CARD_TYPES: CardType[] = [
  'crab', 'boat', 'fish', 'swimmer', 'shark',
  'shell', 'octopus', 'penguin', 'sailor',
  'lighthouse', 'shoal', 'colony', 'captain',
  'mermaid'
]

export const CARD_COLORS: CardColor[] = [
  'yellow', 'green', 'pink', 'purple',
  'lightblue', 'darkblue', 'black', 'gray', 'white'
]

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  crab: 'Crabe',
  boat: 'Bateau',
  fish: 'Poisson',
  swimmer: 'Nageur',
  shark: 'Requin',
  shell: 'Coquillage',
  octopus: 'Pieuvre',
  penguin: 'Pingouin',
  sailor: 'Marin',
  lighthouse: 'Phare',
  shoal: 'Banc de poissons',
  colony: 'Colonie de pingouins',
  captain: 'Capitaine',
  mermaid: 'Sirène',
  unknown: 'Inconnu'
}

export const CARD_COLOR_LABELS: Record<CardColor, string> = {
  yellow: 'Jaune',
  green: 'Vert',
  pink: 'Rose',
  purple: 'Violet',
  lightblue: 'Bleu clair',
  darkblue: 'Bleu foncé',
  black: 'Noir',
  gray: 'Gris',
  white: 'Blanc'
}

export const CARD_TYPE_META: Record<CardType, { category: 'duo' | 'collector' | 'multiplier' | 'mermaid' | 'unknown'; count: number }> = {
  crab:      { category: 'duo',        count: 9 },
  boat:      { category: 'duo',        count: 8 },
  fish:      { category: 'duo',        count: 7 },
  swimmer:   { category: 'duo',        count: 5 },
  shark:     { category: 'duo',        count: 5 },
  shell:     { category: 'collector',  count: 6 },
  octopus:   { category: 'collector',  count: 5 },
  penguin:   { category: 'collector',  count: 3 },
  sailor:    { category: 'collector',  count: 2 },
  lighthouse: { category: 'multiplier', count: 1 },
  shoal:     { category: 'multiplier', count: 1 },
  colony:    { category: 'multiplier', count: 1 },
  captain:   { category: 'multiplier', count: 1 },
  mermaid:   { category: 'mermaid',    count: 4 },
  unknown:   { category: 'unknown',    count: 0 }
}
