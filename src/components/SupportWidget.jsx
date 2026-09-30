import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Maximize2, MessageCircle, Minimize2, Send, X } from 'lucide-react'
import { getApiToken } from '../lib/api'
import { isSuperAdmin } from '../data/auth'
import { useSupportConversations, useSupportThread, useSupportUnreadCount } from '../lib/useSupportChat'

const COMPANY_ROLE = 'company'
const ADMIN_ROLE = 'superadmin'
// Messages sent close together by the same person are drawn as one block.
const GROUP_WINDOW_MS = 5 * 60 * 1000

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
  const sameDay = when.toDateString() === new Date().toDateString()
  return sameDay ? formatTime(value) : when.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

function dayLabel(value) {
  const when = new Date(value)
  if (Number.isNaN(when.getTime())) return ''
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (when.toDateString() === today.toDateString()) return 'Today'
  if (when.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return when.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name) {
  return (name || '?').trim().slice(0, 2).toUpperCase()
}

/** Consecutive messages from the same side become one block with one timestamp. */
function groupMessages(messages) {
  const groups = []
  messages.forEach((message) => {
    const last = groups[groups.length - 1]
    const previous = last?.items[last.items.length - 1]
    const closeEnough =
      previous &&
      last.sender_role === message.sender_role &&
      Math.abs(new Date(message.created_at) - new Date(previous.created_at)) < GROUP_WINDOW_MS &&
      new Date(message.created_at).toDateString() === new Date(previous.created_at).toDateString()

    if (closeEnough) {
      last.items.push(message)
    } else {
      groups.push({ sender_role: message.sender_role, sender_name: message.sender_name, items: [message] })
    }
  })
  return groups
}

/**
 * The rectangle a page occupies - inside <main>, past its padding - so the
 * expanded chat lines up with the content area instead of covering the sidebar
 * and the topbar. Measured rather than hardcoded so it survives layout changes.
 */
function useContentRect(enabled) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!enabled) {
      setRect(null)
      return
    }

    const measure = () => {
      const main = document.querySelector('main')
      if (!main) {
        setRect(null)
        return
      }
      const box = main.getBoundingClientRect()
      const style = window.getComputedStyle(main)
      const top = parseFloat(style.paddingTop) || 0
      const right = parseFloat(style.paddingRight) || 0
      const bottom = parseFloat(style.paddingBottom) || 0
      const left = parseFloat(style.paddingLeft) || 0
      setRect({
        top: box.top + top,
        left: box.left + left,
        width: Math.max(box.width - left - right, 0),
        height: Math.max(box.height - top - bottom, 0),
      })
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [enabled])

  return rect
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

function EmptyState({ children }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <MessageCircle className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm text-neutral-500">{children}</p>
    </div>
  )
}

function DayDivider({ value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="h-px flex-1 bg-neutral-200" />
      <span className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">{dayLabel(value)}</span>
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  )
}

