import { useState } from 'react'
import { apiUploadLibraryAsset, apiUpdateLibraryAsset } from '../lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

const categoryOptions = ['Product', 'Engineering', 'Marketing', 'Design', 'Software', 'Events']

function detectMediaType(file) {
  if (!file) return null
  if (file.type.startsWith('image/')) return 'photo'
  if (file.type.startsWith('video/')) return 'video'
  return 'article'
}

export default function UploadAssetModal({ item, onClose, onSaved }) {
  const isEditing = Boolean(item)

  const [name, setName] = useState(item?.name ?? '')
  const [type, setType] = useState(item?.type ?? categoryOptions[0])
  const [media, setMedia] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isEditing && !media) {
      setError('Please choose a file to upload.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const mediaType = detectMediaType(media)
      if (isEditing) {
        await apiUpdateLibraryAsset(item.id, {
          name,
          type,
          ...(media ? { media_type: mediaType, media } : {}),
        })
      } else {
        await apiUploadLibraryAsset({ name, type, media_type: mediaType, media })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">
            {isEditing ? 'Edit Asset' : 'Upload Asset'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-black"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="asset-name" className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              NAME
            </label>
            <input
              id="asset-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product_Launch_01"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label htmlFor="asset-type" className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              CATEGORY
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="asset-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="asset-media" className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              MEDIA
            </label>
            {isEditing && item.media_url && (
              <div className="mb-2 flex items-center gap-2">
                <img src={item.media_url} alt="" className="h-12 w-12 rounded-md object-cover" />
                <span className="text-xs text-neutral-400">Current file — choose a file to replace it</span>
              </div>
            )}
            <input
              id="asset-media"
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md"
              required={!isEditing}
              onChange={(e) => setMedia(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-brand-600"
            />
          
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting
              ? isEditing
                ? 'SAVING…'
                : 'UPLOADING…'
              : isEditing
                ? 'SAVE CHANGES'
                : 'UPLOAD'}
          </button>
        </form>
      </div>
    </div>
  )
}
