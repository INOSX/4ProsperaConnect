import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useDataset } from '../../contexts/DatasetContext'
import { ClientService } from '../../services/clientService'
import { AudioRecorder } from '../../services/audioHandler'
import { HeyGenStreamingService } from '../../services/heygenStreamingService'
import { OpenAIAssistantApiService } from '../../services/openaiAssistantApiService'
import NEXOrchestrator from '../../services/bmad/bmadOrchestrator'
import Card from '../ui/Card'
import DataVisualizationArea from './DataVisualizationArea'
import VoiceCommandHistory from './VoiceCommandHistory'
import FloatingDataCards from './FloatingDataCards'
import FloatingChart from './FloatingChart'
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
  const [isConnecting, setIsConnecting] = useState(false)
  const avatarConnectedRef = useRef(false)
  const openaiAssistantRef = useRef(null)
  const videoRef = useRef(null)
  const isReconnectingRef = useRef(false)
  const [visualizations, setVisualizations] = useState([])
  const [commandHistory, setCommandHistory] = useState([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [nexOrchestrator] = useState(() => new NEXOrchestrator())

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
          
          // Permitir teste sem avatar em modo de desenvolvimento
          const allowTestWithoutAvatar = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
          
          if (!isConnected && !allowTestWithoutAvatar) {
            console.warn('⚠️ Especialista não conectado, pulando envio de texto')
            setRecordingStatus('Especialista não conectado. Clique em "Conectar" primeiro.')
            setTimeout(() => setRecordingStatus(''), 3000)
            return
          }
          
          if (!isConnected && allowTestWithoutAvatar) {
            console.log('🔧 Modo de teste: processando sem avatar')
          }
          
          try {
            // Adicionar comando ao histórico
            setCommandHistory(prev => [...prev, {
              id: Date.now(),
              type: 'command',
              text,
              timestamp: new Date()
            }])

            setRecordingStatus('Processando comando com NEX...')
            
            // Processar comando através do NEX Orchestrator
            console.log('[SpecialistModule] Processing command:', text)
            const result = await nexOrchestrator.processCommand(text, user, {
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
            
            // Enviar resposta para o especialista falar
            setRecordingStatus('Enviando para especialista...')
            
            try {
              const sendResult = await streamingService.sendText(responseText)
              console.log('✅ Texto enviado com sucesso para o especialista!')
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

  // Função para inicializar o especialista
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
      setIsConnecting(true)
      setRecordingStatus('Conectando especialista...')
      
      // Inicializar assistente primeiro
      if (!openaiAssistant) {
        try {
          setRecordingStatus('Inicializando assistente...')
          
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
            throw new Error('Assistente não configurado para este cliente.')
          }
          
          const assistant = new OpenAIAssistantApiService(assistantId)
          await assistant.initialize()
          setOpenaiAssistant(assistant)
          console.log('✅ Assistente inicializado via API route')
        } catch (error) {
          console.error('❌ Erro ao inicializar assistente:', error)
          setRecordingStatus('Erro ao inicializar assistente. Especialista funcionará sem IA.')
        }
      }
      
      // Buscar especialista
      let bryanAvatarId = null
      try {
        const avatarsResult = await streamingService.listAvatars()
        
        // O listAvatars pode retornar um array diretamente ou um objeto
        let avatars = []
        if (Array.isArray(avatarsResult)) {
          avatars = avatarsResult
        } else if (avatarsResult && typeof avatarsResult === 'object') {
          // Se for objeto, tentar extrair o array
          avatars = avatarsResult.avatars || avatarsResult.data || []
        }
        
        if (avatars.length > 0) {
          // PRIORIDADE 1: Buscar pelo UUID específico do Bryan
          const bryanByUUID = avatars.find(avatar => 
            avatar.id === '64b526e4-741c-43b6-a918-4e40f3261c7a' ||
            avatar.avatar_id === '64b526e4-741c-43b6-a918-4e40f3261c7a'
          )
          
          if (bryanByUUID) {
            // IMPORTANTE: avatar_id é o UUID, id pode ser o nome público
            bryanAvatarId = bryanByUUID.avatar_id || bryanByUUID.id || '64b526e4-741c-43b6-a918-4e40f3261c7a'
            console.log('🔵 ✅ Bryan encontrado por UUID:', { id: bryanAvatarId, name: bryanByUUID.name || bryanByUUID.avatar_name })
            console.log('🔵 🎯 Avatar ID que será usado:', bryanAvatarId)
          } else {
            // PRIORIDADE 2: Procurar pelo nome Bryan
            const bryanAvatar = avatars.find(avatar => 
              avatar.name === 'Bryan' || 
              avatar.avatar_name === 'Bryan' ||
              avatar.name?.includes('Bryan') ||
              avatar.avatar_name?.includes('Bryan') ||
              avatar.id === 'Bryan_Businessman_Public' ||
              avatar.id === 'Bryan_Tech_Expert' ||
              avatar.avatar_name === 'Bryan_Businessman_Public' ||
              avatar.name === 'Bryan_Businessman_Public'
            )
            
            if (bryanAvatar) {
              // IMPORTANTE: avatar_id é o UUID, id pode ser o nome público
              bryanAvatarId = bryanAvatar.avatar_id || bryanAvatar.id || '64b526e4-741c-43b6-a918-4e40f3261c7a'
              console.log('🔵 Bryan encontrado por nome:', { id: bryanAvatarId, name: bryanAvatar.name || bryanAvatar.avatar_name })
              console.log('🔵 🎯 Avatar ID que será usado:', bryanAvatarId)
              console.log('🔵 🔍 Detalhes do avatar:', { 
                'avatar.id': bryanAvatar.id, 
                'avatar.avatar_id': bryanAvatar.avatar_id,
                'SELECIONADO': bryanAvatarId
              })
            } else {
              // FALLBACK: Usar UUID diretamente
              bryanAvatarId = '64b526e4-741c-43b6-a918-4e40f3261c7a'
              console.log('⚠️ Bryan não encontrado, usando UUID direto:', bryanAvatarId)
            }
          }
        } else {
          // Sem avatares na lista, usar UUID direto
          bryanAvatarId = '64b526e4-741c-43b6-a918-4e40f3261c7a'
          console.log('⚠️ Nenhum avatar retornado, usando UUID Bryan direto:', bryanAvatarId)
        }
      } catch (error) {
        console.warn('⚠️ Erro ao listar especialistas, usando UUID Bryan direto:', error)
        bryanAvatarId = '64b526e4-741c-43b6-a918-4e40f3261c7a'
      }
      
      // Callback para quando o especialista desconectar
      const handleDisconnect = () => {
        console.log('⚠️ Especialista desconectado, atualizando estado...')
        setAvatarConnected(false)
        streamingService.clearSessionToken()
        
        if (isReconnectingRef.current) {
          console.log('⚠️ Reconexão já em progresso, pulando...')
          return
        }
        
        setRecordingStatus('Especialista desconectado. Reconectando...')
        setTimeout(() => {
          if (videoRef.current && !avatarConnectedRef.current && !isReconnectingRef.current) {
            isReconnectingRef.current = true
            console.log('🔄 Tentando reconectar especialista...')
            initializeAvatar(true)
              .then(() => {
                isReconnectingRef.current = false
                setRecordingStatus('Especialista reconectado!')
                setTimeout(() => setRecordingStatus(''), 2000)
              })
              .catch(err => {
                isReconnectingRef.current = false
                console.error('❌ Falha ao reconectar especialista:', err)
                setRecordingStatus('Erro ao reconectar. Tente novamente.')
                setTimeout(() => setRecordingStatus(''), 3000)
              })
          }
        }, 2000)
      }
      
      const sessionData = await streamingService.createSession(bryanAvatarId, videoRef.current, null, handleDisconnect, forceNewToken)
      
      // Marcar como conectado mesmo se o stream ainda não estiver pronto
      // O stream pode inicializar em background
      setAvatarConnected(true)
      setIsConnecting(false)
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
      console.error('Erro ao conectar especialista:', error)
      setIsConnecting(false)
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
            <div className="space-y-6">
              {/* Área do Avatar - FULLSCREEN com Cards Flutuantes */}
              <div className="w-full">
                <Card className="p-0 overflow-hidden">
                  <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '800px' }} data-tour-id="specialist-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {isConnecting && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                        <Loader2 className="h-16 w-16 text-white mb-4 animate-spin" />
                        <p className="text-lg text-white font-medium">Conectando especialista...</p>
                        <p className="text-sm text-white/70 mt-2">Aguarde um momento</p>
                      </div>
                    )}
                    {!avatarConnected && !isConnecting && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <Users className="h-16 w-16 text-white/60 mb-4" />
                        <p className="text-lg text-white font-medium">Especialista não conectado</p>
                        <p className="text-sm text-white/70 mt-2">Clique em "Conectar" para iniciar</p>
                      </div>
                    )}
                    
                    {/* Floating Data Cards - Renderiza sobre o avatar */}
                    {(() => {
                      console.log('[SpecialistModule] 🎴 ========== DEBUG FLOATING CARDS RENDER ==========')
                      console.log('[SpecialistModule] 🎴 visualizations existe?', !!visualizations)
                      console.log('[SpecialistModule] 🎴 visualizations.length:', visualizations?.length || 0)
                      console.log('[SpecialistModule] 🎴 visualizations:', visualizations)
                      if (visualizations && visualizations.length > 0) {
                        console.log('[SpecialistModule] 🎴 visualizations[0].type:', visualizations[0].type)
                        console.log('[SpecialistModule] 🎴 visualizations[0].data length:', visualizations[0].data?.length || 0)
                        console.log('[SpecialistModule] 🎴 Condição floating-cards atendida?', visualizations[0].type === 'floating-cards')
                        console.log('[SpecialistModule] 🎴 Condição chart atendida?', visualizations[0].type === 'chart')
                      }
                      return null
                    })()}
                    
                    {/* Renderizar Floating Cards */}
                    {visualizations && visualizations.length > 0 && visualizations[0].type === 'floating-cards' && (
                      <>
                        {console.log('[SpecialistModule] 🎴 ✅ ✅ ✅ RENDERIZANDO FLOATING CARDS! ✅ ✅ ✅')}
                        <FloatingDataCards 
                          data={visualizations[0].data} 
                          type={visualizations[0].config?.dataType || 'companies'}
                        />
                      </>
                    )}
                    
                    {/* Renderizar Floating Chart */}
                    {visualizations && visualizations.length > 0 && visualizations[0].type === 'chart' && (
                      <>
                        {console.log('[SpecialistModule] 📊 ✅ ✅ ✅ RENDERIZANDO FLOATING CHART! ✅ ✅ ✅')}
                        <FloatingChart 
                          data={visualizations[0].data} 
                          config={visualizations[0].config}
                        />
                      </>
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

              {/* Histórico de Comandos ABAIXO do Avatar */}
              <div className="w-full" data-tour-id="specialist-history">
                <VoiceCommandHistory history={commandHistory} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default SpecialistModule

