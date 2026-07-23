import { useRef, useState } from 'react'
import { fileToDataUrl } from '../lib/openrouter'

interface Props {
  onImage: (dataUrl: string) => void
  disabled?: boolean
}

export function CameraInput({ onImage, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      onImage(dataUrl)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        disabled={disabled || loading}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || loading}
        className="w-full max-w-md bg-sea-700 hover:bg-sea-800 disabled:bg-gray-400 text-white font-semibold py-6 px-8 rounded-2xl shadow-lg transition-colors text-lg"
      >
        {loading ? 'Chargement…' : '📷 Photographier ma main'}
      </button>
      <p className="text-sm text-gray-500 text-center max-w-md">
        Prenez en photo les cartes en main et celles posées devant vous, bien espacées et lisibles.
      </p>
    </div>
  )
}
