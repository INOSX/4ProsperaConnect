/**
 * Audio Recorder para Speech-to-Text usando OpenAI Whisper API
 * Baseado na documentação: https://docs.heygen.com/docs/adding-speech-to-text-integration-to-demo-project
 */
export class AudioRecorder {
  constructor(onStatusChange, onTranscriptionComplete, options = {}) {
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
    this.onStatusChange = onStatusChange
    this.onTranscriptionComplete = onTranscriptionComplete
    this.stream = null
    this.audioContext = null
    this.mediaStreamSource = null
    this.analyser = null
    this.silenceCheckIntervalId = null
    this.recordingStartedAt = 0
    this.options = {
      silenceThreshold: options.silenceThreshold ?? 0.03, // mais rígido contra ruído
      silenceDurationMs: options.silenceDurationMs ?? 800,
      minRecordingMs: options.minRecordingMs ?? 1200,
      timesliceMs: options.timesliceMs ?? 800,
      // Escuta contínua desligada por padrão (requer clique para cada gravação)
      continuous: options.continuous ?? false,
      // Auto-parar por silêncio desligado por padrão (parar manual)
      autoStopOnSilence: options.autoStopOnSilence ?? false,
      // Se undefined, não enviaremos o campo e o Whisper fará auto-detecção
      language: options.language,
    }
    this.lastTranscript = ''
  }

  async startRecording() {
    try {
      console.log('Requesting microphone access...')
      // Reutilizar o stream quando possível
      this.stream = this.stream || await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Microphone access granted')
      
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []
      this.isRecording = true
      this.recordingStartedAt = Date.now()

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Received audio chunk:', event.data.size, 'bytes')
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...')
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        console.log('Audio blob size:', audioBlob.size, 'bytes')
        await this.sendToWhisper(audioBlob)
      }

      this.mediaRecorder.start(this.options.timesliceMs)
      console.log('Started recording')
      this.onStatusChange('Recording... Speak now')

      // Iniciar detecção de silêncio se habilitado
      if (this.options.autoStopOnSilence) {
        await this.startSilenceDetection()
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      this.onStatusChange('Error: ' + error.message)
    }
  }

  stopRecording(stopTracks = false) {
    if (this.mediaRecorder && this.isRecording) {
      console.log('Stopping recording...')
      try { this.mediaRecorder.stop() } catch (_) {}
      this.isRecording = false
      this.onStatusChange('Processing audio...')
      this.stopSilenceDetection()

      if (stopTracks && this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }
    }
  }

  async startSilenceDetection() {
    try {
      if (!this.stream) return
      this.audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)()
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 1024
      this.mediaStreamSource.connect(this.analyser)

      const bufferLength = this.analyser.fftSize
      const dataArray = new Float32Array(bufferLength)
      let silenceStart = Date.now()

      this.stopSilenceDetection()
      this.silenceCheckIntervalId = setInterval(() => {
        if (!this.isRecording) return
        this.analyser.getFloatTimeDomainData(dataArray)
        // RMS simples
        let sumSquares = 0
        for (let i = 0; i < bufferLength; i++) sumSquares += dataArray[i] * dataArray[i]
        const rms = Math.sqrt(sumSquares / bufferLength)

        const now = Date.now()
        const elapsed = now - this.recordingStartedAt
        const isSilent = rms < this.options.silenceThreshold

        if (isSilent) {
          if (now - silenceStart > this.options.silenceDurationMs && elapsed > this.options.minRecordingMs) {
            // Silêncio sustentado: parar automaticamente sem encerrar as trilhas
            this.stopRecording(false)
          }
        } else {
          silenceStart = now
        }
      }, 150)
    } catch (err) {
      console.warn('Silence detection unavailable:', err?.message)
    }
  }

  stopSilenceDetection() {
    if (this.silenceCheckIntervalId) {
      clearInterval(this.silenceCheckIntervalId)
      this.silenceCheckIntervalId = null
    }
  }

  async sendToWhisper(audioBlob) {
    try {
      console.log('Sending audio to Whisper API...')
      
      // Converter blob para base64 para enviar via JSON
      const base64 = await this.blobToBase64(audioBlob)
      
      const payload = {
        file: base64,
      }
      if (this.options.language) payload.language = this.options.language

      const response = await fetch('/api/openai/whisper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`)
      }

      const data = await response.json()
      const text = (data.text || '').trim()
      console.log('🔵 Received transcription from Whisper:', text)
      console.log('🔵 Transcription details:', {
        text,
        length: text.length,
        isEmpty: !text,
        isTooShort: text.length < 2,
        lastTranscript: this.lastTranscript,
        isDuplicate: text === this.lastTranscript,
        hasCallback: typeof this.onTranscriptionComplete === 'function'
      })
      
      this.onStatusChange('')
      
      // Filtrar vazios/curtíssimos/repetidos
      if (text && text.length >= 2 && text !== this.lastTranscript) {
        this.lastTranscript = text
        console.log('✅ Transcription passed filters, calling callback...')
        console.log('🔵 onTranscriptionComplete callback exists?', typeof this.onTranscriptionComplete === 'function')
        
        try {
          // Verificar se o callback é uma função assíncrona
          const callbackResult = this.onTranscriptionComplete(text)
          if (callbackResult instanceof Promise) {
            console.log('🔵 Callback returned a Promise, awaiting...')
            await callbackResult
            console.log('✅ Callback Promise resolved')
          } else {
            console.log('✅ Callback executed synchronously')
          }
        } catch (error) {
          console.error('❌ Error in onTranscriptionComplete callback:', error)
          console.error('❌ Error stack:', error.stack)
          console.error('❌ Error details:', {
            message: error.message,
            name: error.name,
            error
          })
        }
      } else {
        const reason = !text ? 'empty' : text.length < 2 ? 'too short' : 'duplicate'
        console.warn('⚠️ Transcription filtered out:', {
          reason,
          text,
          lastTranscript: this.lastTranscript
        })
      }

      // Reiniciar automaticamente se estiver no modo contínuo
      if (this.options.continuous) {
        // Pequena pausa para evitar encadear gravações
        setTimeout(() => {
          if (!this.isRecording) {
            this.startRecording()
          }
        }, 250)
      }
    } catch (error) {
      console.error('Error transcribing audio:', error)
      this.onStatusChange('Error: Failed to transcribe audio')
    }
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        // Remover o prefixo data:audio/webm;base64,
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

