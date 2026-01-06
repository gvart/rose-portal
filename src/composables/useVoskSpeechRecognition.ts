import { ref, computed } from 'vue'
import { useHapticFeedback } from './useHapticFeedback'
import { useConfiguration } from './useConfiguration'

// Vosk WebSocket configuration
const INACTIVITY_TIMEOUT = 3000 // 3 seconds
const SAMPLE_RATE = 16000 // 16kHz sample rate for Vosk

// Global state to ensure only one microphone is active at a time
const activeListenerId = ref<string | null>(null)
const globalWebSocket = ref<WebSocket | null>(null)
const globalIsListening = ref(false)
const globalMediaStream = ref<MediaStream | null>(null)
const globalAudioContext = ref<AudioContext | null>(null)
const globalProcessor = ref<ScriptProcessorNode | null>(null)

export interface VoskMessage {
  partial?: string
  text?: string
}

export function useVoskSpeechRecognition() {
  const { vibrate } = useHapticFeedback()

  const listenerId = ref<string>(`mic-${Date.now()}-${Math.random()}`)
  const transcript = ref('')
  const error = ref<string | null>(null)
  const isConnecting = ref(false)

  let inactivityTimer: number | null = null
  let onTranscriptCallback: ((text: string) => void) | null = null
  let initialValue = ''
  let accumulatedTranscript = ''

  // Computed property to check if this instance is the active one
  const isListening = computed(() => {
    return globalIsListening.value && activeListenerId.value === listenerId.value
  })

  function resetInactivityTimer() {
    if (inactivityTimer) {
      window.clearTimeout(inactivityTimer)
    }

    inactivityTimer = window.setTimeout(() => {
      console.log('Vosk: 3 seconds of inactivity, stopping...')
      stopListening()
    }, INACTIVITY_TIMEOUT)
  }

  function clearInactivityTimer() {
    if (inactivityTimer) {
      window.clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }

  function handleWebSocketMessage(event: MessageEvent) {
    try {
      const data: VoskMessage = JSON.parse(event.data)

      // Filter out common noise/filler words
      const fillerWords = ['the', 'a', 'an', 'uh', 'um', 'huh']

      // Handle partial results (real-time transcription)
      if (data.partial) {
        const partialText = data.partial.trim()

        // Ignore if it's just a filler word
        if (partialText && !fillerWords.includes(partialText.toLowerCase())) {
          const newText = (accumulatedTranscript ? accumulatedTranscript + ' ' : '') + partialText
          transcript.value = newText
          if (onTranscriptCallback) {
            onTranscriptCallback(newText)
          }
          resetInactivityTimer()
        }
      }

      // Handle final results
      if (data.text) {
        const finalText = data.text.trim()

        // Ignore if it's just a filler word
        if (finalText && !fillerWords.includes(finalText.toLowerCase())) {
          // Add to accumulated transcript
          accumulatedTranscript += (accumulatedTranscript ? ' ' : '') + finalText
          transcript.value = accumulatedTranscript
          if (onTranscriptCallback) {
            onTranscriptCallback(accumulatedTranscript)
          }
          resetInactivityTimer()
        }
      }
    } catch (err) {
      console.error('Failed to parse Vosk message:', err)
      error.value = 'Failed to process speech recognition data'
    }
  }

  function handleWebSocketError(event: Event) {
    console.error('WebSocket error:', event)
    error.value = 'Connection error. Please check if Vosk service is running.'
    globalIsListening.value = false
    activeListenerId.value = null
    clearInactivityTimer()
    vibrate('medium')
  }

  function handleWebSocketClose(event: CloseEvent) {
    console.log('WebSocket closed:', event.code, event.reason)

    if (globalIsListening.value) {
      // Only show error if we didn't intentionally close
      if (!event.wasClean) {
        error.value = 'Connection lost. Please try again.'
      }
      globalIsListening.value = false
      activeListenerId.value = null
      clearInactivityTimer()
    }

    globalWebSocket.value = null
  }

  function handleWebSocketOpen() {
    console.log('WebSocket connected to Vosk server')
    console.log('WebSocket ready state:', globalWebSocket.value?.readyState)
    isConnecting.value = false
    error.value = null

    // Start the inactivity timer
    resetInactivityTimer()
  }

  function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Int16Array {
    if (inputSampleRate === outputSampleRate) {
      const output = new Int16Array(buffer.length)
      for (let i = 0; i < buffer.length; i++) {
        const s = Math.max(-1, Math.min(1, buffer[i]))
        output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }
      return output
    }

    const sampleRateRatio = inputSampleRate / outputSampleRate
    const newLength = Math.round(buffer.length / sampleRateRatio)
    const result = new Int16Array(newLength)

    let offsetResult = 0
    let offsetBuffer = 0

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
      let accum = 0
      let count = 0

      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i]
        count++
      }

      const sample = accum / count
      const s = Math.max(-1, Math.min(1, sample))
      result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7fff
      offsetResult++
      offsetBuffer = nextOffsetBuffer
    }

    return result
  }

  async function startAudioCapture() {
    console.log('Starting audio capture...')
    console.log('User agent:', navigator.userAgent)
    console.log('Is HTTPS:', window.location.protocol === 'https:')
    console.log('Is localhost:', window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

    // Check if mediaDevices is available (requires HTTPS or localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      throw new Error(`Microphone access requires HTTPS. Current: ${protocol}//${hostname}. Please use https:// or localhost`)
    }

    console.log('Requesting microphone permission...')

    // Request microphone permission and get audio stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })

    console.log('Microphone permission granted, stream obtained')
    globalMediaStream.value = stream

    // Create audio context with default sample rate (usually 48kHz)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    globalAudioContext.value = audioContext

    console.log(`AudioContext sample rate: ${audioContext.sampleRate}`)
    console.log(`AudioContext state: ${audioContext.state}`)

    // Resume audio context if it's suspended (common on mobile)
    if (audioContext.state === 'suspended') {
      console.log('AudioContext is suspended, resuming...')
      await audioContext.resume()
      console.log(`AudioContext state after resume: ${audioContext.state}`)
    }

    const source = audioContext.createMediaStreamSource(stream)
    console.log('MediaStreamSource created')

    // Use ScriptProcessorNode (deprecated but widely supported)
    // Buffer size must be power of 2: 256, 512, 1024, 2048, 4096, 8192, 16384
    const bufferSize = 4096
    const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)
    globalProcessor.value = processor

    console.log(`ScriptProcessorNode created with buffer size: ${bufferSize}`)

    let processCount = 0
    processor.onaudioprocess = (e) => {
      processCount++

      if (processCount === 1) {
        console.log('First audio process event received')
      }

      if (!globalWebSocket.value || globalWebSocket.value.readyState !== WebSocket.OPEN) {
        if (processCount % 100 === 0) {
          console.warn('WebSocket not ready, skipping audio chunk')
        }
        return
      }

      const inputData = e.inputBuffer.getChannelData(0)
      // Downsample from the AudioContext's sample rate to 16kHz for Vosk
      const outputData = downsampleBuffer(
        inputData,
        audioContext.sampleRate,
        SAMPLE_RATE
      )

      // Send audio data to Vosk server
      try {
        globalWebSocket.value.send(outputData.buffer)

        if (processCount === 1) {
          console.log('First audio chunk sent to Vosk')
        }
      } catch (err) {
        console.error('Failed to send audio data:', err)
      }
    }

    source.connect(processor)
    processor.connect(audioContext.destination)

    console.log('Audio nodes connected, capture started successfully')
  }

  function stopAudioCapture() {
    // Stop all audio tracks
    if (globalMediaStream.value) {
      globalMediaStream.value.getTracks().forEach(track => track.stop())
      globalMediaStream.value = null
    }

    // Disconnect and close audio context
    if (globalProcessor.value) {
      globalProcessor.value.disconnect()
      globalProcessor.value = null
    }

    if (globalAudioContext.value) {
      globalAudioContext.value.close()
      globalAudioContext.value = null
    }

    console.log('Audio capture stopped')
  }

  async function startListening(onTranscript: (text: string) => void) {
    // Stop any currently active microphone
    if (activeListenerId.value && activeListenerId.value !== listenerId.value) {
      stopListening()
    }

    // Set this instance as the active one
    activeListenerId.value = listenerId.value
    onTranscriptCallback = onTranscript
    initialValue = ''
    accumulatedTranscript = ''
    transcript.value = ''
    error.value = null
    isConnecting.value = true

    // Clear the field immediately when starting
    if (onTranscriptCallback) {
      onTranscriptCallback('')
    }

    try {
      console.log('=== Starting listening session ===')

      // First, start audio capture (requests microphone permission)
      await startAudioCapture()
      console.log('Audio capture setup complete')

      // Only after audio is successfully captured, connect to WebSocket
      if (!globalWebSocket.value || globalWebSocket.value.readyState === WebSocket.CLOSED) {
        const { getVoskUrl } = useConfiguration()
        let voskUrl = getVoskUrl()

        // Development: use default local URL if not configured
        if (!voskUrl && !import.meta.env.PROD) {
          voskUrl = 'ws://raspberrypi.local:2700'
          console.log('Development mode: using default Vosk URL')
        }

        if (!voskUrl) {
          throw new Error('Vosk WebSocket URL not configured. Please configure in Settings.')
        }

        console.log(`Connecting to Vosk WebSocket at ${voskUrl}...`)
        globalWebSocket.value = new WebSocket(voskUrl)

        globalWebSocket.value.onopen = handleWebSocketOpen
        globalWebSocket.value.onmessage = handleWebSocketMessage
        globalWebSocket.value.onerror = handleWebSocketError
        globalWebSocket.value.onclose = handleWebSocketClose

        globalIsListening.value = true
        vibrate('medium')
        console.log('WebSocket connection initiated')
      } else if (globalWebSocket.value.readyState === WebSocket.OPEN) {
        console.log('Reusing existing WebSocket connection')
        globalIsListening.value = true
        isConnecting.value = false
        resetInactivityTimer()
        vibrate('medium')
      }
    } catch (err) {
      console.error('=== Failed to start listening ===')
      console.error('Error details:', err)
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace')

      let errorMessage = 'Failed to access microphone. Please grant permission.'

      // Handle specific errors
      if (err instanceof DOMException) {
        if (err.name === 'SecurityError' || err.message.includes('insecure')) {
          errorMessage = 'SSL certificate not trusted. Please install the certificate on your device or tap "Advanced" → "Proceed" in the browser warning.'
        } else if (err.name === 'NotAllowedError') {
          errorMessage = 'Microphone permission denied. Please grant permission in browser settings.'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No microphone found on this device.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      error.value = errorMessage
      isConnecting.value = false
      activeListenerId.value = null
      stopAudioCapture()
      vibrate('medium')
    }
  }

  function stopListening() {
    clearInactivityTimer()

    // Only stop if this instance is the active one
    if (activeListenerId.value === listenerId.value) {
      globalIsListening.value = false
      activeListenerId.value = null

      // Stop audio capture
      stopAudioCapture()

      // Send EOF to Vosk server
      if (globalWebSocket.value && globalWebSocket.value.readyState === WebSocket.OPEN) {
        try {
          globalWebSocket.value.send('{"eof" : 1}')
        } catch (err) {
          console.error('Failed to send EOF:', err)
        }
        globalWebSocket.value.close()
        globalWebSocket.value = null
      }

      vibrate('light')
    }

    onTranscriptCallback = null
  }

  // Cleanup on component unmount
  function cleanup() {
    if (activeListenerId.value === listenerId.value) {
      stopListening()
    }
  }

  return {
    isListening,
    isConnecting: computed(() => isConnecting.value),
    transcript: computed(() => transcript.value),
    error: computed(() => error.value),
    startListening,
    stopListening,
    cleanup
  }
}
