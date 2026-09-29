import { useEffect, useMemo, useState } from 'react'
import { apiUploadLibraryAsset, apiUpdateLibraryAsset } from '../lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

const categoryOptions = ['Product', 'Engineering', 'Marketing', 'Design', 'Software', 'Events']

function detectMediaType(file) {
  if (!file) return null
  if (file.type.startsWith('image/')) return 'photo'
  if (file.type.startsWith('video/')) return 'video'
  return 'article'
}

function fileStem(file) {
  return file.name.replace(/\.[^.]+$/, '')
}

function fileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

export default function UploadAssetModal({ item, onClose, onSaved }) {
  const isEditing = Boolean(item)

  const [name, setName] = useState(item?.name ?? '')
  const [type, setType] = useState(item?.type ?? categoryOptions[0])
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const isMultiple = !isEditing && files.length > 1

  const previews = useMemo(
    () => files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null)),
    [files],
  )
  useEffect(() => () => previews.forEach((url) => url && URL.revokeObjectURL(url)), [previews])

  function handleFileChange(e) {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (isEditing) {
      setFiles(picked.slice(0, 1))
      return
    }
    setFiles((prev) => {
      const seen = new Set(prev.map(fileKey))
      return [...prev, ...picked.filter((f) => !seen.has(fileKey(f)))]
    })
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // With several files, each asset gets the typed name plus a number, or its own file name when the name is blank.
  function assetName(file, index) {
    if (!isMultiple) return name.trim() || fileStem(file)
    return name.trim() ? `${name.trim()} ${index + 1}` : fileStem(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isEditing && files.length === 0) {
      setError('Please choose at least one file to upload.')
      return
    }
    setSubmitting(true)
    setError(null)

    if (isEditing) {
      try {
        const media = files[0]
        await apiUpdateLibraryAsset(item.id, {
          name,
          type,
          ...(media ? { media_type: detectMediaType(media), media } : {}),
        })
        onSaved()
        onClose()
      } catch (err) {
        setError(err.message)
      } finally {
        setSubmitting(false)
      }
      return
    }

    const failed = []
    let uploaded = 0
    for (let i = 0; i < files.length; i++) {
      setProgress(i + 1)
      try {
        await apiUploadLibraryAsset({
          name: assetName(files[i], i),
          type,
          media_type: detectMediaType(files[i]),
          media: files[i],
        })
        uploaded++
      } catch (err) {
        failed.push({ file: files[i], message: err.message })
      }
    }
    setSubmitting(false)
    setProgress(0)

    if (uploaded > 0) onSaved()
    if (failed.length === 0) {
      onClose()
      return
    }
    setFiles(failed.map((f) => f.file))
    setError(
      failed.length === 1
        ? `"${failed[0].file.name}" couldn't be uploaded: ${failed[0].message}`
        : `${failed.length} files couldn't be uploaded. They're still listed below so you can try again.`,
    )
  }

  const submitLabel = submitting
    ? isEditing
      ? 'SAVING…'
      : files.length > 1
        ? `UPLOADING ${progress} OF ${files.length}…`
        : 'UPLOADING…'
    : isEditing
      ? 'SAVE CHANGES'
      : files.length > 1
        ? `UPLOAD ${files.length} FILES`
        : 'UPLOAD'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">
            {isEditing ? 'Edit Asset' : 'Upload Assets'}
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
              NAME{!isEditing && <span className="font-normal normal-case tracking-normal text-neutral-400"> (optional)</span>}
            </label>
            <input
              id="asset-name"
              required={isEditing}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product_Launch_01"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
            />
            {!isEditing && (
              <p className="mt-1 text-xs text-neutral-400">
                {isMultiple
                  ? 'Each file gets this name plus a number. Leave it blank to use the file names.'
                  : 'Leave it blank to use the file name.'}
              </p>
            )}
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
            {isEditing && item.media_url && files.length === 0 && (
              <div className="mb-2 flex items-center gap-2">
                <img src={item.media_url} alt="" className="h-12 w-12 rounded-md object-cover" />
                <span className="text-xs text-neutral-400">Current file. Choose a file to replace it.</span>
              </div>
            )}
            <label
              htmlFor="asset-media"
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center transition hover:border-brand-300 hover:bg-brand-50"
            >
              <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
              <span className="text-sm font-medium text-neutral-700">
                {isEditing ? 'Choose a new file' : files.length > 0 ? 'Add more files' : 'Choose files'}
              </span>
              {!isEditing && <span className="text-xs text-neutral-400">You can select several at once</span>}
            </label>
            <input
              id="asset-media"
              type="file"
              multiple={!isEditing}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md"
              onChange={handleFileChange}
              className="sr-only"
            />

            {files.length > 0 && (
              <ul className="mt-2 max-h-44 space-y-1.5 overflow-y-auto">
                {files.map((file, i) => (
                  <li
                    key={fileKey(file)}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5"
                  >
                    {previews[i] ? (
                      <img src={previews[i]} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-neutral-100 text-[9px] font-semibold uppercase text-neutral-500">
                        {file.name.split('.').pop()?.slice(0, 4)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-xs text-neutral-700" title={file.name}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      disabled={submitting}
                      aria-label={`Remove ${file.name}`}
                      className="shrink-0 rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-red-600 disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
