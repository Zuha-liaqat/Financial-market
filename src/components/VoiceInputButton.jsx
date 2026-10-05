import { Loader2, Mic } from 'lucide-react'
import { useSpeechToText } from '../lib/useSpeechToText'
import { ErrorToast } from './Toast'

// Mic button for the prompt boxes: tap to record, tap again to stop and turn the speech into text.
export default function VoiceInputButton({ onText }) {
  const speech = useSpeechToText({ onText })
  const recording = speech.status === 'recording'
  const transcribing = speech.status === 'transcribing'

  const label = recording ? 'Stop recording' : transcribing ? 'Converting speech to text' : 'Speak your prompt'

  return (
    <>
      <button
        type="button"
        onClick={speech.toggle}
        disabled={transcribing}
        aria-pressed={recording}
        aria-label={label}
        title={label}
        className={`flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border transition disabled:cursor-wait ${
          recording
            ? 'border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600'
            : transcribing
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
            Recording… tap to stop
          </>
        ) : transcribing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Converting…
          </>
        ) : (
          <Mic className="h-5 w-5 text-brand-500" strokeWidth={2} />
        )}
      </button>
      {speech.error && <ErrorToast message={speech.error} onClose={speech.clearError} />}
    </>
  )
}
