import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, MessageCircle, Send, X } from 'lucide-react'
import { getApiToken } from '../lib/api'
import { isSuperAdmin } from '../data/auth'
import { useSupportConversations, useSupportThread, useSupportUnreadCount } from '../lib/useSupportChat'

const COMPANY_ROLE = 'company'
const ADMIN_ROLE = 'superadmin'

function formatTime(value) {
  if (!value) return ''
  const when = new Date(value)
  if (Number.isNaN(when.getTime())) return ''
  return when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatWhen(value) {
  if (!value) return ''
  const when = new Date(value)
  if (Number.isNaN(when.getTime())) return ''
  const today = new Date()
  const sameDay = when.toDateString() === today.toDateString()
  return sameDay ? formatTime(value) : when.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

function MessageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-neutral-200" />
      <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-neutral-200" />
      <div className="h-10 w-3/5 animate-pulse rounded-2xl bg-neutral-200" />
    </div>
  )
}

function Bubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
            mine ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-800'
          }`}
        >
          {message.body}
        </div>
        <div className={`mt-1 flex items-center gap-1 text-[10px] text-neutral-400 ${mine ? 'justify-end' : ''}`}>
          <span>{mine ? 'You' : message.sender_name}</span>
          <span>·</span>
          <span>{formatTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')
  const [activeCompany, setActiveCompany] = useState(null)
  const scrollerRef = useRef(null)

  // The same source of truth the sidebar and the route guards use, so the widget
  // shows the right side without waiting on /api/auth/me.
  const superAdmin = useMemo(() => isSuperAdmin(), [])
  const myRole = superAdmin ? ADMIN_ROLE : COMPANY_ROLE
  // Without a token every request would silently sign in as the super admin, so
  // the widget stays hidden until somebody is actually logged in.
  const hasToken = Boolean(getApiToken())

  const showingInbox = superAdmin && !activeCompany
  const threadCompanyId = superAdmin ? activeCompany?.company_id ?? null : null
  const threadActive = open && hasToken && (!superAdmin || Boolean(activeCompany))

  const { messages, status, error, isLive, sendMessage } = useSupportThread({
    companyId: threadCompanyId,
    active: threadActive,
  })
  const { conversations, status: inboxStatus, error: inboxError } = useSupportConversations({
    active: open && showingInbox && hasToken,
  })
  const { unreadCount } = useSupportUnreadCount({
    enabled: hasToken,
    refreshKey: `${open}-${threadCompanyId}-${messages.length}`,
  })

  // Escape closes the panel, matching the other dialogs in the app.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Stick to the newest message.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (scroller) scroller.scrollTop = scroller.scrollHeight
  }, [messages, threadActive])

  if (!hasToken) return null

  const handleSend = async (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setSendError('')
    try {
      await sendMessage(text)
    } catch (err) {
      setDraft(text)
      setSendError(err.message || 'Failed to send the message')
    }
  }

  const onComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend(event)
    }
  }

  const title = showingInbox ? 'Support' : activeCompany ? activeCompany.company_name : 'Support'
  const subtitle = showingInbox
    ? `${conversations.length} ${conversations.length === 1 ? 'conversation' : 'conversations'}`
    : isLive
      ? 'Connected'
      : 'Reconnecting…'

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-4 z-40 flex h-[30rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:right-6 sm:w-[23rem]"
          role="dialog"
          aria-modal="false"
          aria-label="Support chat"
        >
          <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
            {activeCompany && (
              <button
                type="button"
                onClick={() => setActiveCompany(null)}
                className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
                aria-label="Back to all conversations"
                data-track-label="Support - Back To Inbox"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-800">{title}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                {!showingInbox && (
                  <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                )}
                {subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
              aria-label="Close support chat"
              data-track-label="Support - Close Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {showingInbox ? (
            <div className="flex-1 overflow-y-auto">
              {inboxStatus === 'loading' && (
                <div className="p-4">
                  <MessageSkeleton />
                </div>
              )}
              {inboxStatus === 'error' && (
                <p className="p-4 text-sm text-red-600">{inboxError}</p>
              )}
              {inboxStatus === 'ready' && conversations.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                    <MessageCircle className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-neutral-500">No one has written in yet.</p>
                </div>
              )}
              {conversations.map((row) => (
                <button
                  key={row.company_id}
                  type="button"
                  onClick={() => setActiveCompany(row)}
                  className="flex w-full items-start gap-3 border-b border-neutral-100 px-4 py-3 text-left transition last:border-0 hover:bg-neutral-50"
                  data-track-label="Support - Open Conversation"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {(row.company_name || row.company_email || '?').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-neutral-800">{row.company_name}</span>
                      <span className="shrink-0 text-[10px] text-neutral-400">{formatWhen(row.last_message_at)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="truncate text-xs text-neutral-500">
                        {row.last_sender_role === ADMIN_ROLE ? 'You: ' : ''}
                        {row.last_message}
                      </span>
                      {row.unread_count > 0 && (
                        <span className="ml-auto shrink-0 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {row.unread_count}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {status === 'loading' && <MessageSkeleton />}
                {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
                {status === 'ready' && messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                      <MessageCircle className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-neutral-500">
                      {superAdmin ? 'No messages in this conversation yet.' : 'Send us a message and we’ll get back to you.'}
                    </p>
                  </div>
                )}
                {messages.map((message) => (
                  <Bubble key={message.id} message={message} mine={message.sender_role === myRole} />
                ))}
              </div>

              <form onSubmit={handleSend} className="border-t border-neutral-200 p-3">
                {sendError && <p className="mb-2 text-xs text-red-600">{sendError}</p>}
                <div className="flex items-end gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={onComposerKeyDown}
                    rows={1}
                    maxLength={4000}
                    placeholder="Write a message…"
                    className="max-h-24 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="rounded-md bg-brand-500 p-1.5 text-white transition hover:bg-brand-600 disabled:opacity-40"
                    aria-label="Send message"
                    data-track-label="Support - Send Message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition hover:bg-brand-600 sm:right-6"
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        aria-expanded={open}
        data-track-label={open ? 'Support - Close Launcher' : 'Support - Open Launcher'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </>
  )
}
