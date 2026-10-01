import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, LifeBuoy, RefreshCw, Search, Trash2, X } from 'lucide-react'
import {
  apiAdminDeleteSupportRequest,
  apiAdminDeleteSupportRequests,
  apiAdminListSupportRequests,
  apiAdminSetSupportRequestStatus,
  apiAdminSetSupportRequestsStatus,
} from '../../lib/api'
import ConfirmDialog from '../../components/ConfirmDialog'
import { ErrorToast } from '../../components/Toast'

// A request is not a conversation, so a few seconds behind is fine - and a poll
// is steadier here than a socket, which on a serverless host usually lands on a
// different instance from the one that saved the request.
const POLL_MS = 10000

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
]

function formatWhen(value) {
  if (!value) return '—'
  const when = new Date(value)
  if (Number.isNaN(when.getTime())) return '—'
  return when.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(name) {
  return (name || '?').trim().slice(0, 2).toUpperCase()
}

function RowSkeleton() {
  return (
    <tr className="border-b border-neutral-100">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 animate-pulse rounded bg-neutral-200" />
        </td>
      ))}
    </tr>
  )
}

export default function SupportRequestsPage() {
  const [requests, setRequests] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  // Ids that arrived while this page was open, so a new row can announce itself.
  const [freshIds, setFreshIds] = useState(() => new Set())
  const knownIds = useRef(null)
  const [selected, setSelected] = useState(() => new Set())
  // Either one row, or the whole selection.
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setStatus((current) => (current === 'ready' ? current : 'loading'))
    try {
      const body = await apiAdminListSupportRequests()
      const rows = body?.requests || []

      // The first load is the baseline; anything unseen after that is new.
      const ids = new Set(rows.map((r) => r.id))
      if (knownIds.current === null) {
        knownIds.current = ids
      } else {
        const arrived = rows.filter((r) => !knownIds.current.has(r.id)).map((r) => r.id)
        if (arrived.length) {
          setFreshIds((current) => new Set([...current, ...arrived]))
        }
        knownIds.current = ids
      }

      // Drop anything that has since been deleted, so the count never lies.
      setSelected((current) => new Set([...current].filter((id) => ids.has(id))))
      setRequests(rows)
      setTotal(body?.total || 0)
      setStatus('ready')
    } catch (err) {
      setError(err.message || 'Failed to load support requests')
      setStatus((current) => (current === 'ready' ? current : 'error'))
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(() => load({ quiet: true }), POLL_MS)
    return () => clearInterval(timer)
  }, [load])

  const counts = useMemo(
    () => ({
      all: requests.length,
      open: requests.filter((r) => r.status !== 'closed').length,
      closed: requests.filter((r) => r.status === 'closed').length,
    }),
    [requests],
  )

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return requests.filter((r) => {
      if (statusFilter === 'open' && r.status === 'closed') return false
      if (statusFilter === 'closed' && r.status !== 'closed') return false
      if (!term) return true
      return `${r.name || ''} ${r.email || ''} ${r.company_name || ''} ${r.message || ''}`
        .toLowerCase()
        .includes(term)
    })
  }, [requests, query, statusFilter])

  const changeStatus = useCallback(
    async (ids, next) => {
      // Shown straight away, then confirmed by the reload - a status change is
      // not worth a spinner.
      setRequests((current) =>
        current.map((r) => (ids.includes(r.id) ? { ...r, status: next } : r)),
      )
      try {
        if (ids.length === 1) await apiAdminSetSupportRequestStatus(ids[0], next)
        else await apiAdminSetSupportRequestsStatus(ids, next)
        await load({ quiet: true })
      } catch (err) {
        setError(err.message || 'Failed to update the status')
        await load({ quiet: true })
      }
    },
    [load],
  )

  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.id))

  const toggleOne = (id) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelected((current) => {
      const next = new Set(current)
      if (allVisibleSelected) visible.forEach((r) => next.delete(r.id))
      else visible.forEach((r) => next.add(r.id))
      return next
    })
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      if (pendingDelete.kind === 'one') {
        await apiAdminDeleteSupportRequest(pendingDelete.id)
        setSelected((current) => {
          const next = new Set(current)
          next.delete(pendingDelete.id)
          return next
        })
      } else {
        await apiAdminDeleteSupportRequests(pendingDelete.ids)
        setSelected(new Set())
      }
      setPendingDelete(null)
      await load({ quiet: true })
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const deleteCount = pendingDelete?.kind === 'one' ? 1 : pendingDelete?.ids.length || 0

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <LifeBuoy className="h-5 w-5 text-brand-600" strokeWidth={1.75} />
            Support Requests
            {freshIds.size > 0 && (
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                {freshIds.size} new
              </span>
            )}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {counts.open} open of {total} · updating automatically
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or message…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              data-track-label="Support Requests - Search"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="shrink-0 text-neutral-400 transition hover:text-neutral-600"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => load({ quiet: true })}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-50"
            data-track-label="Support Requests - Refresh"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === f.key
                ? 'bg-brand-500 text-white'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
            data-track-label={`Support Requests - Filter ${f.label}`}
          >
            {f.label}
            <span className={`ml-1.5 ${statusFilter === f.key ? 'text-white/70' : 'text-neutral-400'}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50/70 px-4 py-2.5">
          <p className="text-sm font-medium text-brand-800">
            {selected.size} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => changeStatus([...selected], 'closed')}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-neutral-50"
              data-track-label="Support Requests - Bulk Close"
            >
              Mark closed
            </button>
            <button
              type="button"
              onClick={() => changeStatus([...selected], 'open')}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-neutral-50"
              data-track-label="Support Requests - Bulk Reopen"
            >
              Mark open
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete({ kind: 'many', ids: [...selected] })}
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
              data-track-label="Support Requests - Bulk Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete selected
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400">
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    disabled={visible.length === 0}
                    aria-label="Select all"
                    className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-brand-500"
                  />
                </th>
                <th className="px-3 py-3.5">FROM</th>
                <th className="px-3 py-3.5">COMPANY</th>
                <th className="px-3 py-3.5">MESSAGE</th>
                <th className="px-3 py-3.5">SENT</th>
                <th className="px-3 py-3.5">STATUS</th>
                <th className="px-3 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && [...Array(4)].map((_, i) => <RowSkeleton key={i} />)}

              {status === 'ready' && visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                      <LifeBuoy className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-neutral-500">
                      {requests.length === 0 ? 'No one has written in yet.' : 'Nothing matches that search.'}
                    </p>
                  </td>
                </tr>
              )}

              {visible.map((row) => {
                const open = openId === row.id
                const fresh = freshIds.has(row.id)
                const checked = selected.has(row.id)
                return (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setOpenId(open ? null : row.id)
                      // Reading it is what clears the highlight.
                      if (fresh) {
                        setFreshIds((current) => {
                          const next = new Set(current)
                          next.delete(row.id)
                          return next
                        })
                      }
                    }}
                    className={`cursor-pointer border-b border-neutral-100 align-top transition last:border-0 hover:bg-neutral-50 ${
                      checked ? 'bg-brand-50/40' : fresh ? 'bg-brand-50/60' : ''
                    } ${row.status === 'closed' ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(row.id)}
                        aria-label={`Select the request from ${row.name}`}
                        className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-brand-500"
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100">
                          {initials(row.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate font-medium text-neutral-800">{row.name}</span>
                            {fresh && (
                              <span className="shrink-0 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                                NEW
                              </span>
                            )}
                          </span>
                          <a
                            href={`mailto:${row.email}`}
                            onClick={(event) => event.stopPropagation()}
                            className="block truncate text-xs text-brand-600 hover:underline"
                          >
                            {row.email}
                          </a>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-neutral-600">{row.company_name || '—'}</td>
                    <td className="max-w-md px-3 py-3.5 text-neutral-700">
                      <span className={open ? 'block whitespace-pre-wrap' : 'block truncate'}>{row.message}</span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-neutral-400">
                        <ChevronDown className={`h-3 w-3 transition ${open ? 'rotate-180' : ''}`} />
                        {open ? 'Hide' : 'Read full message'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-neutral-500">{formatWhen(row.created_at)}</td>
                    <td className="px-3 py-3.5" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => changeStatus([row.id], row.status === 'closed' ? 'open' : 'closed')}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                          row.status === 'closed'
                            ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                        title={row.status === 'closed' ? 'Click to reopen' : 'Click to close'}
                        data-track-label="Support Requests - Toggle Status"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            row.status === 'closed' ? 'bg-neutral-400' : 'bg-amber-500'
                          }`}
                        />
                        {row.status === 'closed' ? 'Closed' : 'Open'}
                      </button>
                    </td>
                    <td className="px-3 py-3.5 text-right" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ kind: 'one', id: row.id, name: row.name })}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete the request from ${row.name}`}
                        data-track-label="Support Requests - Delete One"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={deleteCount === 1 ? 'Delete this request?' : `Delete ${deleteCount} requests?`}
          message={
            deleteCount === 1
              ? `The request from ${pendingDelete.name || 'this sender'} will be removed for good.`
              : `${deleteCount} requests will be removed for good.`
          }
          confirmLabel="Delete"
          confirming={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => {
            setPendingDelete(null)
            setDeleteError('')
          }}
        />
      )}

      {error && <ErrorToast message={error} onClose={() => setError('')} />}
    </div>
  )
}
