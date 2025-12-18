import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useDataset } from '../../contexts/DatasetContext'
import { ClientService } from '../../services/clientService'
import { OpenAIService } from '../../services/openaiService'
import { supabase } from '../../services/supabase'
import { parseCSVString, detectColumnTypes, generateDataStats, cleanData, parseExcelFromArrayBuffer, base64ToUint8Array } from '../../services/dataParser'
import { 
  BarChart3, 
  Upload, 
  FileText, 
  Settings, 
  HelpCircle,
  TrendingUp,
  X,
  Minus,
  DollarSign,
  Mic,
  Loader2,
  Target,
  Building2,
  Users,
  Database
} from 'lucide-react'
import Card from '../ui/Card'
import { AudioRecorder } from '../../services/audioHandler'
import { HeyGenStreamingService } from '../../services/heygenStreamingService'
import { OpenAIAssistantApiService } from '../../services/openaiAssistantApiService'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { getSelectedFileName } = useDataset()
  const [vectorFiles, setVectorFiles] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [error, setError] = useState(null)
  const [selectKey, setSelectKey] = useState(0)
  const [refreshTick, setRefreshTick] = useState(0)
  const [sidebarKpiHidden, setSidebarKpiHidden] = useState(false)
  const [sidebarKpiMinimized, setSidebarKpiMinimized] = useState(false)
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

  useEffect(() => {
    let mounted = true
    async function loadFiles() {
      if (!user) return
      setLoadingFiles(true)
      setError(null)
      try {
        const cr = await ClientService.getClientByUserId(user.id)
        if (!cr.success) throw new Error('Cliente não encontrado')
        const bucket = String(cr.client.id)
        // Listar DIRETAMENTE os arquivos do Supabase Storage do cliente (bucket por usuário)
        const { data: storageEntries, error: stErr } = await supabase.storage.from(bucket).list('')
        if (stErr) throw stErr
        let items = (storageEntries || [])
          .filter(e => !!e.name && (e.name.endsWith('.csv') || e.name.endsWith('.xlsx') || e.name.endsWith('.xls')))
          .map(e => ({ id: e.name, name: e.name }))

        if (!mounted) return
        setVectorFiles(items)
        setSelectKey(prev => prev + 1)
      } catch (e) {
        if (!mounted) return
        setError(e.message)
        setVectorFiles([])
        setSelectKey(prev => prev + 1)
      } finally {
        if (mounted) setLoadingFiles(false)
      }
    }
    loadFiles()
    return () => { mounted = false }
  }, [user, refreshTick])

  // Recarregar quando o upload concluir
  useEffect(() => {
    const onUpdated = () => setRefreshTick(t => t + 1)
    window.addEventListener('storage-updated', onUpdated)
    return () => window.removeEventListener('storage-updated', onUpdated)
  }, [])

  // Inicializar AudioRecorder (apenas uma vez, não recriar quando avatarConnected mudar)
  useEffect(() => {
    if (!audioRecorder) {
      const recorder = new AudioRecorder(
        (status) => {
          setRecordingStatus(status)
        },
        async (text) => {
          // Quando a transcrição for concluída, enviar texto para OpenAI primeiro, depois para o avatar
          console.log('🔵 ==========================================')
          console.log('🔵 onTranscriptionComplete CALLED in Sidebar')
          console.log('🔵 Received text:', text)
          console.log('🔵 Text type:', typeof text)
          console.log('🔵 Text length:', text?.length)
          
          const isConnected = avatarConnectedRef.current
          console.log('🔵 Avatar connected status:', isConnected)
          console.log('🔵 Avatar connected ref:', avatarConnectedRef.current)
          console.log('🔵 Streaming service exists?', !!streamingService)
          console.log('🔵 ==========================================')
          
          if (!isConnected) {
            console.warn('⚠️ Avatar not connected, skipping sendText')
            setRecordingStatus('Avatar não conectado. Clique em "Enviar Áudio" primeiro.')
            setTimeout(() => setRecordingStatus(''), 3000)
            return
          }
          
          try {
            let responseText = text
            
            // Se OpenAI Assistant estiver disponível, obter resposta inteligente
            const assistant = openaiAssistantRef.current
            console.log('🔵 OpenAI Assistant check:', {
              hasAssistant: !!assistant,
              isInitialized: assistant?.isInitialized?.()
            })
            
            if (assistant && assistant.isInitialized()) {
              setRecordingStatus('Obtendo resposta da IA...')
              try {
                // Obter nome do arquivo selecionado do contexto
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
                    // Verificar se é colaborador
                    if (clientResult.client.user_type === 'employee') {
                      // Buscar employee_id pelo user_id
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
                  // Continuar sem contexto
                }
                
                console.log('🔵 Getting response from OpenAI Assistant...')
                console.log('🔵 Input text:', text)
                console.log('🔵 Selected file:', fileName)
                console.log('🔵 Context:', { companyId, employeeId, contextType })
                
                // Detectar contexto de prospecção
                let prospectingContext = null
                try {
                  const { useLocation } = await import('react-router-dom')
                  // Usar window.location como fallback já que não podemos usar hooks aqui
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
                    console.log('🔵 Prospecting context loaded:', prospectingContext)
                  }
                } catch (ctxError) {
                  console.warn('⚠️ Error loading prospecting context:', ctxError)
                }
                
                // Passar o nome do arquivo e contexto para o assistente
                responseText = await assistant.getResponse(text, fileName, companyId, employeeId, contextType, prospectingContext)
                console.log('✅ OpenAI Assistant response received:', responseText)
                console.log('✅ Response type:', typeof responseText)
                console.log('✅ Response length:', responseText?.length)
              } catch (error) {
                console.error('❌ Error getting OpenAI response:', error)
                console.error('❌ Error message:', error.message)
                console.error('❌ Error stack:', error.stack)
                // Se falhar, usar o texto original
                responseText = text
                console.log('⚠️ Using original text as fallback:', responseText)
              }
            } else {
              console.log('⚠️ OpenAI Assistant not available, avatar will speak the transcribed text')
            }
            
            // Enviar resposta para o avatar falar
            setRecordingStatus('Enviando para avatar...')
            console.log('🔵 About to call streamingService.sendText')
            console.log('🔵 Text to send:', responseText)
            console.log('🔵 Streaming service:', streamingService)
            console.log('🔵 sendText method exists?', typeof streamingService.sendText === 'function')
            
            try {
              const result = await streamingService.sendText(responseText)
              console.log('✅ Text sent successfully to avatar!')
              console.log('✅ Result from sendText:', result)
              setRecordingStatus('Avatar respondendo...')
              setTimeout(() => setRecordingStatus(''), 3000)
            } catch (sendError) {
              // Se o erro for de sessão desconectada (400 ou sessão inválida), tentar reconectar
              if (sendError.message?.includes('400') || 
                  sendError.message?.includes('disconnected') || 
                  sendError.message?.includes('not initialized')) {
                console.warn('⚠️ Session error detected, attempting to reconnect...')
                setAvatarConnected(false)
                setRecordingStatus('Reconectando avatar...')
                
                // Tentar reconectar
                if (!isReconnectingRef.current && videoRef.current) {
                  isReconnectingRef.current = true
                  try {
                    await initializeAvatar()
                    // Após reconectar, tentar enviar o texto novamente
                    const retryResult = await streamingService.sendText(responseText)
                    console.log('✅ Text sent successfully after reconnection!')
                    setRecordingStatus('Avatar respondendo...')
                    setTimeout(() => setRecordingStatus(''), 3000)
                  } catch (reconnectError) {
                    console.error('❌ Failed to reconnect and send text:', reconnectError)
                    setRecordingStatus('Erro ao reconectar. Tente novamente.')
                    setTimeout(() => setRecordingStatus(''), 5000)
                  } finally {
                    isReconnectingRef.current = false
                  }
                } else {
                  setRecordingStatus('Erro: Avatar desconectado. Aguarde reconexão...')
                  setTimeout(() => setRecordingStatus(''), 5000)
                }
              } else {
                // Outro tipo de erro
                console.error('❌ ==========================================')
                console.error('❌ ERROR in onTranscriptionComplete callback')
                console.error('❌ Error message:', sendError.message)
                console.error('❌ Error name:', sendError.name)
                console.error('❌ Error stack:', sendError.stack)
                console.error('❌ Full error object:', sendError)
                console.error('❌ ==========================================')
                setRecordingStatus('Erro: ' + sendError.message)
                setTimeout(() => setRecordingStatus(''), 5000)
              }
            }
          } catch (error) {
            console.error('❌ ==========================================')
            console.error('❌ ERROR in onTranscriptionComplete callback')
            console.error('❌ Error message:', error.message)
            console.error('❌ Error name:', error.name)
            console.error('❌ Error stack:', error.stack)
            console.error('❌ Full error object:', error)
            console.error('❌ ==========================================')
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
  }, [audioRecorder, streamingService]) // Removido avatarConnected das dependências

  // Conectar avatar ao montar o componente
  // NOTA: A conexão deve ser iniciada após interação do usuário devido à política de AudioContext do navegador
  useEffect(() => {
    let mounted = true
    
    // Não conectar automaticamente - aguardar interação do usuário
    // A conexão será iniciada quando o usuário clicar no botão "Enviar Áudio" pela primeira vez
    
    return () => {
      mounted = false
      if (avatarConnected) {
        streamingService.disconnect()
      }
    }
  }, [avatarConnected, streamingService])

  // Função para inicializar o avatar (chamada na primeira interação do usuário)
  const initializeAvatar = async () => {
    if (!videoRef.current) return
    
    if (avatarConnected) {
      // Avatar já está conectado
      return
    }

    try {
      setRecordingStatus('Conectando avatar...')
      
      // Inicializar OpenAI Assistant primeiro (se ainda não inicializado)
      // ⚠️ SEGURANÇA: Não usar chave API diretamente no frontend
      // O OpenAI Assistant deve ser inicializado via API route no backend
      if (!openaiAssistant) {
        try {
          setRecordingStatus('Inicializando assistente OpenAI...')
          
          // Buscar o assistant ID do cliente do usuário
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
            throw new Error('Assistant não configurado para este cliente. Por favor, entre em contato com o suporte.')
          }
          
          console.log('✅ Using user\'s OpenAI Assistant ID:', assistantId)
          console.log('✅ Client vectorstore ID:', client.vectorstore_id)
          
          // Inicializar via API route (seguro - chave no backend)
          const assistant = new OpenAIAssistantApiService(assistantId)
          await assistant.initialize()
          setOpenaiAssistant(assistant)
          console.log('✅ OpenAI Assistant initialized via API route')
        } catch (error) {
          console.error('❌ Error initializing OpenAI Assistant:', error)
          setRecordingStatus('Erro ao inicializar assistente. Avatar funcionará sem IA.')
          // Continuar mesmo se falhar, o avatar ainda funcionará
        }
      }
      
      // Passar videoElement diretamente para createSession para configurar listeners ANTES da sessão
      // Buscar o avatar Dexter da lista de avatares disponíveis
      // Usar o novo avatar: Dexter_Lawyer_Sitting_public
      let dexterAvatarId = null
      try {
        const avatars = await streamingService.listAvatars()
        
        // Garantir que avatars é um array
        if (!Array.isArray(avatars)) {
          console.warn('⚠️ listAvatars did not return an array, using fallback')
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
          // Usar o ID do avatar (que é o formato correto para o SDK)
          dexterAvatarId = dexterAvatar.id || dexterAvatar.avatar_id || dexterAvatar.avatar_name || 'Dexter_Lawyer_Sitting_public'
          console.log('🔵 Found Dexter avatar:', { id: dexterAvatarId, name: dexterAvatar.name || dexterAvatar.avatar_name })
        } else {
          // Fallback para o novo avatar Dexter_Lawyer_Sitting_public
          dexterAvatarId = 'Dexter_Lawyer_Sitting_public'
          console.log('⚠️ Dexter avatar not found in list, using fallback:', dexterAvatarId)
        }
      } catch (error) {
        console.warn('⚠️ Error listing avatars, using fallback:', error)
        // Fallback para o novo avatar Dexter_Lawyer_Sitting_public
        dexterAvatarId = 'Dexter_Lawyer_Sitting_public'
      }
      
      // Callback para quando o avatar desconectar
      const handleDisconnect = () => {
        console.log('⚠️ Avatar disconnected, updating state...')
        setAvatarConnected(false)
        
        // Evitar múltiplas reconexões simultâneas
        if (isReconnectingRef.current) {
          console.log('⚠️ Reconnection already in progress, skipping...')
          return
        }
        
        setRecordingStatus('Avatar desconectado. Reconectando...')
        // Tentar reconectar automaticamente após um breve delay
        setTimeout(() => {
          if (videoRef.current && !avatarConnectedRef.current && !isReconnectingRef.current) {
            isReconnectingRef.current = true
            console.log('🔄 Attempting to reconnect avatar...')
            initializeAvatar()
              .then(() => {
                isReconnectingRef.current = false
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
      
      const sessionData = await streamingService.createSession(dexterAvatarId, videoRef.current, null, handleDisconnect)
      // Se chegou aqui, o stream está pronto
      setAvatarConnected(true)
      isReconnectingRef.current = false // Resetar flag de reconexão
      // Habilitar áudio após gesto do usuário
      try {
        videoRef.current.muted = false
        videoRef.current.volume = 1.0
        await videoRef.current.play().catch(() => {})
      } catch (_) {}
      setRecordingStatus('Avatar conectado!')
      setTimeout(() => setRecordingStatus(''), 2000)
    } catch (error) {
      console.error('Error connecting avatar:', error)
      setRecordingStatus('Erro ao conectar: ' + error.message)
      setTimeout(() => setRecordingStatus(''), 3000)
    }
  }

  const toggleRecording = async () => {
    if (!audioRecorder) return

    // Se o avatar não estiver conectado, inicializar primeiro
    if (!avatarConnected) {
      await initializeAvatar()
      // Aguardar um pouco para o avatar se conectar
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (!isRecording) {
      setIsRecording(true)
      await audioRecorder.startRecording()
    } else {
      setIsRecording(false)
      // Ao parar manualmente, podemos encerrar as trilhas para liberar o microfone
      audioRecorder.stopRecording(true)
    }
  }
  const menuItems = [
    {
      icon: BarChart3,
      label: 'Dashboard',
      href: '/',
      active: true
    },
    {
      icon: Upload,
      label: 'Upload de Dados',
      href: '/upload'
    },
    {
      icon: FileText,
      label: 'Meus Datasets',
      href: '/datasets'
    },
    {
      icon: Target,
      label: 'Prospecção',
      href: '/prospecting'
    },
    {
      icon: Building2,
      label: 'Minha Empresa',
      href: '/companies'
    },
    {
      icon: Users,
      label: 'Portal Colaborador',
      href: '/employees'
    },
    {
      icon: Database,
      label: 'Integrações',
      href: '/integrations'
    },
    {
      icon: TrendingUp,
      label: 'Análises',
      href: '/analyses'
    }
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">4Prospera Connect</h2>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${item.active 
                        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                )
              })}
            </div>

            {/* Card KPI abaixo de Análises */}
            {!sidebarKpiHidden && (
              <div className="mt-6 px-3">
                <Card className="relative overflow-hidden group" padding="none">
                  {/* Botões no canto superior direito (estilo Windows) */}
                  <div className="absolute top-0 right-0 z-10 flex items-center bg-white rounded-bl-lg border-l border-b border-gray-200 shadow-sm">
                    {/* Ícone do KPI (drasticamente reduzido) */}
                    <div className="h-5 w-5 bg-gradient-primary rounded-sm flex items-center justify-center mr-0.5">
                      <DollarSign className="h-3 w-3 text-white" />
                    </div>
                    <button
                      onClick={() => setSidebarKpiMinimized(!sidebarKpiMinimized)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title={sidebarKpiMinimized ? 'Expandir' : 'Minimizar'}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setSidebarKpiHidden(true)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Fechar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-4 pr-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 pr-16">Avatar HeyGen</p>
                      {!sidebarKpiMinimized && (
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
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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
                                <span>Conectar Avatar</span>
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
            )}

            {/* Lista de Arquivos do Supabase removida a pedido */}

            {/* Tipos de Gráficos removidos a pedido */}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <a
              href="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </a>
            <a
              href="/help"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Ajuda</span>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
