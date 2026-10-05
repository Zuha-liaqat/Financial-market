import { useRef } from 'react'
import { Loader2, Mic } from 'lucide-react'
import { appendSpokenText, useSpeechToText } from '../lib/useSpeechToText'
import { ErrorToast } from './Toast'

// Mic button for the prompt boxes. While recording, the words appear in the prompt as they're spoken,
// added after whatever was already typed.
export default function VoiceInputButton({ value, onChange }) {
  // The prompt as it was when recording started; the live transcript is written after it.
  const baseRef = useRef('')
  const speech = useSpeechToText({
    onTranscript: (text) => onChange(appendSpokenText(baseRef.current, text)),
  })

  const { status } = speech
  const recording = status === 'recording'
  const busy = status === 'connecting' || status === 'finishing'

  const label = recording
    ? 'Stop recording'
    : status === 'connecting'
      ? 'Starting voice input'
      : status === 'finishing'
        ? 'Finishing voice input'
        : 'Speak your prompt'

  function handleClick() {
    if (status === 'idle') baseRef.current = value
    speech.toggle()
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-pressed={recording}
        aria-label={label}
        title={label}
        className={`flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border transition disabled:cursor-wait ${
          recording
            ? 'border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600'
            : busy
              ? 'border-brand-200 bg-brand-50 px-3 text-xs font-semibold text-brand-700'
              : 'w-9 border-neutral-200 bg-white hover:bg-neutral-50'
        }`}
      >
        {recording ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Listening… tap to stop
          </>
        ) : busy ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {status === 'connecting' ? 'Starting…' : 'Finishing…'}
          </>
        ) : (
          <Mic className="h-5 w-5 text-brand-500" strokeWidth={2} />
        )}
      </button>
      {speech.error && <ErrorToast message={speech.error} onClose={speech.clearError} />}
    </>
  )
}
