import type { ColorBucket } from '../lib/types'

interface Props {
  colors: ColorBucket[]
}

const COLOR_CLASSES: Record<string, string> = {
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  pink: 'bg-pink-400',
  purple: 'bg-purple-500',
  lightblue: 'bg-sky-400',
  darkblue: 'bg-blue-700',
  black: 'bg-gray-800',
  gray: 'bg-gray-400',
  white: 'bg-white border'
}

export function ColorTable({ colors }: Props) {
  if (colors.length === 0) return null

  const max = colors[0]?.count ?? 1

  return (
    <div className="bg-white border rounded-xl p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribution par couleur</h3>
      {colors.map(b => (
        <div key={b.color} className="flex items-center gap-2 text-sm">
          <span className="w-20 truncate text-right text-gray-600">{b.label}</span>
          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${COLOR_CLASSES[b.color] ?? 'bg-gray-300'}`}
              style={{ width: `${Math.max((b.count / max) * 100, 8)}%` }}
            />
          </div>
          <span className="w-14 text-left font-mono font-medium text-gray-700 tabular-nums">
            {b.count} carte{b.count > 1 ? 's' : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
