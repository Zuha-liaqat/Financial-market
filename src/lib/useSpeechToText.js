import { useEffect, useRef, useState } from 'react'
import { apiTranscribeSpeech } from './api'

// The transcribe endpoint expects a short clip, so a recording stops on its own after this long.
const MAX_RECORDING_MS = 60 * 1000

const MIC_ERRORS = {
  NotAllowedError: 'Microphone access is blocked. Allow it in your browser settings to speak your prompt.',
  SecurityError: 'Microphone access is blocked. Allow it in your browser settings to speak your prompt.',
  NotFoundError: 'No microphone was found. Connect one and try again.',
  NotReadableError: 'Your microphone is being used by another app. Close it and try again.',
}

// Prefer WebM (what the API documents); Safari only records MP4.
function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

// Adds spoken text to the end of a prompt, with a space if the prompt doesn't already end in one.
export function appendSpokenText(prev, text) {
  return prev && !/\s$/.test(prev) ? `${prev} ${text}` : prev + text
}

// Records the microphone, sends the clip to the transcribe API and hands the text to onText.
// status is 'idle', 'recording' or 'transcribing'.
export function useSpeechToText({ onText }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const recorderRef = useRef(null)
  const timerRef = useRef(null)
  const unmountedRef = useRef(false)
  const onTextRef = useRef(onText)

  useEffect(() => {
    onTextRef.current = onText
  }, [onText])

  // Leaving the page while recording releases the microphone and drops the clip.
  // The flag is reset on mount because StrictMode mounts, unmounts and mounts again in development.
  useEffect(() => {
    unmountedRef.current = false
    return () => {
      unmountedRef.current = true
      clearTimeout(timerRef.current)
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') recorder.stop()
    }
  }, [])

  async function transcribe(blob) {
    setStatus('transcribing')
    try {
      const text = (await apiTranscribeSpeech(blob)).trim()
      if (unmountedRef.current) return
      if (text) onTextRef.current(text)
      else setError("We couldn't hear anything in that recording. Please try again.")
    } catch (err) {
      if (!unmountedRef.current) setError(err.message)
    } finally {
      if (!unmountedRef.current) setStatus('idle')
    }
  }

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError("Voice input isn't supported in this browser.")
      return
    }
    setError('')
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      setError(MIC_ERRORS[err.name] || "Couldn't start the microphone. Please try again.")
      return
    }

    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    const chunks = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    recorder.onstop = () => {
      clearTimeout(timerRef.current)
      stream.getTracks().forEach((track) => track.stop())
      recorderRef.current = null
      if (unmountedRef.current) return
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      if (blob.size === 0) {
        setStatus('idle')
        return
      }
      transcribe(blob)
    }

    recorderRef.current = recorder
    recorder.start()
    setStatus('recording')
    timerRef.current = setTimeout(stop, MAX_RECORDING_MS)
  }

  function stop() {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
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