function MessageGroup({ group, mine, showAvatar }) {
  const last = group.items[group.items.length - 1]

  return (
    <div className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
      {/* Only the other side gets an avatar - whose messages are on the right is
          already obvious, and a second face just crowds the column. */}
      {showAvatar && !mine && (
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-600"
          aria-hidden="true"
        >
          {initials(group.sender_name)}
        </span>
      )}
      <div className={`flex min-w-0 max-w-[78%] flex-col gap-0.5 ${mine ? 'items-end' : 'items-start'}`}>
        {group.items.map((message, index) => (
          <div
            key={message.id}
            className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap ${
              mine
                ? `bg-brand-500 text-white ${index === group.items.length - 1 ? 'rounded-br-md' : ''}`
                : `border border-neutral-200 bg-white text-neutral-800 ${
                    index === group.items.length - 1 ? 'rounded-bl-md' : ''
                  }`
            }`}
          >
            {message.body}
          </div>
        ))}
        <span className="px-1 text-[10px] text-neutral-400">
          {mine ? 'You' : group.sender_name} · {formatTime(last.created_at)}
        </span>
      </div>
    </div>
  )
}

function ConversationList({ conversations, status, error, activeId, onPick }) {
  return (
    <>
      {status === 'loading' && (
        <div className="p-4">
          <MessageSkeleton />
        </div>
      )}
      {status === 'error' && <p className="p-4 text-sm text-red-600">{error}</p>}
      {status === 'ready' && conversations.length === 0 && <EmptyState>No one has written in yet.</EmptyState>}
      {conversations.map((row) => (
        <button
          key={row.company_id}
          type="button"
          onClick={() => onPick(row)}
          className={`flex w-full items-start gap-3 border-b border-neutral-100 px-4 py-3 text-left transition last:border-0 hover:bg-neutral-50 ${
            row.company_id === activeId ? 'bg-brand-50/60' : ''
          }`}
          data-track-label="Support - Open Conversation"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
            {initials(row.company_name || row.company_email)}
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
    </>
  )
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
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

  // Expanded, a Super Admin gets the list and the thread side by side; in the
  // small popup there is only room for one at a time.
  const twoPane = superAdmin && expanded
  const showingListOnly = superAdmin && !expanded && !activeCompany
  const threadCompanyId = superAdmin ? activeCompany?.company_id ?? null : null
  const threadActive = open && hasToken && (!superAdmin || Boolean(activeCompany))

  const contentRect = useContentRect(open && expanded)

  const { messages, status, error, isLive, sendMessage } = useSupportThread({
    companyId: threadCompanyId,
    active: threadActive,
  })
  const { conversations, status: inboxStatus, error: inboxError } = useSupportConversations({
    active: open && hasToken && superAdmin && (expanded || !activeCompany),
  })
  const { unreadCount } = useSupportUnreadCount({
    enabled: hasToken,
    refreshKey: `${open}-${threadCompanyId}-${messages.length}`,
  })

  const groups = useMemo(() => groupMessages(messages), [messages])

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
  }, [messages, threadActive, expanded])

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

  const title = !superAdmin || twoPane || !activeCompany ? 'Support' : activeCompany.company_name
  const subtitle =
    showingListOnly || (twoPane && !activeCompany)
      ? `${conversations.length} ${conversations.length === 1 ? 'conversation' : 'conversations'}`
      : isLive
        ? 'Connected'
        : 'Reconnecting…'
  const showConnectionDot = !showingListOnly && !(twoPane && !activeCompany)

  // Expanded, the panel is placed over the page area that was measured; docked,
  // it is a small card above the launcher.
  const panelClass = expanded
    ? 'fixed z-40 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl'
    : 'fixed bottom-24 right-4 z-40 flex h-[30rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:right-6 sm:w-[23rem]'
  const panelStyle = expanded && contentRect ? contentRect : undefined
  // Until the measurement lands, keep the expanded panel off-screen rather than
  // flashing it at the wrong size.
  const panelHidden = expanded && !contentRect

  const hasMessages = groups.length > 0
  const thread = (
    <>
      <div ref={scrollerRef} className={`flex-1 overflow-y-auto px-4 py-3 ${expanded ? 'bg-neutral-50' : ''}`}>
        <div
          className={`flex min-h-full flex-col gap-3 ${expanded ? 'mx-auto w-full max-w-2xl' : ''} ${
            hasMessages ? 'justify-end' : ''
          }`}
        >
          {status === 'loading' && <MessageSkeleton />}
          {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
          {status === 'ready' && !hasMessages && (
            <EmptyState>
              {superAdmin ? 'No messages in this conversation yet.' : 'Send us a message and we’ll get back to you.'}
            </EmptyState>
          )}
          {groups.map((group, index) => {
            const previous = groups[index - 1]
            const newDay =
              !previous ||
              new Date(group.items[0].created_at).toDateString() !==
                new Date(previous.items[previous.items.length - 1].created_at).toDateString()
            return (
              <div key={group.items[0].id} className="flex flex-col gap-3">
                {newDay && <DayDivider value={group.items[0].created_at} />}
                <MessageGroup group={group} mine={group.sender_role === myRole} showAvatar={expanded} />
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSend} className="border-t border-neutral-200 bg-white p-3">
        <div className={expanded ? 'mx-auto w-full max-w-2xl' : ''}>
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
        </div>
      </form>
    </>
  )

  return (
    <>
      {open && (
        <div
          className={panelClass}
          style={{ ...panelStyle, ...(panelHidden ? { visibility: 'hidden' } : null) }}
          role="dialog"
          aria-modal="false"
          aria-label="Support chat"
        >
          <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
            {activeCompany && !twoPane && (
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
                {showConnectionDot && (
                  <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                )}
                {subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
              aria-label={expanded ? 'Shrink support chat' : 'Expand support chat'}
              data-track-label={expanded ? 'Support - Shrink Chat' : 'Support - Expand Chat'}
            >
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
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

          {twoPane ? (
            <div className="flex min-h-0 flex-1">
              <div className="w-72 shrink-0 overflow-y-auto border-r border-neutral-200">
                <ConversationList
                  conversations={conversations}
                  status={inboxStatus}
                  error={inboxError}
                  activeId={activeCompany?.company_id}
                  onPick={setActiveCompany}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                {activeCompany ? (
                  <>
                    <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
                        {initials(activeCompany.company_name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-neutral-800">
                          {activeCompany.company_name}
                        </span>
                        <span className="block truncate text-[11px] text-neutral-400">
                          {activeCompany.company_email}
                        </span>
                      </span>
                    </div>
                    {thread}
                  </>
                ) : (
                  <EmptyState>Pick a conversation to start replying.</EmptyState>
                )}
              </div>
            </div>
          ) : showingListOnly ? (
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                status={inboxStatus}
                error={inboxError}
                activeId={activeCompany?.company_id}
                onPick={setActiveCompany}
              />
            </div>
          ) : (
            thread
          )}
        </div>
      )}

      {!(open && expanded) && (
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
      )}
    </>
  )
}
