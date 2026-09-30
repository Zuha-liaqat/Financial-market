import { useCallback, useEffect, useRef, useState } from 'react'
import {
  apiAdminListSupportConversations,
  apiGetSupportThread,
  apiGetSupportUnreadCount,
  apiMarkSupportRead,
  apiSendSupportMessage,
  getApiBaseUrl,
  getApiToken,
} from './api'

// How often the REST fallback re-reads the conversation when the socket is not up.
const THREAD_POLL_MS = 4000
// The unread badge and the inbox list always poll; they are cheap and only need
// to be roughly live.
const BADGE_POLL_MS = 20000
const INBOX_POLL_MS = 10000

function socketUrl(companyId) {
  const base = getApiBaseUrl()
  const token = getApiToken()
  if (!base || !token) return null

  const params = new URLSearchParams({ token })
  if (companyId) params.set('company_id', String(companyId))
  return `${base.replace(/^http/, 'ws')}/api/support/ws?${params.toString()}`
}

function mergeById(previous, incoming) {
  const byId = new Map(previous.map((message) => [message.id, message]))
  incoming.forEach((message) => byId.set(message.id, message))
  return [...byId.values()].sort((a, b) => a.id - b.id)
}

/**
 * One Support conversation, live over a WebSocket when the backend supports it.
 *
 * `companyId` is null for a company user (the server already knows whose thread
 * it is) and the target company's id when a Super Admin opens a thread. If the
 * socket can't connect - which is what happens on a serverless host like Vercel -
 * the hook keeps the same conversation working by polling the REST endpoints, so
 * the caller never has to care which mode it is in beyond showing `isLive`.
 */
export function useSupportThread({ companyId = null, active = false }) {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [isLive, setIsLive] = useState(false)
  const socketRef = useRef(null)

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setStatus((current) => (current === 'ready' ? current : 'loading'))
      try {
        const thread = await apiGetSupportThread(companyId)
        setMessages((previous) => mergeById(previous, thread?.messages || []))
        setStatus('ready')
        setError('')
        return thread
      } catch (err) {
        setError(err.message || 'Failed to load the support chat')
        setStatus((current) => (current === 'ready' ? current : 'error'))
        return null
      }
    },
    [companyId],
  )

  // Switching thread must not leave the previous company's messages on screen.
  useEffect(() => {
    setMessages([])
    setStatus('idle')
    setError('')
  }, [companyId])

  useEffect(() => {
    if (!active) return
    let cancelled = false
    load().then(() => {
      if (cancelled) return
      apiMarkSupportRead(companyId).catch(() => {})
    })
    return () => {
      cancelled = true
    }
  }, [active, companyId, load])

  // Live socket. Anything that goes wrong here is not shown to the user: the
  // polling effect below takes over and the chat carries on.
  useEffect(() => {
    if (!active) return

    const url = socketUrl(companyId)
    if (!url) return

    let socket
    try {
      socket = new WebSocket(url)
    } catch {
      return
    }
    socketRef.current = socket

    socket.onopen = () => {
      setIsLive(true)
      try {
        socket.send(JSON.stringify({ type: 'read' }))
      } catch {
        // The socket closed between opening and this send; polling covers it.
      }
    }

    socket.onmessage = (event) => {
      let data
      try {
        data = JSON.parse(event.data)
      } catch {
        return
      }
      if (data?.type === 'message' && data.message) {
        setMessages((previous) => mergeById(previous, [data.message]))
        setStatus('ready')
      } else if (data?.type === 'read') {
        setMessages((previous) =>
          previous.map((message) => (message.read_at ? message : { ...message, read_at: new Date().toISOString() })),
        )
      }
    }

    socket.onerror = () => setIsLive(false)
    socket.onclose = () => {
      setIsLive(false)
      if (socketRef.current === socket) socketRef.current = null
    }

    return () => {
      setIsLive(false)
      if (socketRef.current === socket) socketRef.current = null
      try {
        socket.close()
      } catch {
        // Already closed.
      }
    }
  }, [active, companyId])

  // REST fallback: only runs while the socket is not carrying the conversation.
  useEffect(() => {
    if (!active || isLive) return
    const timer = setInterval(() => load({ quiet: true }), THREAD_POLL_MS)
    return () => clearInterval(timer)
  }, [active, isLive, load])

  const sendMessage = useCallback(
    async (text) => {
      const body = String(text || '').trim()
      if (!body) return

      const socket = socketRef.current
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'message', body }))
        return
      }

      const saved = await apiSendSupportMessage({ body }, companyId)
      setMessages((previous) => mergeById(previous, [saved]))
    },
    [companyId],
  )

  return { messages, status, error, isLive, sendMessage, reload: load }
}

/** Unread total for the badge on the round Support button. */
export function useSupportUnreadCount({ enabled = true, refreshKey = 0 }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    const read = () => {
      apiGetSupportUnreadCount()
        .then((count) => {
          if (!cancelled) setUnreadCount(count)
        })
        .catch(() => {})
    }

    read()
    const timer = setInterval(read, BADGE_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [enabled, refreshKey])

  return { unreadCount, setUnreadCount }
}

/** The Super Admin's list of company threads, newest and unanswered first. */
export function useSupportConversations({ active = false, refreshKey = 0 }) {
  const [conversations, setConversations] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!active) return
    let cancelled = false

    const read = (quiet) => {
      if (!quiet) setStatus((current) => (current === 'ready' ? current : 'loading'))
      apiAdminListSupportConversations()
        .then((body) => {
          if (cancelled) return
          setConversations(body?.conversations || [])
          setStatus('ready')
          setError('')
        })
        .catch((err) => {
          if (cancelled) return
          setError(err.message || 'Failed to load support conversations')
          setStatus((current) => (current === 'ready' ? current : 'error'))
        })
    }

    read(false)
    const timer = setInterval(() => read(true), INBOX_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [active, refreshKey])

  return { conversations, status, error }
}
