import type { Card, CardColor, CardType } from '../lib/types'
import {
  CARD_TYPES, CARD_COLORS,
  CARD_TYPE_LABELS, CARD_COLOR_LABELS
} from '../lib/types'

interface Props {
  cards: Card[]
  onChange: (cards: Card[]) => void
}

let addCounter = 0

export function DetectedCards({ cards, onChange }: Props) {
  function remove(id: string) {
    onChange(cards.filter(c => c.id !== id))
  }

  function add() {
    const newCard: Card = {
      id: `add-${addCounter++}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'crab',
      color: 'yellow'
    }
    onChange([...cards, newCard])
  }

  function update(id: string, patch: Partial<Card>) {
    onChange(cards.map(c => (c.id === id ? { ...c, ...patch } : c)))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sea-800">
          Cartes détectées ({cards.length})
        </h3>
        <button
          onClick={add}
          className="text-sm bg-sea-100 hover:bg-sea-200 text-sea-800 px-3 py-1 rounded-lg"
        >
          + Ajouter
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Aucune carte.</p>
      ) : (
        <ul className="space-y-1.5">
          {cards.map(c => (
            <li key={c.id} className="flex items-center gap-2 bg-white border rounded-lg p-2">
              <select
                value={c.type}
                onChange={e => update(c.id, { type: e.target.value as CardType })}
                className="text-sm border rounded px-2 py-1 flex-1 min-w-0"
              >
                {CARD_TYPES.map(t => (
                  <option key={t} value={t}>{CARD_TYPE_LABELS[t]}</option>
                ))}
                <option value="unknown">Inconnu</option>
              </select>
              <select
                value={c.color}
                onChange={e => update(c.id, { color: e.target.value as CardColor })}
                className="text-sm border rounded px-2 py-1 w-32"
              >
                {CARD_COLORS.map(col => (
                  <option key={col} value={col}>{CARD_COLOR_LABELS[col]}</option>
                ))}
              </select>
              <button
                onClick={() => remove(c.id)}
                className="text-red-500 hover:text-red-700 px-2"
                aria-label="Supprimer"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
