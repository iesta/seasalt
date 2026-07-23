import { describe, it, expect } from 'vitest'
import { score } from './scoring'
import type { Card } from './types'

let idCounter = 0
function card(type: Card['type'], color: Card['color'] = 'yellow'): Card {
  return { id: `c${idCounter++}`, type, color }
}

describe('score — duos', () => {
  it('2 crabes = 1 pt', () => {
    expect(score([card('crab'), card('crab')]).total).toBe(1)
  })

  it('3 crabes = 1 pt (1 paire, 1 reste seul)', () => {
    expect(score([card('crab'), card('crab'), card('crab')]).total).toBe(1)
  })

  it('4 crabes = 2 pts', () => {
    expect(score([card('crab'), card('crab'), card('crab'), card('crab')]).total).toBe(2)
  })

  it('1 crabe seul = 0 pt', () => {
    expect(score([card('crab')]).total).toBe(0)
  })

  it('2 bateaux + 2 poissons = 2 pts', () => {
    expect(score([card('boat'), card('boat'), card('fish'), card('fish')]).total).toBe(2)
  })

  it('1 nageur + 1 requin = 1 pt', () => {
    expect(score([card('swimmer'), card('shark')]).total).toBe(1)
  })

  it('2 nageurs + 1 requin = 1 pt (1 paire seulement)', () => {
    expect(score([card('swimmer'), card('swimmer'), card('shark')]).total).toBe(1)
  })
})

describe('score — collectors', () => {
  it('1 coquillage = 0 pt', () => {
    expect(score([card('shell')]).total).toBe(0)
  })

  it('2 coquillages = 2 pts', () => {
    expect(score([card('shell'), card('shell')]).total).toBe(2)
  })

  it('3 coquillages = 4 pts', () => {
    expect(score([card('shell'), card('shell'), card('shell')]).total).toBe(4)
  })

  it('6 coquillages = 10 pts (cap)', () => {
    expect(score(Array.from({ length: 6 }, () => card('shell'))).total).toBe(10)
  })

  it('8 coquillages = 10 pts (cap appliqué)', () => {
    expect(score(Array.from({ length: 8 }, () => card('shell'))).total).toBe(10)
  })

  it('3 pieuvres = 6 pts', () => {
    expect(score([card('octopus'), card('octopus'), card('octopus')]).total).toBe(6)
  })

  it('5 pieuvres = 12 pts (cap)', () => {
    expect(score(Array.from({ length: 5 }, () => card('octopus'))).total).toBe(12)
  })

  it('1 pingouin = 1 pt', () => {
    expect(score([card('penguin')]).total).toBe(1)
  })

  it('3 pingouins = 5 pts', () => {
    expect(score([card('penguin'), card('penguin'), card('penguin')]).total).toBe(5)
  })

  it('1 marin = 0 pt', () => {
    expect(score([card('sailor')]).total).toBe(0)
  })

  it('2 marins = 5 pts', () => {
    expect(score([card('sailor'), card('sailor')]).total).toBe(5)
  })
})

describe('score — multipliers', () => {
  it('phare + 2 bateaux = 3 pts (1 duo + 2 phare)', () => {
    expect(score([card('lighthouse'), card('boat'), card('boat')]).total).toBe(3)
  })

  it('phare sans bateau = 0 pt', () => {
    expect(score([card('lighthouse')]).total).toBe(0)
  })

  it('banc + 3 poissons = 4 pts (1 duo + 3 banc)', () => {
    expect(score([card('shoal'), card('fish'), card('fish'), card('fish')]).total).toBe(4)
  })

  it('colonie + 2 pingouins = 7 pts (3 collector + 4 colonie)', () => {
    expect(score([card('colony'), card('penguin'), card('penguin')]).total).toBe(7)
  })

  it('capitaine + 2 marins = 11 pts (5 collector + 6 capitaine)', () => {
    expect(score([card('captain'), card('sailor'), card('sailor')]).total).toBe(11)
  })

  it('capitaine seul = 0 pt', () => {
    expect(score([card('captain')]).total).toBe(0)
  })
})

describe('score — mermaids', () => {
  it('1 sirène + 3 roses + 2 bleues = 5 pts (1 duo crabes + 1 duo bateaux + 3 sirène rose)', () => {
    expect(score([
      card('mermaid', 'white'),
      card('crab', 'pink'),
      card('crab', 'pink'),
      card('crab', 'pink'),
      card('boat', 'lightblue'),
      card('boat', 'lightblue')
    ]).total).toBe(5)
  })

  it('2 sirènes + 3 roses + 2 bleues = 7 pts (duos + 3 + 2)', () => {
    expect(score([
      card('mermaid', 'white'),
      card('mermaid', 'white'),
      card('crab', 'pink'),
      card('crab', 'pink'),
      card('crab', 'pink'),
      card('boat', 'lightblue'),
      card('boat', 'lightblue')
    ]).total).toBe(7)
  })

  it('1 sirène sans autres cartes colorées = 0 pt', () => {
    expect(score([card('mermaid', 'white')]).total).toBe(0)
  })

  it('4 sirènes = victoire', () => {
    const result = score([
      card('mermaid', 'white'),
      card('mermaid', 'white'),
      card('mermaid', 'white'),
      card('mermaid', 'white')
    ])
    expect(result.win).toBe(true)
    expect(result.total).toBe(0)
  })
})

describe('score — combinés', () => {
  it('2 crabes + 2 bateaux + phare = 4 pts (2 duo + 2 phare)', () => {
    expect(score([
      card('crab'), card('crab'),
      card('boat'), card('boat'),
      card('lighthouse')
    ]).total).toBe(4)
  })

  it('captain + 2 sailors + 2 boats = 12 pts (5 duo sailor + 6 captain + 1 duo boat)', () => {
    expect(score([
      card('captain'),
      card('sailor'), card('sailor'),
      card('boat'), card('boat')
    ]).total).toBe(12)
  })

  it('main complète mixte', () => {
    const result = score([
      card('crab', 'yellow'), card('crab', 'yellow'),
      card('shell', 'green'), card('shell', 'green'), card('shell', 'green'),
      card('lighthouse', 'pink'),
      card('boat', 'darkblue'), card('boat', 'darkblue'),
      card('mermaid', 'white')
    ])
    expect(result.total).toBe(11)
  })
})
