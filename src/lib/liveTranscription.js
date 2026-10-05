// Streams the microphone to Gemini Live and reports the transcript as it is spoken.
// The backend hands out a short-lived token (POST /api/speech/transcribe); the browser then
// talks to Gemini directly over a WebSocket, so audio never passes through our server.

const GEMINI_LIVE_URL =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained'

// Gemini Live takes 16-bit PCM at 16 kHz.
const TARGET_RATE = 16000
// Send about every 100 ms of audio rather than every tiny audio frame.
const SAMPLES_PER_MESSAGE = TARGET_RATE / 10
// After "stop", wait this long for the final transcript before closing anyway.
const FINISH_TIMEOUT_MS = 5000
// Give up if Gemini hasn't confirmed the session by then.
const SETUP_TIMEOUT_MS = 20000

// Copies raw microphone frames out of the audio thread.
const CAPTURE_WORKLET = `
class PcmCapture extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (channel) this.port.postMessage(channel.slice(0))
    return true
  }
}
registerProcessor('pcm-capture', PcmCapture)
`

const MIC_ERRORS = {
  NotAllowedError: 'Microphone access is blocked. Allow it in your browser settings to speak your prompt.',
  SecurityError: 'Microphone access is blocked. Allow it in your browser settings to speak your prompt.',
  NotFoundError: 'No microphone was found. Connect one and try again.',
  NotReadableError: 'Your microphone is being used by another app. Close it and try again.',
}

// Averages samples down from the microphone's rate (usually 48 kHz) to 16 kHz.
function downsample(input, inputRate) {
  if (inputRate === TARGET_RATE) return input
  const ratio = inputRate / TARGET_RATE
  const output = new Float32Array(Math.floor(input.length / ratio))
  for (let i = 0; i < output.length; i++) {
    const start = Math.floor(i * ratio)
    const end = Math.min(Math.floor((i + 1) * ratio), input.length)
    let sum = 0
    for (let j = start; j < end; j++) sum += input[j]
    output[i] = sum / Math.max(1, end - start)
  }
  return output
}

function toBase64Pcm(samples) {
  const pcm = new Int16Array(samples.length)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  const bytes = new Uint8Array(pcm.buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

// Opens the microphone and a Gemini Live session.
// onTranscript gets the whole transcript so far each time it changes (finished phrases plus the
// phrase still being spoken), onError a message for the user, and onEnd fires once when finished.
// Returns { stop, abort }: stop waits for the last words, abort drops everything (e.g. leaving the page).
export async function startLiveTranscription({ session, onTranscript, onError, onEnd }) {
  if (!navigator.mediaDevices?.getUserMedia || typeof AudioWorkletNode === 'undefined') {
    throw new Error("Voice input isn't supported in this browser.")
  }

  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })
  } catch (err) {
    throw new Error(MIC_ERRORS[err.name] || "Couldn't start the microphone. Please try again.")
  }

  const audioContext = new AudioContext()
  const workletUrl = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: 'application/javascript' }))
  await audioContext.audioWorklet.addModule(workletUrl)
  URL.revokeObjectURL(workletUrl)
  const source = audioContext.createMediaStreamSource(stream)
  const capture = new AudioWorkletNode(audioContext, 'pcm-capture')

  const socket = new WebSocket(`${GEMINI_LIVE_URL}?access_token=${encodeURIComponent(session.token)}`)
  let ready = false
  let stopping = false
  let finished = false
  let finalText = ''
  let partialText = ''
  let closedByUs = false
  let finishTimer = null
  let pending = []
  let pendingLength = 0

  function send(message) {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message))
  }

  function flushAudio() {
    if (!ready || pendingLength === 0) return
    const merged = new Float32Array(pendingLength)
    let offset = 0
    for (const chunk of pending) {
      merged.set(chunk, offset)
      offset += chunk.length
    }
    pending = []
    pendingLength = 0
    send({ realtimeInput: { audio: { data: toBase64Pcm(merged), mimeType: `audio/pcm;rate=${TARGET_RATE}` } } })
  }

  let micReleased = false
  function releaseMicrophone() {
    if (micReleased) return
    micReleased = true
    capture.port.onmessage = null
    source.disconnect()
    capture.disconnect()
    stream.getTracks().forEach((track) => track.stop())
    if (audioContext.state !== 'closed') audioContext.close()
  }

  function reportTranscript() {
    onTranscript([finalText, partialText].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim())
  }

  function finish(errorMessage) {
    if (finished) return
    finished = true
    clearTimeout(finishTimer)
    clearTimeout(setupTimer)
    releaseMicrophone()
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      closedByUs = true
      socket.close(1000)
    }
    if (errorMessage) onError(errorMessage)
    onEnd()
  }

  capture.port.onmessage = (event) => {
    const samples = downsample(event.data, audioContext.sampleRate)
    pending.push(samples)
    pendingLength += samples.length
    if (pendingLength >= SAMPLES_PER_MESSAGE) flushAudio()
  }
  source.connect(capture)

  const setupTimer = setTimeout(() => {
    if (!ready) finish('Voice input took too long to start. Please try again.')
  }, SETUP_TIMEOUT_MS)

  socket.onopen = () => {
    const setup = session.setup || {}
    send({
      setup: {
        model: session.model,
        generationConfig: { responseModalities: setup.responseModalities },
        inputAudioTranscription: setup.inputAudioTranscription,
      },
    })
  }

  socket.onmessage = async (event) => {
    const raw = typeof event.data === 'string' ? event.data : await event.data.text()
    let message
    try {
      message = JSON.parse(raw)
    } catch {
      return
    }
    if (message.error) {
      finish(message.error.message || 'Voice input failed. Please try again.')
      return
    }
    if (message.setupComplete) {
      clearTimeout(setupTimer)
      ready = true
      flushAudio()
    }
    // Words still being spoken; Gemini resends the whole phrase as it changes.
    const interim = message.serverContent?.interimInputTranscription?.text
    if (interim) {
      partialText = interim
      reportTranscript()
    }
    // A finished phrase replaces the partial one.
    const final = message.serverContent?.inputTranscription?.text
    if (final) {
      finalText = finalText ? `${finalText} ${final}` : final
      partialText = ''
      reportTranscript()
      // After "stop" the final phrase is the last thing we need.
      if (stopping) finish()
    }
    if (message.goAway) finish()
  }

  socket.onerror = () => {
    finish('Lost the connection to voice input. Please try again.')
  }

  socket.onclose = (event) => {
    if (closedByUs || finished) return
    // 1000 is a normal close; anything else means Gemini refused or dropped the session.
    finish(event.code === 1000 ? null : event.reason || 'Voice input stopped unexpectedly. Please try again.')
  }

  return {
    stop() {
      if (finished) return
      stopping = true
      // Send what's left, tell Gemini the speech is over, then wait for the final transcript.
      releaseMicrophone()
      flushAudio()
      send({ realtimeInput: { audioStreamEnd: true } })
      finishTimer = setTimeout(() => finish(), FINISH_TIMEOUT_MS)
    },
    abort() {
      onTranscript = () => {}
      onError = () => {}
      onEnd = () => {}
      finish()
    },
  }
}
