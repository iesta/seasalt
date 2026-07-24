interface Props {
  src: string
  onClose: () => void
}

export function Lightbox({ src, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl leading-none hover:opacity-70"
      >
        ×
      </button>
      <img
        src={src}
        alt="Photo plein écran"
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}
