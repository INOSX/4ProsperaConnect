import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useDataset } from '../../contexts/DatasetContext'
import { ClientService } from '../../services/clientService'
import { AudioRecorder } from '../../services/audioHandler'
import { HeyGenStreamingService } from '../../services/heygenStreamingService'
import { OpenAIAssistantApiService } from '../../services/openaiAssistantApiService'
import Card from '../ui/Card'
import { 
  X, 
  Minus, 
  DollarSign, 
  Mic, 
  Loader2, 
  Users 
} from 'lucide-react'

const FloatingSpecialist = () => {
  const { user } = useAuth()
  const { getSelectedFileName } = useDataset()
  const [isHidden, setIsHidden] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState('')
  const [audioRecorder, setAudioRecorder] = useState(null)
  const [streamingService] = useState(() => new HeyGenStreamingService())
  const [openaiAssistant, setOpenaiAssistant] = useState(null)
  const [avatarConnected, setAvatarConnected] = useState(false)
  const avatarConnectedRef = useRef(false)
  const openaiAssistantRef = useRef(null)
  const videoRef = useRef(null)
  const isReconnectingRef = useRef(false)

  // Sincronizar refs com state
  useEffect(() => {
    avatarConnectedRef.current = avatarConnected
  }, [avatarConnected])
  
  useEffect(() => {
    openaiAssistantRef.current = openaiAssistant
  }, [openaiAssistant])

  // Inicializar AudioRecorder
  useEffect(() => {
    if (!audioRecorder) {
      const recorder = new AudioRecorder(
        (status) => {
          setRecordingStatus(status)
        },
        async (text) => {
          console.log('🔵 ==========================================')
          console.log('🔵 onTranscriptionComplete CALLED in FloatingSpecialist')
          console.log('🔵 Received text:', text)
          
          const isConnected = avatarConnectedRef.current
          console.log('🔵 Avatar connected status:', isConnected)
          
          if (!isConnected) {
            console.warn('⚠️ Avatar not connected, skipping sendText')
            setRecordingStatus('Especialista não conectado. Clique em "Conectar" primeiro.')
            setTimeout(() => setRecordingStatus(''), 3000)
            return
          }
          
          try {
            let responseText = text
            
            // Se OpenAI Assistant estiver disponível, obter resposta inteligente
            const assistant = openaiAssistantRef.current
            
            if (assistant && assistant.isInitialized()) {
              setRecordingStatus('Obtendo resposta da IA...')
              try {
                const fileName = getSelectedFileName()
                
                // Buscar contexto de empresa/colaborador
                let companyId = null
                let employeeId = null
                let contextType = null
                
                try {
                  const clientResult = await ClientService.getClientByUserId(user.id)
                  if (clientResult.success && clientResult.client) {
                    if (clientResult.client.company_id) {
                      companyId = clientResult.client.company_id
                      contextType = 'company'
                    }
                    if (clientResult.client.user_type === 'employee') {
                      const { EmployeeService } = await import('../../services/employeeService')
                      const empResult = await EmployeeService.getEmployeeByUserId(user.id)
                      if (empResult.success && empResult.employee) {
                        employeeId = empResult.employee.id
                        companyId = empResult.employee.company_id
                        contextType = 'employee'
                      }
                    }
                  }
                } catch (ctxError) {
                  console.warn('⚠️ Error loading context:', ctxError)
                }
                
                // Detectar contexto de prospecção
                let prospectingContext = null
                try {
                  const currentPath = window.location.pathname
                  if (currentPath.startsWith('/prospecting')) {
                    const { ProspectingContextService } = await import('../../services/ProspectingContextService.js')
                    const prospectId = currentPath.match(/\/prospecting\/([^\/]+)/)?.[1]
                    const pageType = currentPath.includes('/list') ? 'list' : 
                                    prospectId ? 'detail' : 'dashboard'
                    prospectingContext = await ProspectingContextService.getProspectingContext(
                      user.id,
                      pageType,
                      prospectId
                    )
                  }
                } catch (ctxError) {
                  console.warn('⚠️ Error loading prospecting context:', ctxError)
                }
                
                responseText = await assistant.getResponse(text, fileName, companyId, employeeId, contextType, prospectingContext)
                console.log('✅ OpenAI Assistant response received:', responseText)
              } catch (error) {
                console.error('❌ Error getting OpenAI response:', error)
                responseText = text
              }
            }
            
            // Enviar resposta para o avatar falar
            setRecordingStatus('Enviando para especialista...')
            
            try {
              const result = await streamingService.sendText(responseText)
              console.log('✅ Text sent successfully to avatar!')
              setRecordingStatus('Especialista respondendo...')
              setTimeout(() => setRecordingStatus(''), 3000)
            } catch (sendError) {
              if (sendError.message?.includes('400') || 
                  sendError.message?.includes('401') ||
                  sendError.message?.includes('disconnected') || 
                  sendError.message?.includes('not initialized')) {
                console.warn('⚠️ Session error detected, attempting to reconnect...')
                setAvatarConnected(false)
                setRecordingStatus('Reconectando especialista...')
                
                if (!isReconnectingRef.current && videoRef.current) {
                  isReconnectingRef.current = true
                  
                  const reconnectWithRetry = async (attempt = 1, maxAttempts = 3) => {
                    try {
                      streamingService.clearSessionToken()
                      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
                      if (attempt > 1) {
                        await new Promise(resolve => setTimeout(resolve, delay))
                      }
                      
                      await initializeAvatar(true)
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      
                      const retryResult = await streamingService.sendText(responseText)
                      console.log('✅ Text sent successfully after reconnection!')
                      setRecordingStatus('Especialista respondendo...')
                      setTimeout(() => setRecordingStatus(''), 3000)
                      isReconnectingRef.current = false
                    } catch (reconnectError) {
                      console.error(`❌ Reconnection attempt ${attempt} failed:`, reconnectError)
                      
                      if (attempt < maxAttempts) {
                        return reconnectWithRetry(attempt + 1, maxAttempts)
                      } else {
                        console.error('❌ All reconnection attempts failed')
                        setRecordingStatus('Erro ao reconectar. Tente novamente.')
                        setTimeout(() => setRecordingStatus(''), 5000)
                        isReconnectingRef.current = false
                      }
                    }
                  }
                  
                  reconnectWithRetry()
                } else {
                  setRecordingStatus('Erro: Especialista desconectado. Aguarde reconexão...')
                  setTimeout(() => setRecordingStatus(''), 5000)
                }
              } else {
                console.error('❌ Error sending text:', sendError)
                setRecordingStatus('Erro: ' + sendError.message)
                setTimeout(() => setRecordingStatus(''), 5000)
              }
            }
          } catch (error) {
            console.error('❌ Error in onTranscriptionComplete:', error)
            setRecordingStatus('Erro: ' + error.message)
            setTimeout(() => setRecordingStatus(''), 5000)
          }
        },
        {
          continuous: false,
          autoStopOnSilence: false,
        }
      )
      setAudioRecorder(recorder)
      console.log('✅ AudioRecorder initialized')
    }
  }, [audioRecorder, streamingService, user, getSelectedFileName])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (avatarConnected) {
        streamingService.disconnect()
      }
    }
  }, [avatarConnected, streamingService])

  // Função para inicializar o avatar
  const initializeAvatar = async (forceNewToken = false) => {
    if (!videoRef.current) return
    
    if (avatarConnected && !forceNewToken) {
      return
    }
    
    if (forceNewToken && avatarConnected) {
      console.log('🔄 Force reconnection: disconnecting current session...')
      try {
        streamingService.disconnect()
      } catch (e) {
        console.warn('⚠️ Error disconnecting:', e)
      }
      setAvatarConnected(false)
      streamingService.clearSessionToken()
    }

    try {
      setRecordingStatus('Conectando especialista...')
      
      // Inicializar OpenAI Assistant primeiro
      if (!openaiAssistant) {
        try {
          setRecordingStatus('Inicializando assistente OpenAI...')
          
          if (!user) {
            throw new Error('Usuário não autenticado')
          }
          
          const clientResult = await ClientService.getClientByUserId(user.id)
          if (!clientResult.success || !clientResult.client) {
            throw new Error('Cliente não encontrado. Por favor, faça logout e login novamente.')
          }
          
          const client = clientResult.client
          const assistantId = client.openai_assistant_id
          
          if (!assistantId) {
            throw new Error('Assistant não configurado para este cliente.')
          }
          
          const assistant = new OpenAIAssistantApiService(assistantId)
          await assistant.initialize()
          setOpenaiAssistant(assistant)
          console.log('✅ OpenAI Assistant initialized via API route')
        } catch (error) {
          console.error('❌ Error initializing OpenAI Assistant:', error)
          setRecordingStatus('Erro ao inicializar assistente. Especialista funcionará sem IA.')
        }
      }
      
      // Buscar avatar Dexter
      let dexterAvatarId = null
      try {
        const avatars = await streamingService.listAvatars()
        
        if (!Array.isArray(avatars)) {
          throw new Error('listAvatars did not return an array')
        }
        
        const dexterAvatar = avatars.find(avatar => 
          avatar.name === 'Dexter' || 
          avatar.avatar_name === 'Dexter' ||
          avatar.id === '1732323365' ||
          avatar.id === 'Dexter_Casual_Front_public' ||
          avatar.id === 'Dexter_Lawyer_Sitting_public' ||
          avatar.avatar_name === 'Dexter_Lawyer_Sitting_public' ||
          avatar.name === 'Dexter_Lawyer_Sitting_public'
        )
        if (dexterAvatar) {
          dexterAvatarId = dexterAvatar.id || dexterAvatar.avatar_id || dexterAvatar.avatar_name || 'Dexter_Lawyer_Sitting_public'
          console.log('🔵 Found Dexter avatar:', { id: dexterAvatarId, name: dexterAvatar.name || dexterAvatar.avatar_name })
        } else {
          dexterAvatarId = 'Dexter_Lawyer_Sitting_public'
          console.log('⚠️ Dexter avatar not found in list, using fallback:', dexterAvatarId)
        }
      } catch (error) {
        console.warn('⚠️ Error listing avatars, using fallback:', error)
        dexterAvatarId = 'Dexter_Lawyer_Sitting_public'
      }
      
      // Callback para quando o avatar desconectar
      const handleDisconnect = () => {
        console.log('⚠️ Avatar disconnected, updating state...')
        setAvatarConnected(false)
        streamingService.clearSessionToken()
        
        if (isReconnectingRef.current) {
          console.log('⚠️ Reconnection already in progress, skipping...')
          return
        }
        
        setRecordingStatus('Especialista desconectado. Reconectando...')
        setTimeout(() => {
          if (videoRef.current && !avatarConnectedRef.current && !isReconnectingRef.current) {
            isReconnectingRef.current = true
            console.log('🔄 Attempting to reconnect avatar...')
            initializeAvatar(true)
              .then(() => {
                isReconnectingRef.current = false
                setRecordingStatus('Especialista reconectado!')
                setTimeout(() => setRecordingStatus(''), 2000)
              })
              .catch(err => {
                isReconnectingRef.current = false
                console.error('❌ Failed to reconnect avatar:', err)
                setRecordingStatus('Erro ao reconectar. Tente novamente.')
                setTimeout(() => setRecordingStatus(''), 3000)
              })
          }
        }, 2000)
      }
      
      const sessionData = await streamingService.createSession(dexterAvatarId, videoRef.current, null, handleDisconnect, forceNewToken)
      setAvatarConnected(true)
      isReconnectingRef.current = false
      try {
        videoRef.current.muted = false
        videoRef.current.volume = 1.0
        await videoRef.current.play().catch(() => {})
      } catch (_) {}
      setRecordingStatus('Especialista conectado!')
      setTimeout(() => setRecordingStatus(''), 2000)
    } catch (error) {
      console.error('Error connecting avatar:', error)
      setRecordingStatus('Erro ao conectar: ' + error.message)
      setTimeout(() => setRecordingStatus(''), 3000)
    }
  }

  const toggleRecording = async () => {
    if (!audioRecorder) return

    if (!avatarConnected) {
      await initializeAvatar()
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (!isRecording) {
      setIsRecording(true)
      await audioRecorder.startRecording()
    } else {
      setIsRecording(false)
      audioRecorder.stopRecording(true)
    }
  }

  if (isHidden) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="relative overflow-hidden group shadow-2xl" padding="none">
        {/* Botões no canto superior direito (estilo Windows) */}
        <div className="absolute top-0 right-0 z-10 flex items-center bg-white rounded-bl-lg border-l border-b border-gray-200 shadow-sm">
          {/* Ícone do KPI */}
          <div className="h-5 w-5 bg-gradient-primary rounded-sm flex items-center justify-center mr-0.5">
            <DollarSign className="h-3 w-3 text-white" />
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsHidden(true)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Conteúdo do card */}
        <div className="p-4 pr-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 pr-16">Especialista</p>
            {!isMinimized && (
              <div className="mt-2 space-y-2">
                {/* Vídeo do avatar ao vivo */}
                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '280px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!avatarConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                      <Users className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Especialista não conectado</p>
                      <p className="text-xs text-gray-400 mt-1">Clique em "Conectar" para iniciar</p>
                    </div>
                  )}
                </div>
                
                {/* Botão de gravação */}
                <button
                  onClick={toggleRecording}
                  disabled={!audioRecorder}
                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !avatarConnected
                      ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      : isRecording
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {!avatarConnected ? (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Conectar</span>
                    </>
                  ) : isRecording ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Parar Gravação</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Enviar Áudio</span>
                    </>
                  )}
                </button>
                {recordingStatus && (
                  <p className="text-xs text-gray-600 text-center">{recordingStatus}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default FloatingSpecialist

