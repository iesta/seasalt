import type { ScoreResult } from '../lib/types'

interface Props {
  result: ScoreResult
}

export function ScoreBreakdown({ result }: Props) {
  if (result.win) {
    return (
      <div className="bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-400 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-2">🧜‍♀️✨</div>
        <div className="text-2xl font-bold text-amber-800">Victoire aux 4 sirènes !</div>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-sea-300 rounded-2xl overflow-hidden">
      <div className="bg-sea-700 text-white p-4 text-center">
        <div className="text-sm opacity-90">Score total</div>
        <div className="text-5xl font-bold">{result.total}</div>
      </div>
      {result.lines.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {result.lines.map((line, i) => (
            <li key={i} className="flex items-baseline justify-between p-3">
              <div>
                <div className="font-medium text-gray-800">{line.label}</div>
                {line.detail && (
                  <div className="text-xs text-gray-500">{line.detail}</div>
                )}
              </div>
              <div className="text-xl font-semibold text-sea-700 tabular-nums">
                {line.points}
              </div>
            </li>
          ))}
        </ul>
      )}
      {result.lines.length === 0 && (
        <p className="p-4 text-sm text-gray-500 italic text-center">Aucun point.</p>
      )}
    </div>
  )
}
