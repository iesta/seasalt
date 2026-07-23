import { useEffect, useMemo, useRef, useState } from 'react'
import { CameraInput } from './components/CameraInput'
import { DetectedCards } from './components/DetectedCards'
import { ScoreBreakdown } from './components/ScoreBreakdown'
import { Settings, loadSettings } from './components/Settings'
import { detectCards, loadReferenceImage } from './lib/openrouter'
import { score } from './lib/scoring'
import type { Card } from './lib/types'

type View = 'home' | 'result'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [showSettings, setShowSettings] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refImageRef = useRef('')

  useEffect(() => {
    loadReferenceImage()
      .then(dataUrl => { refImageRef.current = dataUrl })
      .catch(() => {}) // non-bloquant
  }, [])

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
      const detected = await detectCards(settings.apiKey, settings.model, dataUrl, refImageRef.current || undefined)
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
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
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
              <div className="text-center text-sea-700 animate-pulse">
                Analyse en cours…
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
