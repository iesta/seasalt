import type { ScoreResult } from '../lib/types'

interface Props {
  result: ScoreResult
  cardCount: number
}

export function ScoreBreakdown({ result, cardCount }: Props) {
  if (result.win) {
    return (
      <div className="bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-400 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-2">🧜‍♀️✨</div>
        <div className="text-2xl font-bold text-amber-800">Victoire aux 4 sirènes !</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
        <span className="font-semibold">⚙ Comment ça marche :</span> l'IA a identifié{' '}
        <span className="font-bold">{cardCount} carte{cardCount > 1 ? 's' : ''}</span>.
        Le moteur de scoring applique ensuite les règles officielles du jeu (paires duo, barèmes collectionneurs,
        multiplicateurs, sirènes) de manière déterministe. Ce n'est pas l'IA qui calcule le score — elle ne fait
        que lister les cartes visibles.
      </div>

      <div className="bg-white border-2 border-sea-300 rounded-2xl overflow-hidden">
        <div className="bg-sea-700 text-white p-4 text-center">
          <div className="text-sm opacity-90">Score total</div>
          <div className="text-5xl font-bold">{result.total}</div>
          {cardCount > 0 && (
            <div className="text-xs opacity-70 mt-1">{cardCount} carte{cardCount > 1 ? 's' : ''} détectée{cardCount > 1 ? 's' : ''}</div>
          )}
        </div>
        {result.lines.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {result.lines.map((line, i) => (
              <li key={i} className="p-3">
                <div className="flex items-baseline justify-between">
                  <div className="font-medium text-gray-800">{line.label}</div>
                  <div className="text-xl font-semibold text-sea-700 tabular-nums ml-4">
                    +{line.points}
                  </div>
                </div>
                {line.detail && (
                  <div className="text-xs text-gray-500 mt-0.5">{line.detail}</div>
                )}
              </li>
            ))}
          </ul>
        )}
        {result.lines.length === 0 && (
          <p className="p-4 text-sm text-gray-500 italic text-center">Aucun point.</p>
        )}
      </div>
    </div>
  )
}
