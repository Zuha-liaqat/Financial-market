import { useCallback, useEffect, useState } from 'react'

function fileExtension(url) {
  try {
    const path = new URL(url, window.location.href).pathname
    return path.split('.').pop()?.toLowerCase() ?? ''
  } catch {
    return ''
  }
}

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'm4v']
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp']

function previewKind(item) {
  const ext = fileExtension(item.media_url)
  if (item.media_type === 'photo' || IMAGE_EXTENSIONS.includes(ext)) return 'image'
  if (item.media_type === 'video' || VIDEO_EXTENSIONS.includes(ext)) return 'video'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'txt' || ext === 'md') return 'text'
  return 'other'
}

export function isPdfAsset(item) {
  return Boolean(item?.media_url) && previewKind(item) === 'pdf'
}

// Full-screen preview for a Library asset: images, videos, PDFs and plain text open inline;
// other documents (like .docx) offer "Open in new tab" and "Download" because browsers can't render them.
// Pass `items` (and `startIndex`) to page through an album with the arrow buttons or keys.
export default function AssetViewer({ item: singleItem, items, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const album = items?.length > 1 ? items : null
  const item = album ? album[index] : singleItem
  const kind = previewKind(item)
  const ext = fileExtension(item.media_url)

  const step = useCallback(
    (delta) => album && setIndex((i) => (i + delta + album.length) % album.length),
    [album],
  )

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', handleKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = overflow
    }
  }, [onClose, step])

  const stop = (e) => e.stopPropagation()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4"
      onClick={onClose}
    >
      <div onClick={stop} className="mx-auto mb-3 flex w-full max-w-5xl items-center gap-3 text-white">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {item.name}
          {album && <span className="ml-2 text-white/60">{index + 1} / {album.length}</span>}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-md p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {album &&
          [
            { delta: -1, label: 'Previous image', side: 'left-2', d: 'M15 19l-7-7 7-7' },
            { delta: 1, label: 'Next image', side: 'right-2', d: 'M9 5l7 7-7 7' },
          ].map((btn) => (
            <button
              key={btn.delta}
              type="button"
              aria-label={btn.label}
              onClick={(e) => {
                e.stopPropagation()
                step(btn.delta)
              }}
              className={`absolute ${btn.side} z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={btn.d} />
              </svg>
            </button>
          ))}
        {kind === 'image' && (
          <img
            src={item.media_url}
            alt={item.name}
            onClick={stop}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}

        {kind === 'video' && (
          <video
            src={item.media_url}
            controls
            autoPlay
            onClick={stop}
            className="max-h-full max-w-full rounded-lg bg-black shadow-2xl"
          />
        )}

        {(kind === 'pdf' || kind === 'text') && (
          <iframe
            src={item.media_url}
            title={item.name}
            onClick={stop}
            className="h-full w-full max-w-5xl rounded-lg bg-white shadow-2xl"
          />
        )}

        {kind === 'other' && (
          <div onClick={stop} className="max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
            <p className="text-sm font-semibold text-black">
              {ext ? `.${ext.toUpperCase()} files` : 'This file'} can&apos;t be previewed here
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Open it in a new tab or download it to view it.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <a
                href={item.media_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Open in new tab
              </a>
              <a
                href={item.media_url}
                download
                className="rounded-md px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
