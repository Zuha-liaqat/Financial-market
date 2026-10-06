import { useEffect, useRef, useState } from 'react'
import { ExternalLink, FileText, Trash2, Upload } from 'lucide-react'
import { apiDeleteKnowledgeBaseItem, apiListKnowledgeBase, apiUploadKnowledgeBaseFile } from '../lib/api'
import ConfirmDialog from './ConfirmDialog'
import { ErrorToast, SuccessToast } from './Toast'

// The file types the knowledge-base API can read text from.
const ACCEPTED_EXTENSIONS = ['.pdf', '.txt', '.md', '.csv', '.json', '.html', '.htm', '.xml', '.yaml', '.yml', '.ini']
// Vercel turns away request bodies over about 4.5 MB, so larger files are stopped here with a clear message.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const MAX_UPLOAD_LABEL = '4 MB'

// Stored files never change behind their URL, so a size looked up once is kept for the session.
const sizeCache = new Map()

function extensionOf(name) {
  const dot = (name || '').lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot).toLowerCase()
}

export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

function formatDate(value) {
  if (!value) return '—'
  const when = new Date(value)
  if (Number.isNaN(when.getTime())) return '—'
  return when.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

function fileUrl(item) {
  return item.download_url || item.source_url || ''
}

// Files uploaded before the API kept file_size: read the stored file's Content-Length instead.
// Storage leaves that header off when it compresses a large text file, so those show "—".
async function lookUpSize(url) {
  if (!url) return null
  if (sizeCache.has(url)) return sizeCache.get(url)
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const header = res.headers.get('content-length')
    const length = header === null ? NaN : Number(header)
    const size = res.ok && Number.isFinite(length) && length > 0 ? length : null
    if (size != null) sizeCache.set(url, size)
    return size
  } catch {
    return null
  }
}

