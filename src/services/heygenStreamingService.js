/**
 * Serviço para integração com HeyGen Streaming Avatar usando SDK oficial
 * Baseado na documentação: https://docs.heygen.com/docs/streaming-avatar-sdk
 */
import StreamingAvatar, { StreamingEvents, TaskType, TaskMode } from '@heygen/streaming-avatar'

export class HeyGenStreamingService {
  constructor() {
    this.avatar = null
    this.sessionId = null
    this.videoElement = null
    this.sessionToken = null
  }

  /**
   * Limpa o session token em cache (útil para reconexão)
   */
  clearSessionToken() {
    this.sessionToken = null
    console.log('🔄 Session token cleared')
  }

  /**
   * Obtém o session token do backend (proxy)
   * @param {boolean} forceRefresh - Se true, força a obtenção de um novo token mesmo se já existir um em cache
   * @returns {Promise<string>} Session token
   */
  async getSessionToken(forceRefresh = false) {
    if (this.sessionToken && !forceRefresh) {
      return this.sessionToken
    }

    try {
      const response = await fetch('/api/heygen/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createSessionToken',
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(`Failed to get session token: ${error.message || error.error || response.statusText}`)
      }

      const data = await response.json()
      console.log('🔵 Session token response:', { 
        hasToken: !!data.token, 
        hasAccessToken: !!data.access_token,
        hasSessionToken: !!data.session_token,
        hasDataToken: !!data.data?.token,
        keys: Object.keys(data),
        forceRefresh
      })
      
      // O token pode estar em diferentes campos dependendo da resposta
      this.sessionToken = data.token || data.access_token || data.session_token || data.data?.token
      
      if (!this.sessionToken) {
        console.error('❌ Session token not found. Response:', data)
        throw new Error('Session token not found in response')
      }

      console.log('✅ Session token obtained:', this.sessionToken.substring(0, 20) + '...')
      return this.sessionToken
    } catch (error) {
      console.error('Error getting session token:', error)
      throw error
    }
  }

