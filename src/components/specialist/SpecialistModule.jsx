import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useDataset } from '../../contexts/DatasetContext'
import { ClientService } from '../../services/clientService'
import { AudioRecorder } from '../../services/audioHandler'
import { HeyGenStreamingService } from '../../services/heygenStreamingService'
import { OpenAIAssistantApiService } from '../../services/openaiAssistantApiService'
import BMADOrchestrator from '../../services/bmad/bmadOrchestrator'
import Card from '../ui/Card'
import DataVisualizationArea from './DataVisualizationArea'
import VoiceCommandHistory from './VoiceCommandHistory'
import { 
  Mic, 
  Loader2, 
  Users,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'

const SpecialistModule = () => {
  const { user } = useAuth()
  const { getSelectedFileName } = useDataset()
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
  const [visualizations, setVisualizations] = useState([])
  const [commandHistory, setCommandHistory] = useState([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [bmadOrchestrator] = useState(() => new BMADOrchestrator())

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
          console.log('🔵 Transcription received:', text)
          
          const isConnected = avatarConnectedRef.current
          
          if (!isConnected) {
            console.warn('⚠️ Avatar not connected, skipping sendText')
            setRecordingStatus('Especialista não conectado. Clique em "Conectar" primeiro.')
            setTimeout(() => setRecordingStatus(''), 3000)
            return
          }
          
          try {
            // Adicionar comando ao histórico
            setCommandHistory(prev => [...prev, {
              id: Date.now(),
              type: 'command',
              text,
              timestamp: new Date()
            }])

            setRecordingStatus('Processando comando com BMAD...')
            
            // Processar comando através do BMAD Orchestrator
            console.log('[SpecialistModule] Processing command:', text)
            const result = await bmadOrchestrator.processCommand(text, user, {
              pageContext: {
                pathname: window.location.pathname
              }
            })

            console.log('[SpecialistModule] Command result:', { 
              success: result?.success, 
              hasResponse: !!result?.response, 
              error: result?.error,
              hasVisualizations: !!result?.visualizations?.length
            })

            let responseText = text

            if (result.success) {
              responseText = result.response || 'Comando executado com sucesso!'
              console.log('[SpecialistModule] Success response:', responseText)
              
              // Atualizar visualizações se houver
              if (result.visualizations && result.visualizations.length > 0) {
                console.log('[SpecialistModule] Setting visualizations:', result.visualizations.length)
                setVisualizations(result.visualizations)
              }

              // Adicionar sugestões ao histórico se houver
              if (result.suggestions && result.suggestions.length > 0) {
                console.log('💡 Sugestões:', result.suggestions)
              }
            } else {
              responseText = result.error || 'Erro ao processar comando'
              console.error('[SpecialistModule] Command failed:', { 
                error: result.error, 
                details: result.details,
                stack: result.stack 
              })
            }
            
            // Enviar resposta para o avatar falar
            setRecordingStatus('Enviando para especialista...')
            
            try {
              const sendResult = await streamingService.sendText(responseText)
              console.log('✅ Text sent successfully to avatar!')
              setRecordingStatus('Especialista respondendo...')
              
              // Adicionar resposta ao histórico
              setCommandHistory(prev => [...prev, {
                id: Date.now() + 1,
                type: 'response',
                text: responseText,
                timestamp: new Date()
              }])
              
              setTimeout(() => setRecordingStatus(''), 3000)
            } catch (sendError) {
              console.error('❌ Error sending text:', sendError)
              setRecordingStatus('Erro: ' + sendError.message)
              setTimeout(() => setRecordingStatus(''), 5000)
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
        const avatarsResult = await streamingService.listAvatars()
        
        // O listAvatars pode retornar um array diretamente ou um objeto com avatars
        let avatars = []
        if (Array.isArray(avatarsResult)) {
          avatars = avatarsResult
        } else if (avatarsResult && typeof avatarsResult === 'object') {
          // Se for objeto, tentar extrair o array de avatars
          avatars = avatarsResult.avatars || avatarsResult.data || []
        }
        
        if (avatars.length > 0) {
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
        } else {
          dexterAvatarId = 'Dexter_Lawyer_Sitting_public'
          console.log('⚠️ No avatars returned, using fallback:', dexterAvatarId)
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
      
      // Marcar como conectado mesmo se o stream ainda não estiver pronto
      // O stream pode inicializar em background
      setAvatarConnected(true)
      isReconnectingRef.current = false
      
      // Tentar configurar o vídeo
      try {
        if (videoRef.current) {
          videoRef.current.muted = false
          videoRef.current.volume = 1.0
          // Aguardar um pouco para o stream estar disponível
          setTimeout(async () => {
            try {
              if (videoRef.current && streamingService.avatar?.mediaStream) {
                videoRef.current.srcObject = streamingService.avatar.mediaStream
                await videoRef.current.play()
                console.log('✅ Video started playing')
              }
            } catch (err) {
              console.warn('⚠️ Video play error (will retry):', err)
            }
          }, 2000)
        }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-tour-id="specialist-panel">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Especialista</h1>
              <p className="text-gray-600 mt-1">Consultoria inteligente por voz com IA avançada</p>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isMinimized ? 'Expandir' : 'Minimizar'}
              data-tour-id="specialist-expand-button"
            >
              {isMinimized ? (
                <Maximize2 className="h-5 w-5 text-gray-600" />
              ) : (
                <Minimize2 className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {!isMinimized && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Área do Avatar */}
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Especialista</h2>
                  <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '280px' }} data-tour-id="specialist-video">
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
                    onClick={!avatarConnected ? () => initializeAvatar() : toggleRecording}
                    disabled={!audioRecorder}
                    data-tour-id={!avatarConnected ? "specialist-connect-button" : "specialist-microphone-button"}
                    className={`w-full mt-4 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    <p className="text-xs text-gray-600 text-center mt-2">{recordingStatus}</p>
                  )}
                </Card>
              </div>

              {/* Área de Visualização de Dados */}
              <div className="lg:col-span-2" data-tour-id="specialist-visualizations">
                <DataVisualizationArea visualizations={visualizations} />
              </div>
            </div>
          )}

          {/* Histórico de Comandos */}
          {!isMinimized && (
            <div className="mt-6" data-tour-id="specialist-history">
              <VoiceCommandHistory history={commandHistory} />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default SpecialistModule

