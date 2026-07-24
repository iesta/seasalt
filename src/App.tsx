import { useMemo, useState } from 'react'
import { CameraInput } from './components/CameraInput'
import { DetectedCards } from './components/DetectedCards'
import { ScoreBreakdown } from './components/ScoreBreakdown'
import { Settings, loadSettings } from './components/Settings'
import { detectCards } from './lib/openrouter'
import { score } from './lib/scoring'
import type { Card } from './lib/types'
import refImage from './assets/rulebook-ref.png?inline'

type View = 'home' | 'result'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [showSettings, setShowSettings] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const result = useMemo(() => score(cards), [cards])

  const settings = loadSettings()

  async function handleImage(dataUrl: string) {
    if (!settings.apiKey) {
      setError('Configurez votre clé API OpenRouter dans les réglages.')
      setShowSettings(true)
      return
    }
    if (!settings.model) {
      setError('Choisissez un modèle vision dans les réglages.')
      setShowSettings(true)
      return
    }
    setLoading(true)
    setError('')
    setImageDataUrl(dataUrl)
    try {
      const detected = await detectCards(settings.apiKey, settings.model, dataUrl, refImage)
      setCards(detected)
      setView('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setView('home')
    setImageDataUrl('')
    setCards([])
    setError('')
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-sea-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦐</span>
          <h1 className="font-bold text-lg">Seasalt</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="text-sm bg-sea-700 hover:bg-sea-600 px-3 py-1.5 rounded-lg"
        >
          ⚙ Réglages
        </button>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-red-700 text-sm font-medium">Erreur</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
            <p className="text-red-600 text-sm break-words whitespace-pre-wrap">{error}</p>
            <button
              onClick={() => { setError(''); setView('home') }}
              className="text-xs text-red-700 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {view === 'home' && (
          <div className="pt-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-sea-800">
                Compteur Sea Salt & Paper
              </h2>
              <p className="text-gray-600">
                Photographiez votre main, l'IA identifie les cartes et calcule le score.
              </p>
            </div>
            <CameraInput onImage={handleImage} disabled={loading} />
            {loading && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-12 h-12 border-4 border-sea-300 border-t-sea-700 rounded-full animate-spin" />
                <p className="text-sea-700 font-medium animate-pulse">
                  Envoi de la photo au modèle vision…
                </p>
                <p className="text-xs text-gray-500">
                  L'IA analyse les cartes. Cela prend quelques secondes.
                </p>
              </div>
            )}
          </div>
        )}

        {view === 'result' && (
          <div className="space-y-4">
            {imageDataUrl && (
              <img
                src={imageDataUrl}
                alt="Main photographiée"
                className="w-full rounded-xl border border-gray-200 max-h-48 object-cover"
              />
            )}

            <ScoreBreakdown result={result} />

            <DetectedCards cards={cards} onChange={setCards} />

            <div className="flex gap-2 pt-2">
              <button
                onClick={reset}
                className="flex-1 bg-sea-700 hover:bg-sea-800 text-white font-medium py-3 rounded-xl"
              >
                📷 Nouvelle photo
              </button>
            </div>
          </div>
        )}
      </main>

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onSaved={() => { setView('home') }}
        />
      )}
    </div>
  )
}
