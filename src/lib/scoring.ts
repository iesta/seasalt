import type { Card, CardColor, CardType, ScoreResult, ScoreLine } from './types'

const SHELL_POINTS: Record<number, number> = { 1: 0, 2: 2, 3: 4, 4: 6, 5: 8, 6: 10 }
const OCTOPUS_POINTS: Record<number, number> = { 1: 0, 2: 3, 3: 6, 4: 9, 5: 12 }
const PENGUIN_POINTS: Record<number, number> = { 1: 1, 2: 3, 3: 5 }
const SAILOR_POINTS: Record<number, number> = { 1: 0, 2: 5 }

function countByType(cards: Card[]): Map<CardType, number> {
  const m = new Map<CardType, number>()
  for (const c of cards) {
    m.set(c.type, (m.get(c.type) ?? 0) + 1)
  }
  return m
}

function countByColor(cards: Card[]): Map<CardColor, number> {
  const m = new Map<CardColor, number>()
  for (const c of cards) {
    m.set(c.color, (m.get(c.color) ?? 0) + 1)
  }
  return m
}

function lookupTier(count: number, table: Record<number, number>): number {
  const capped = Math.min(count, Math.max(...Object.keys(table).map(Number)))
  return table[capped] ?? 0
}

function scoreDuos(byType: Map<CardType, number>): ScoreLine[] {
  const lines: ScoreLine[] = []
  const crabPairs = Math.floor((byType.get('crab') ?? 0) / 2)
  const boatPairs = Math.floor((byType.get('boat') ?? 0) / 2)
  const fishPairs = Math.floor((byType.get('fish') ?? 0) / 2)
  const swimmerSharkPairs = Math.floor(
    Math.min(byType.get('swimmer') ?? 0, byType.get('shark') ?? 0)
  )

  if (crabPairs > 0) lines.push({ label: 'Paires de crabes', points: crabPairs, detail: `${crabPairs} × 1 pt` })
  if (boatPairs > 0) lines.push({ label: 'Paires de bateaux', points: boatPairs, detail: `${boatPairs} × 1 pt` })
  if (fishPairs > 0) lines.push({ label: 'Paires de poissons', points: fishPairs, detail: `${fishPairs} × 1 pt` })
  if (swimmerSharkPairs > 0) lines.push({ label: 'Paires nageur + requin', points: swimmerSharkPairs, detail: `${swimmerSharkPairs} × 1 pt` })

  return lines
}

function scoreCollectors(byType: Map<CardType, number>): ScoreLine[] {
  const lines: ScoreLine[] = []
  const shells = byType.get('shell') ?? 0
  const octopuses = byType.get('octopus') ?? 0
  const penguins = byType.get('penguin') ?? 0
  const sailors = byType.get('sailor') ?? 0

  if (shells > 0) {
    const pts = lookupTier(shells, SHELL_POINTS)
    lines.push({ label: 'Coquillages', points: pts, detail: `${shells} carte(s) → ${pts} pts` })
  }
  if (octopuses > 0) {
    const pts = lookupTier(octopuses, OCTOPUS_POINTS)
    lines.push({ label: 'Pieuvres', points: pts, detail: `${octopuses} carte(s) → ${pts} pts` })
  }
  if (penguins > 0) {
    const pts = lookupTier(penguins, PENGUIN_POINTS)
    lines.push({ label: 'Pingouins', points: pts, detail: `${penguins} carte(s) → ${pts} pts` })
  }
  if (sailors > 0) {
    const pts = lookupTier(sailors, SAILOR_POINTS)
    lines.push({ label: 'Marins', points: pts, detail: `${sailors} carte(s) → ${pts} pts` })
  }

  return lines
}

function scoreMultipliers(byType: Map<CardType, number>): ScoreLine[] {
  const lines: ScoreLine[] = []
  const boats = byType.get('boat') ?? 0
  const fish = byType.get('fish') ?? 0
  const penguins = byType.get('penguin') ?? 0
  const sailors = byType.get('sailor') ?? 0

  if (byType.get('lighthouse')) {
    const pts = boats
    lines.push({ label: 'Phare', points: pts, detail: `1 pt × ${boats} bateau(x)` })
  }
  if (byType.get('shoal')) {
    const pts = fish
    lines.push({ label: 'Banc de poissons', points: pts, detail: `1 pt × ${fish} poisson(s)` })
  }
  if (byType.get('colony')) {
    const pts = 2 * penguins
    lines.push({ label: 'Colonie de pingouins', points: pts, detail: `2 pts × ${penguins} pingouin(s)` })
  }
  if (byType.get('captain')) {
    const pts = 3 * sailors
    lines.push({ label: 'Capitaine', points: pts, detail: `3 pts × ${sailors} marin(s)` })
  }

  return lines
}

function scoreMermaids(cards: Card[]): ScoreLine[] {
  const mermaidCount = cards.filter(c => c.type === 'mermaid').length
  if (mermaidCount === 0) return []

  const colorCounts = countByColor(cards)
  colorCounts.delete('white')

  const sortedColors = [...colorCounts.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])

  const lines: ScoreLine[] = []
  let total = 0
  for (let i = 0; i < mermaidCount; i++) {
    const [color, n] = sortedColors[i] ?? ['none', 0]
    if (n === 0) break
    total += n
    lines.push({
      label: `Sirène ${i + 1}`,
      points: n,
      detail: `${n} carte(s) ${color}`
    })
  }

  if (lines.length === 0) {
    lines.push({ label: 'Sirènes', points: 0, detail: `${mermaidCount} sirène(s) sans couleur majoritaire` })
  }

  return lines
}

export function score(cards: Card[]): ScoreResult {
  const mermaidCount = cards.filter(c => c.type === 'mermaid').length
  if (mermaidCount >= 4) {
    return {
      total: 0,
      win: true,
      lines: [{ label: '4 sirènes', points: 0, detail: 'Victoire immédiate!' }]
    }
  }

  const byType = countByType(cards)
  const lines: ScoreLine[] = [
    ...scoreDuos(byType),
    ...scoreCollectors(byType),
    ...scoreMultipliers(byType),
    ...scoreMermaids(cards)
  ]

  const total = lines.reduce((sum, l) => sum + l.points, 0)
  return { total, win: false, lines }
}
