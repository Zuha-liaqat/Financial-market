import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Inbox,
  Mail,
  MailX,
  RotateCcw,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import {
  apiAdminDeleteSupportRequest,
  apiAdminGetSupportRequest,
  apiAdminSetSupportRequestStatus,
} from '../../lib/api'
import ConfirmDialog from '../../components/ConfirmDialog'
import { ErrorToast } from '../../components/Toast'

// How each recorded event reads on the timeline.
const EVENTS = {
  created: { label: 'Request received', icon: Inbox, tone: 'text-brand-600 bg-brand-50' },
  support_emailed: { label: 'Emailed to support', icon: Mail, tone: 'text-emerald-600 bg-emerald-50' },
  support_email_failed: { label: 'Could not email support', icon: MailX, tone: 'text-red-600 bg-red-50' },
  closed: { label: 'Marked closed', icon: CheckCircle2, tone: 'text-neutral-600 bg-neutral-100' },
  reopened: { label: 'Reopened', icon: RotateCcw, tone: 'text-amber-600 bg-amber-50' },
  resolved_emailed: { label: 'Company told it was resolved', icon: Mail, tone: 'text-emerald-600 bg-emerald-50' },
  resolved_email_failed: { label: 'Could not tell the company', icon: MailX, tone: 'text-red-600 bg-red-50' },
}

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

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">{label}</p>
      <div className="mt-1 text-sm text-neutral-800">{children}</div>
    </div>
  )
}

export default function SupportRequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async () => {
    try {
      setRequest(await apiAdminGetSupportRequest(id))
      setStatus('ready')
    } catch (err) {
      setError(err.message || 'Failed to load the request')
      setStatus('error')
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = async () => {
    if (!request || saving) return
    const next = request.status === 'closed' ? 'open' : 'closed'
    setSaving(true)
    try {
      await apiAdminSetSupportRequestStatus(request.id, next)
      await load()
    } catch (err) {
      setError(err.message || 'Failed to update the status')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await apiAdminDeleteSupportRequest(request.id)
      navigate('/super-admin/support-requests')
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete')
      setDeleting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="space-y-3">
        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="h-48 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-64 animate-pulse rounded-lg bg-neutral-100" />
      </div>
    )
  }

  if (status === 'error' || !request) {
    return (
      <div>
        <Link
          to="/super-admin/support-requests"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all requests
        </Link>
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <AlertTriangle className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-neutral-500">{error || 'This request is no longer here.'}</p>
        </div>
      </div>
    )
  }

  const closed = request.status === 'closed'

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/super-admin/support-requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition hover:text-black"
          data-track-label="Support Request - Back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all requests
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleStatus}
            disabled={saving}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
              closed
                ? 'text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            }`}
            data-track-label="Support Request - Toggle Status"
          >
            {saving ? 'Saving…' : closed ? 'Reopen' : 'Mark closed'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete this request"
            data-track-label="Support Request - Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
              {initials(request.name)}
            </span>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-neutral-900">{request.name}</h1>
              <a href={`mailto:${request.email}`} className="text-sm text-brand-600 hover:underline">
                {request.email}
              </a>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              closed ? 'bg-neutral-100 text-neutral-600' : 'bg-amber-50 text-amber-700'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${closed ? 'bg-neutral-400' : 'bg-amber-500'}`} />
            {closed ? 'Closed' : 'Open'}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-3">
          <Field label="Company">{request.company_name || '—'}</Field>
          <Field label="Received">{formatWhen(request.created_at)}</Field>
          <Field label="Reference">#{request.id}</Field>
        </div>

        <div className="mt-5 border-t border-neutral-100 pt-4">
          <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">Message</p>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-neutral-800">{request.message}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800">History</h2>
        <p className="mt-0.5 text-xs text-neutral-500">Everything that has happened to this request, oldest first.</p>

        <ol className="mt-4 space-y-0">
          {(request.events || []).map((event, index) => {
            const meta = EVENTS[event.kind] || {
              label: event.kind,
              icon: Inbox,
              tone: 'text-neutral-600 bg-neutral-100',
            }
            const Icon = meta.icon
            const last = index === request.events.length - 1
            return (
              <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                {!last && <span className="absolute top-8 left-[15px] h-full w-px bg-neutral-200" />}
                <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 pt-1">
                  <p className="text-sm font-medium text-neutral-800">
                    {meta.label}
                    {event.actor && <span className="font-normal text-neutral-500"> by {event.actor}</span>}
                  </p>
                  {event.detail && <p className="mt-0.5 text-xs text-neutral-500">{event.detail}</p>}
                  <p className="mt-0.5 text-[11px] text-neutral-400">{formatWhen(event.created_at)}</p>
                </div>
              </li>
            )
          })}

          {(request.events || []).length === 0 && (
            <li className="text-sm text-neutral-500">
              Nothing recorded for this one. It was sent before the history was kept.
            </li>
          )}
        </ol>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this request?"
          message={`The request from ${request.name} and its history will be removed for good.`}
          confirmLabel="Delete"
          confirming={deleting}
          error={deleteError}
          onConfirm={remove}
          onCancel={() => {
            setConfirmDelete(false)
            setDeleteError('')
          }}
        />
      )}

      {error && status === 'ready' && <ErrorToast message={error} onClose={() => setError('')} />}
    </div>
  )
}
