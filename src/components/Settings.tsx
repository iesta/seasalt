import { useEffect, useState } from 'react'
import { fetchVisionModels } from '../lib/openrouter'

const KEY_STORAGE = 'seasalt.openrouter_key'
const MODEL_STORAGE = 'seasalt.model'

export function loadSettings(): { apiKey: string; model: string } {
  return {
    apiKey: localStorage.getItem(KEY_STORAGE) ?? '',
    model: localStorage.getItem(MODEL_STORAGE) ?? 'google/gemini-3.6-flash'
  }
}

function saveSettings(apiKey: string, model: string) {
  localStorage.setItem(KEY_STORAGE, apiKey)
  localStorage.setItem(MODEL_STORAGE, model)
}

interface Props {
  onClose: () => void
  onSaved: () => void
}

export function Settings({ onClose, onSaved }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [models, setModels] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')

  useEffect(() => {
    const s = loadSettings()
    setApiKey(s.apiKey)
    setModel(s.model)
    void refreshModels(s.apiKey)
  }, [])

  async function refreshModels(key?: string) {
    setLoading(true)
    setError('')
    try {
      const list = await fetchVisionModels(key || undefined)
      setModels(list)
      setTestStatus('ok')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setModels([])
      setTestStatus('fail')
    } finally {
      setLoading(false)
    }
  }

  function handleSave() {
    saveSettings(apiKey, model)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-sea-800">Réglages</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clé API OpenRouter
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-or-v1-…"
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Créez une clé sur{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-sea-700 underline">
                openrouter.ai/keys
              </a>
              . Stockée localement seulement.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Modèle vision
              </label>
              <button
                onClick={() => refreshModels(apiKey)}
                disabled={loading}
                className="text-xs text-sea-700 hover:underline disabled:opacity-50"
              >
                {loading ? '…' : '↻ Rafraîchir'}
              </button>
            </div>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              disabled={models.length === 0}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
            >
              <option value="">
                {loading ? 'Chargement…' : models.length === 0 ? 'Aucun modèle — rafraîchir' : '— Choisir —'}
              </option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {models.length} modèle(s) supportant les images.
              {testStatus === 'ok' && <span className="text-green-600"> ✓</span>}
              {testStatus === 'fail' && <span className="text-red-600"> ✗</span>}
            </p>
            {error && (
              <p className="text-xs text-red-600 mt-1 break-words">{error}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!apiKey || !model}
              className="flex-1 bg-sea-700 hover:bg-sea-800 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg"
            >
              Enregistrer
            </button>
            <button
              onClick={onClose}
              className="px-4 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