  /**
   * Lista avatares disponíveis
   */
  async listAvatars() {
    try {
      const response = await fetch('/api/heygen/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'listAvatars',
        }),
      })

      if (!response.ok) {
        console.warn('⚠️ Failed to list avatars, response not ok')
        return []
      }

      const data = await response.json()
      console.log('🔵 listAvatars response structure:', { 
        hasData: !!data.data, 
        hasAvatars: !!data.avatars,
        keys: Object.keys(data),
        dataType: typeof data,
        isArray: Array.isArray(data)
      })
      
      // Garantir que sempre retornamos um array
      // A API pode retornar: { data: {...}, avatars: [...], talking_photos: [...] }
      let avatars = []
      
      if (Array.isArray(data)) {
        avatars = data
      } else if (data && typeof data === 'object') {
        // Tentar diferentes propriedades possíveis
        if (Array.isArray(data.avatars)) {
          avatars = data.avatars
        } else if (Array.isArray(data.data)) {
          avatars = data.data
        } else if (data.data && Array.isArray(data.data.avatars)) {
          avatars = data.data.avatars
        } else {
          // Se for objeto, tentar encontrar qualquer array dentro
          const keys = Object.keys(data)
          for (const key of keys) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
              // Preferir 'avatars' sobre outros arrays
              if (key === 'avatars' || avatars.length === 0) {
                avatars = data[key]
                if (key === 'avatars') break
              }
            }
          }
        }
      }
      
      console.log(`✅ Extracted ${avatars.length} avatars from response`)
      return avatars
    } catch (error) {
      console.error('Error listing avatars:', error)
      return []
    }
  }

  /**
   * Configura os event listeners do avatar
   * @param {HTMLVideoElement} videoElement - Elemento de vídeo
   * @param {Function} onDisconnectCallback - Callback chamado quando desconectar (opcional)
   * @returns {Promise<void>} Resolve quando o stream estiver pronto
   */
  setupEventListeners(videoElement, onDisconnectCallback = null) {
    return new Promise((resolve, reject) => {
      if (!this.avatar) {
        reject(new Error('Avatar not initialized'))
        return
      }

      let streamReady = false
      let timeoutId = null

      // Listener para quando o stream estiver pronto
      const onStreamReady = (event) => {
        console.log('✅ Stream is ready event received')
        streamReady = true
        
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        // O MediaStream está disponível na propriedade mediaStream do avatar
        const stream = this.avatar.mediaStream || (event && event.detail && event.detail.stream) || (event && event.detail)
        
        if (videoElement && stream) {
          console.log('Setting video srcObject from stream')
          videoElement.srcObject = stream
          videoElement.play()
            .then(() => {
              console.log('✅ Video started playing')
              resolve()
            })
            .catch(err => {
              console.error('Error playing video:', err)
              // Não rejeitar aqui, apenas logar o erro
              // O stream pode estar pronto mesmo que o play falhe inicialmente
              resolve()
            })
        } else {
          // Verificar novamente após um breve delay
          setTimeout(() => {
            if (this.avatar && this.avatar.mediaStream) {
              console.log('Setting video srcObject from avatar.mediaStream (delayed)')
              videoElement.srcObject = this.avatar.mediaStream
              videoElement.play()
                .then(() => {
                  console.log('✅ Video started playing (delayed)')
                  resolve()
                })
                .catch(err => {
                  console.error('Error playing video (delayed):', err)
                  resolve()
                })
            } else {
              console.warn('Stream ready but no mediaStream found')
              resolve()
            }
          }, 1000)
        }
      }

      // Listener para desconexão
      const onDisconnected = () => {
        console.log('Stream disconnected')
        if (videoElement) {
          videoElement.srcObject = null
        }
        // Notificar o componente sobre a desconexão
        if (onDisconnectCallback && typeof onDisconnectCallback === 'function') {
          onDisconnectCallback()
        }
        // Limpar estado interno para indicar que a sessão não está mais válida
        this.avatar = null
        this.sessionId = null
      }

      // Listener para quando avatar começa a falar
      const onAvatarStartTalking = () => {
        console.log('Avatar started speaking')
      }

      // Listener para quando avatar para de falar
      const onAvatarStopTalking = () => {
        console.log('Avatar stopped speaking')
      }

      // Registrar listeners ANTES de iniciar a sessão
      this.avatar.on(StreamingEvents.STREAM_READY, onStreamReady)
      this.avatar.on(StreamingEvents.STREAM_DISCONNECTED, onDisconnected)
      this.avatar.on(StreamingEvents.AVATAR_START_TALKING, onAvatarStartTalking)
      this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, onAvatarStopTalking)

      // Verificar periodicamente se o mediaStream está disponível
      const checkInterval = setInterval(() => {
        if (this.avatar && this.avatar.mediaStream && !videoElement.srcObject) {
          console.log('MediaStream detected via polling, setting video srcObject')
          streamReady = true
          clearInterval(checkInterval)
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          videoElement.srcObject = this.avatar.mediaStream
          videoElement.play()
            .then(() => {
              console.log('✅ Video started playing (via polling)')
              resolve()
            })
            .catch(err => {
              console.error('Error playing video (via polling):', err)
              resolve()
            })
        }
      }, 500)

      // Timeout de segurança aumentado para 60 segundos
      timeoutId = setTimeout(() => {
        clearInterval(checkInterval)
        if (!streamReady && !videoElement.srcObject) {
          console.warn('Stream ready event not received within timeout')
          // Verificar uma última vez se o mediaStream está disponível
          if (this.avatar && this.avatar.mediaStream) {
            console.log('MediaStream found after timeout, attempting to use it')
            videoElement.srcObject = this.avatar.mediaStream
            videoElement.play()
              .then(() => {
                console.log('✅ Video started playing (after timeout)')
                resolve()
              })
              .catch(err => {
                console.error('Error playing video (after timeout):', err)
                // Não rejeitar, apenas logar
                resolve()
              })
          } else {
            reject(new Error('Stream timeout: STREAM_READY event not received and mediaStream not available'))
          }
        } else {
          // Stream está pronto, apenas limpar
          clearInterval(checkInterval)
        }
      }, 60000) // 60 segundos
    })
  }

  /**
   * Cria uma nova sessão de streaming usando o SDK oficial
   * @param {string} avatarId - ID do avatar (opcional)
   * @param {HTMLVideoElement} videoElement - Elemento de vídeo (opcional, pode ser configurado depois)
   * @param {string} knowledgeId - ID da knowledge base para respostas inteligentes (opcional)
   * @param {Function} onDisconnectCallback - Callback chamado quando desconectar (opcional)
   * @returns {Promise<Object>} Session data
   */
  async createSession(avatarId = null, videoElement = null, knowledgeId = null, onDisconnectCallback = null, forceNewToken = false) {
    try {
      // Se forçar novo token, limpar o cache primeiro
      if (forceNewToken) {
        this.clearSessionToken()
      }
      
      // Obter session token primeiro (forçar refresh se necessário)
      const token = await this.getSessionToken(forceNewToken)
      
      // Buscar avatar padrão se não fornecido
      if (!avatarId) {
        const avatars = await this.listAvatars()
        if (avatars.length > 0) {
          // Extrair o nome do avatar (pode estar em diferentes campos)
          avatarId = avatars[0].avatar_name || avatars[0].name || avatars[0].avatar_id || avatars[0].id
        }
      }

      // Criar instância do SDK
      console.log('🔵 Creating StreamingAvatar with token:', token ? token.substring(0, 20) + '...' : 'null')
      this.avatar = new StreamingAvatar({ token })

      // Configurar event listeners ANTES de criar a sessão se videoElement fornecido
      let streamReadyPromise = null
      if (videoElement) {
        this.videoElement = videoElement
        streamReadyPromise = this.setupEventListeners(videoElement, onDisconnectCallback)
      }

      // Criar e iniciar sessão
      // O SDK gerencia automaticamente a conexão LiveKit
      // O SDK aceita avatarName que deve ser o avatar_id (não o nome)
      console.log('🔵 Creating session with avatarId:', avatarId)
      console.log('🔵 🔍 Avatar ID Type:', typeof avatarId)
      console.log('🔵 🔍 Avatar ID Length:', avatarId?.length)
      console.log('🔵 🔍 Is UUID format?:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(avatarId))
      
      // Validar que temos um avatarId válido
      if (!avatarId) {
        throw new Error('Avatar ID is required. Please provide a valid avatar ID.')
      }
      
      // ⚠️ VALIDAÇÃO CRÍTICA: Rejeitar nome público, aceitar apenas UUID
      if (avatarId.includes('_public') || avatarId.includes('Casual') || avatarId.includes('Front')) {
        console.error('❌ NOME PÚBLICO DETECTADO! Rejeitando:', avatarId)
        console.error('❌ FORÇANDO UUID FALLBACK!')
        avatarId = '64b526e4-741c-43b6-a918-4e40f3261c7a'
        console.log('✅ Usando UUID Bryan:', avatarId)
      }
      
      const sessionConfig = {
        avatarName: avatarId, // Usar o ID do avatar diretamente
        quality: 'low', // Reduzido para 'low' para diminuir uso de banda e melhorar fluidez do áudio
      }
      console.log('🔵 Session config:', sessionConfig)
      
      // Adicionar knowledgeId se fornecido (para respostas inteligentes)
      if (knowledgeId) {
        sessionConfig.knowledgeId = knowledgeId
        console.log('🔵 Using knowledgeId for intelligent responses:', knowledgeId)
      }

      let sessionData
      try {
        console.log('🔵 Calling createStartAvatar with config:', sessionConfig)
        console.log('🔵 Calling createStartAvatar with config:', sessionConfig)
        sessionData = await this.avatar.createStartAvatar(sessionConfig)
        console.log('✅ createStartAvatar succeeded:', { 
          sessionId: sessionData?.session_id,
          hasSessionData: !!sessionData
        })
        console.log('✅ createStartAvatar succeeded:', { 
          sessionId: sessionData?.session_id,
          hasSessionData: !!sessionData
        })
      } catch (error) {
        // Log detalhado do erro para debug
        console.error('❌ Error creating avatar session:', {
          message: error.message,
          avatarId: avatarId,
          config: sessionConfig,
          error: error
        })
        
        // Se o erro for relacionado ao avatar, tentar verificar se existe
        if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
          console.error('❌ 400 Bad Request - Possible causes:')
          console.error('  1. Invalid avatar ID:', avatarId)
          console.error('  2. Avatar not available in your plan')
          console.error('  3. Avatar format incorrect')
          
          // Tentar listar avatares para verificar se o ID existe
          try {
            const avatars = await this.listAvatars()
            
            // Garantir que avatars é um array antes de usar .some()
            if (Array.isArray(avatars)) {
              const avatarExists = avatars.some(avatar => 
                avatar.id === avatarId || 
                avatar.avatar_id === avatarId ||
                avatar.avatar_name === avatarId
              )
              if (!avatarExists) {
                console.error('❌ Avatar ID not found in available avatars list')
                throw new Error(`Avatar ID "${avatarId}" not found. Please use a valid avatar ID from the available avatars.`)
              }
            } else {
              console.warn('⚠️ Could not verify avatar - listAvatars did not return an array')
            }
          } catch (listError) {
            console.error('⚠️ Could not verify avatar in list:', listError)
          }
        }
        
        throw error
      }

      this.sessionId = sessionData?.session_id || sessionData?.sessionId
      console.log('✅ Session created with SDK:', this.sessionId)

      // Aguardar o stream ficar pronto se listeners foram configurados
      // Mas não bloquear a conexão se o stream demorar
      if (streamReadyPromise) {
        console.log('⏳ Waiting for stream to be ready...')
        // Usar Promise.race com timeout, mas não rejeitar se timeout
        Promise.race([
          streamReadyPromise.then(() => {
            console.log('✅ Stream is ready!')
          }),
          new Promise((resolve) => {
            setTimeout(() => {
              console.log('⚠️ Stream setup taking longer than expected, continuing anyway...')
              resolve()
            }, 30000) // 30 segundos - tempo razoável
          })
        ]).catch((streamError) => {
          console.error('⚠️ Stream setup error (continuing anyway):', streamError)
          // Não rejeitar a sessão inteira se o stream não estiver pronto
          // O stream pode ficar pronto depois - marcar como conectado mesmo assim
        })
        // Não usar await aqui - deixar o stream inicializar em background
        // A sessão já foi criada, então podemos continuar
      }

      return sessionData
    } catch (error) {
      console.error('Error creating streaming session:', error)
      throw error
    }
  }

  /**
   * Conecta ao streaming do avatar e configura o elemento de vídeo
   * @param {string} sessionId - ID da sessão
   * @param {HTMLVideoElement} videoElement - Elemento de vídeo
   * @returns {Promise<void>}
   */
  async connectStreaming(sessionId, videoElement) {
    try {
      this.sessionId = sessionId
      this.videoElement = videoElement

      if (!this.avatar) {
        throw new Error('Avatar not initialized. Call createSession first.')
      }

      // Se os listeners ainda não foram configurados, configurar agora
      await this.setupEventListeners(videoElement)
      
    } catch (error) {
      console.error('Error connecting to streaming:', error)
      throw error
    }
  }

  /**
   * Envia texto para o avatar falar
   * @param {string} text - Texto para o avatar falar
   */
  async sendText(text) {
    console.log('🔵 sendText called with:', { text, hasAvatar: !!this.avatar, sessionId: this.sessionId })
    
    // Verificar se o avatar ainda está válido antes de tentar enviar
    if (!this.avatar) {
      console.error('❌ Avatar not initialized or disconnected')
      throw new Error('Session not initialized or disconnected. Please reconnect the avatar.')
    }

    if (!this.sessionId) {
      console.error('❌ Session ID not set')
      throw new Error('Session ID not set. Call createSession first.')
    }

    try {
      // Verificar se TaskType está disponível
      console.log('🔵 TaskType available:', { TaskType, TALK: TaskType?.TALK, REPEAT: TaskType?.REPEAT })
      
      // Usar TaskType.TALK (padrão) para respostas inteligentes ao invés de REPEAT
      // Conforme documentação: https://github.com/HeyGen-Official/StreamingAvatarSDK
      const speakParams = {
        text: text,
      }
      
      // Usar TALK (padrão) para respostas inteligentes, não REPEAT
      // Conforme documentação: task_type: TaskType.TALK (padrão) para respostas inteligentes
      // task_type: TaskType.REPEAT faz o avatar repetir o texto
      if (TaskType && TaskType.TALK !== undefined) {
        speakParams.task_type = TaskType.TALK // snake_case conforme documentação
      }
      
      // Adicionar TaskMode.SYNC se disponível (para modo síncrono)
      if (TaskMode && TaskMode.SYNC !== undefined) {
        speakParams.taskMode = TaskMode.SYNC
      }
      
      console.log('🔵 Calling avatar.speak with:', speakParams)
      const result = await this.avatar.speak(speakParams)
      console.log('✅ Text sent to avatar successfully:', text)
      console.log('✅ Speak result:', result)
      return result
    } catch (error) {
      console.error('❌ Error sending text:', error)
      console.error('❌ Error details:', { message: error.message, stack: error.stack, error })
      
      // Tentar sem parâmetros extras se a primeira tentativa falhou
      if (error.message?.includes('task') || error.message?.includes('Task')) {
        console.log('🔄 Retrying with default parameters (TALK mode)...')
        try {
          const result = await this.avatar.speak({ text: text })
          console.log('✅ Text sent to avatar successfully (default mode):', text)
          return result
        } catch (retryError) {
          console.error('❌ Retry also failed:', retryError)
          throw retryError
        }
      }
      
      throw error
    }
  }

  /**
   * Encerra a sessão de streaming
   */
  async disconnect() {
    try {
      if (this.avatar) {
        await this.avatar.stopAvatar()
        console.log('✅ Session stopped')
      }
    } catch (error) {
      console.error('Error stopping session:', error)
    }

    // Limpar token ao desconectar
    this.clearSessionToken()
    
    // Limpar estado
    this.avatar = null
    this.sessionId = null

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }

    this.avatar = null
    this.sessionId = null
  }
}