export default function KnowledgeBaseSection() {
  const inputRef = useRef(null)
  const [items, setItems] = useState([])
  const [sizes, setSizes] = useState({})
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let cancelled = false
    apiListKnowledgeBase()
      .then((all) => {
        if (cancelled) return
        // Only the files people upload here; pages read from the company website are kept by the API too.
        setItems(all.filter((item) => item.source_type === 'upload'))
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err.message || 'Failed to load the knowledge base')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Older uploads have no file_size from the API; look those up once.
  useEffect(() => {
    const missing = items.filter((item) => item.file_size == null && !(item.id in sizes))
    if (missing.length === 0) return
    let cancelled = false
    Promise.all(missing.map(async (item) => [item.id, await lookUpSize(fileUrl(item))])).then((found) => {
      if (cancelled) return
      setSizes((prev) => {
        const next = { ...prev }
        found.forEach(([id, size]) => {
          if (!(id in next)) next[id] = size
        })
        return next
      })
    })
    return () => {
      cancelled = true
    }
  }, [items, sizes])

  async function handleSelect(e) {
    const picked = Array.from(e.target.files || [])
    e.target.value = ''
    if (picked.length === 0) return

    const problems = []
    const ready = picked.filter((file) => {
      if (!ACCEPTED_EXTENSIONS.includes(extensionOf(file.name))) {
        problems.push(`${file.name}: this file type can't be read. Use PDF, TXT, MD, CSV, JSON, HTML, XML, YAML or INI.`)
        return false
      }
      if (file.size === 0) {
        problems.push(`${file.name}: the file is empty.`)
        return false
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        // Two decimals, so a file just over the limit doesn't read as "4.0 MB is over 4 MB".
        problems.push(`${file.name} is ${(file.size / (1024 * 1024)).toFixed(2)} MB; files must be ${MAX_UPLOAD_LABEL} or smaller.`)
        return false
      }
      return true
    })

    let added = 0
    for (let i = 0; i < ready.length; i += 1) {
      const file = ready[i]
      setProgress({ index: i + 1, total: ready.length, name: file.name })
      try {
        const item = await apiUploadKnowledgeBaseFile(file)
        // The API now returns file_size; the browser's own count covers a server that doesn't yet.
        if (item.file_size == null) setSizes((prev) => ({ ...prev, [item.id]: file.size }))
        setItems((prev) => [item, ...prev.filter((existing) => existing.id !== item.id)])
        added += 1
      } catch (err) {
        // fetch rejects with a TypeError when the server can't be reached or fails without a reply.
        const reason =
          err instanceof TypeError ? "the server couldn't be reached or failed while saving it." : err.message || 'upload failed.'
        problems.push(`${file.name}: ${reason}`)
      }
    }
    setProgress(null)

    const addedText = added === 1 ? '1 file added to the knowledge base.' : `${added} files added to the knowledge base.`
    if (problems.length > 0) setError(`${added > 0 ? `${addedText} ` : ''}${problems.join(' ')}`)
    else if (added > 0) setNotice(addedText)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await apiDeleteKnowledgeBaseItem(toDelete.id)
      setItems((prev) => prev.filter((item) => item.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      if (err.status === 404) {
        // Already gone; just take it off the list.
        setItems((prev) => prev.filter((item) => item.id !== toDelete.id))
        setToDelete(null)
      } else {
        setDeleteError(err.message || 'Failed to delete the file')
      }
    } finally {
      setDeleting(false)
    }
  }

  const uploading = progress !== null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs text-neutral-500">
          Upload documents about your business, like product details, FAQs or price lists. The AI reads them when it
          writes your posts.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || status !== 'ready'}
          data-track-label="Knowledge Base - Upload File"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4" strokeWidth={2} />
          {uploading ? `Uploading ${progress.index} of ${progress.total}…` : 'Upload file'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleSelect}
          className="hidden"
        />
      </div>
      <p className="-mt-2 text-[11px] text-neutral-400">
        PDF, TXT, MD, CSV, JSON, HTML, XML, YAML or INI, up to {MAX_UPLOAD_LABEL} each.
      </p>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400">
                <th className="px-4 py-3">FILE</th>
                <th className="px-3 py-3">TYPE</th>
                <th className="px-3 py-3">SIZE</th>
                <th className="px-3 py-3">ADDED</th>
                <th className="px-4 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' &&
                [0, 1].map((row) => (
                  <tr key={row} className="border-b border-neutral-100 last:border-0">
                    <td colSpan={5} className="px-4 py-3.5">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
                    </td>
                  </tr>
                ))}

              {status === 'error' && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-red-600">
                    {loadError}
                  </td>
                </tr>
              )}

              {status === 'ready' && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-neutral-700">No files yet</p>
                    <p className="mt-1 text-xs text-neutral-400">Files you upload will show up here.</p>
                  </td>
                </tr>
              )}

              {status === 'ready' &&
                items.map((item) => {
                  const name = item.file_name || item.title || 'Untitled file'
                  const url = fileUrl(item)
                  const extension = extensionOf(name).replace('.', '').toUpperCase()
                  const size = item.file_size ?? sizes[item.id]
                  const sizeKnown = item.file_size != null || item.id in sizes
                  return (
                    <tr key={item.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600">
                            <FileText className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span className="block max-w-[14rem] truncate font-medium text-neutral-800 sm:max-w-xs" title={name}>
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-neutral-500">{extension || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap tabular-nums text-neutral-700">
                        {sizeKnown ? formatBytes(size) : '…'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-neutral-500">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                              data-track-label="Knowledge Base - Open File"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError('')
                              setToDelete(item)
                            }}
                            aria-label={`Delete ${name}`}
                            data-track-label="Knowledge Base - Delete File"
                            className="cursor-pointer rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete this file?"
          message={`"${toDelete.file_name || toDelete.title || 'This file'}" will be removed from the knowledge base, and the AI will stop using it.`}
          confirmLabel="Delete"
          confirming={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (deleting) return
            setToDelete(null)
            setDeleteError('')
          }}
        />
      )}

      {notice && <SuccessToast message={notice} onClose={() => setNotice('')} />}
      {error && <ErrorToast message={error} onClose={() => setError('')} />}
    </div>
  )
}
