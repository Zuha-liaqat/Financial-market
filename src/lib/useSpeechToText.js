import { useEffect, useRef, useState } from 'react'
import { apiStartSpeechSession } from './api'
import { startLiveTranscription } from './liveTranscription'

// Long sessions are cut off so a forgotten open mic doesn't keep streaming.
const MAX_SESSION_MS = 5 * 60 * 1000

// Adds spoken text to the end of a prompt, with a space if the prompt doesn't already end in one.
export function appendSpokenText(prev, text) {
  if (!text) return prev
  return prev && !/\s$/.test(prev) ? `${prev} ${text}` : prev + text
}

// Live speech-to-text for the prompt boxes.
// onTranscript receives everything said so far in this recording, updated as the person speaks.
// status is 'idle', 'connecting', 'recording' or 'finishing'.
export function useSpeechToText({ onTranscript }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const sessionRef = useRef(null)
  const timerRef = useRef(null)
  const unmountedRef = useRef(false)
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  // Leaving the page while recording closes the microphone and the session.
  // The flag is reset on mount because StrictMode mounts, unmounts and mounts again in development.
  useEffect(() => {
    unmountedRef.current = false
    return () => {
      unmountedRef.current = true
      clearTimeout(timerRef.current)
      sessionRef.current?.abort()
    }
  }, [])

  async function start() {
    setError('')
    setStatus('connecting')
    try {
      const session = await apiStartSpeechSession()
      if (unmountedRef.current) return
      const live = await startLiveTranscription({
        session,
        onTranscript: (text) => onTranscriptRef.current(text),
        onError: (message) => !unmountedRef.current && setError(message),
        onEnd: () => {
          clearTimeout(timerRef.current)
          sessionRef.current = null
          if (!unmountedRef.current) setStatus('idle')
        },
      })
      if (unmountedRef.current) {
        live.abort()
        return
      }
      sessionRef.current = live
      setStatus('recording')
      timerRef.current = setTimeout(stop, MAX_SESSION_MS)
    } catch (err) {
      if (unmountedRef.current) return
      setError(err.message || "Couldn't start voice input.")
      setStatus('idle')
    }
  }

  function stop() {
    if (!sessionRef.current) return
    setStatus('finishing')
    sessionRef.current.stop()
  }

  return {
    status,
    error,
    clearError: () => setError(''),
    toggle: () => {
      if (status === 'recording') stop()
      else if (status === 'idle') start()
    },
  }
}
