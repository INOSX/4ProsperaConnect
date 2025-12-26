import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { DataIntegrationService } from '../../services/dataIntegrationService'
import { ClientService } from '../../services/clientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ArrowLeft, Database, Save, TestTube, AlertCircle, CheckCircle, Loader } from 'lucide-react'

const DATABASE_TYPES = [
  { value: 'postgresql', label: 'PostgreSQL', icon: Database },
  { value: 'mysql', label: 'MySQL', icon: Database },
  { value: 'mariadb', label: 'MariaDB', icon: Database },
  { value: 'sqlserver', label: 'SQL Server', icon: Database },
  { value: 'oracle', label: 'Oracle', icon: Database },
  { value: 'mongodb', label: 'MongoDB', icon: Database },
  { value: 'redis', label: 'Redis', icon: Database },
  { value: 'sqlite', label: 'SQLite', icon: Database },
]

const SYNC_FREQUENCIES = [
  { value: 'manual', label: 'Manual' },
  { value: 'hourly', label: 'A cada hora' },
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'realtime', label: 'Tempo real' },
]

const NewIntegration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingConnection, setLoadingConnection] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [errors, setErrors] = useState({})
  const [initializedFromQuery, setInitializedFromQuery] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const isEditing = !!id

  const [formData, setFormData] = useState({
    name: '',
    // Tipo lógico da conexão na tabela (sempre 'database' para este formulário)
    connection_type: 'database',
    // Engine específica do banco (Postgres, MySQL, etc.)
    engine: 'postgresql',
    sync_frequency: 'manual',
    // PostgreSQL, MySQL, MariaDB, SQL Server, Oracle
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    schema: '',
    ssl: false,
    // MongoDB específico
    connection_string: '',
    // SQLite específico
    file_path: '',
    // Opções adicionais
    connection_timeout: '30',
    max_connections: '10',
    pool_size: '5',
  })

  // Verificar se é admin ao carregar
  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
  }, [user])

  // Carregar dados da conexão se estiver editando
  useEffect(() => {
    if (isEditing && id && !initializedFromQuery && isAdmin) {
      loadConnectionData()
    } else if (!isEditing && !initializedFromQuery && isAdmin) {
      // Pré-preencher formulário quando vier da conexão Supabase principal
      const searchParams = new URLSearchParams(location.search)
      const from = searchParams.get('from')

      if (from === 'supabase') {
        setFormData(prev => ({
          ...prev,
          name: 'Supabase - Banco principal da plataforma',
          engine: 'postgresql',
          connection_type: 'database',
          host: 'dytuwutsjjxxmyefrfed.supabase.co',
          port: '5432',
          database: 'postgres',
          schema: 'public',
          ssl: true,
        }))
      }

      setInitializedFromQuery(true)
    }
  }, [id, isEditing, initializedFromQuery, location.search, isAdmin])

  const checkAdminStatus = async () => {
    if (!user) return
    setCheckingAdmin(true)
    try {
      const clientResult = await ClientService.getClientByUserId(user.id)
      if (clientResult.success && clientResult.client) {
        const userIsAdmin = clientResult.client.role === 'admin'
        setIsAdmin(userIsAdmin)
        if (!userIsAdmin) {
          // Redirecionar se não for admin
          alert('Apenas administradores podem criar ou editar conexões de banco de dados')
          navigate('/integrations')
        }
      }
    } catch (error) {
      console.warn('Error checking admin status:', error)
      alert('Erro ao verificar permissões. Redirecionando...')
      navigate('/integrations')
    } finally {
      setCheckingAdmin(false)
    }
  }

  const loadConnectionData = async () => {
    if (!id) return

    setLoadingConnection(true)
    try {
      const result = await DataIntegrationService.getConnection(id)
      if (result.success && result.connection) {
        const conn = result.connection
        const config = conn.connection_config || {}
        
        setFormData({
          name: conn.name || '',
          connection_type: conn.connection_type || 'database',
          engine: config.engine || 'postgresql',
          sync_frequency: conn.sync_frequency || 'manual',
          host: config.host || '',
          port: config.port?.toString() || '',
          database: config.database || '',
          username: config.username || '',
          password: '', // Não carregar senha por segurança
          schema: config.schema || '',
          ssl: config.ssl || false,
          connection_string: config.connection_string || '',
          file_path: config.file_path || '',
          connection_timeout: config.connection_timeout?.toString() || '30',
          max_connections: config.max_connections?.toString() || '10',
          pool_size: config.pool_size?.toString() || '5',
        })
      }
      setInitializedFromQuery(true)
    } catch (error) {
      console.error('Error loading connection:', error)
      alert(`Erro ao carregar conexão: ${error.message || 'Erro desconhecido'}`)
      navigate('/integrations')
    } finally {
      setLoadingConnection(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    // Limpar resultado de teste quando dados mudarem
    if (testResult) {
      setTestResult(null)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da conexão é obrigatório'
    }

    if (formData.engine === 'sqlite') {
      if (!formData.file_path.trim()) {
        newErrors.file_path = 'Caminho do arquivo é obrigatório'
      }
    } else if (formData.engine === 'mongodb') {
      if (!formData.connection_string.trim()) {
        newErrors.connection_string = 'String de conexão é obrigatória'
      }
    } else {
      // PostgreSQL, MySQL, MariaDB, SQL Server, Oracle
      if (!formData.host.trim()) {
        newErrors.host = 'Host é obrigatório'
      }
      if (!formData.port || isNaN(formData.port) || parseInt(formData.port) <= 0) {
        newErrors.port = 'Porta válida é obrigatória'
      }
      if (!formData.database.trim()) {
        newErrors.database = 'Nome do banco de dados é obrigatório'
      }
      if (!formData.username.trim()) {
        newErrors.username = 'Usuário é obrigatório'
      }
      // Senha só é obrigatória ao criar nova conexão, não ao editar
      if (!isEditing && !formData.password.trim()) {
        newErrors.password = 'Senha é obrigatória'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildConnectionConfig = () => {
    const config = {
      engine: formData.engine,
    }

    if (formData.engine === 'sqlite') {
      config.file_path = formData.file_path
    } else if (formData.engine === 'mongodb') {
      config.connection_string = formData.connection_string
    } else {
      // PostgreSQL, MySQL, MariaDB, SQL Server, Oracle
      config.host = formData.host
      config.port = parseInt(formData.port)
      config.database = formData.database
      config.username = formData.username
      if (formData.schema) {
        config.schema = formData.schema
      }
      if (formData.ssl) {
        config.ssl = formData.ssl
      }
      if (formData.connection_timeout) {
        config.connection_timeout = parseInt(formData.connection_timeout)
      }
      if (formData.max_connections) {
        config.max_connections = parseInt(formData.max_connections)
      }
      if (formData.pool_size) {
        config.pool_size = parseInt(formData.pool_size)
      }
    }

    return config
  }

  const buildCredentials = () => {
    if (formData.engine === 'sqlite') {
      return null // SQLite não precisa de credenciais
    } else if (formData.engine === 'mongodb') {
      return null // MongoDB usa connection string
    } else {
      // Se estiver editando e a senha estiver vazia, retornar null (não atualizar credenciais)
      if (isEditing && !formData.password.trim()) {
        return null
      }
      return {
        username: formData.username,
        password: formData.password,
      }
    }
  }

  const handleTest = async () => {
    if (!validateForm()) {
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const connectionConfig = buildConnectionConfig()
      const credentials = buildCredentials()

      const result = await DataIntegrationService.testConnection({
        // Para bancos de dados usamos o tipo lógico 'database' e a engine vai dentro do config
        connectionType: 'database',
        connectionConfig,
        credentials,
      })

      if (result.success) {
        setTestResult({ success: true, message: 'Conexão testada com sucesso!' })
      } else {
        setTestResult({ 
          success: false, 
          message: result.error || result.result?.error || 'Erro ao testar conexão' 
        })
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error.message || 'Erro ao testar conexão' 
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!user) {
      alert('Usuário não autenticado')
      return
    }

    setLoading(true)

    try {
      const connectionConfig = buildConnectionConfig()
      const credentials = buildCredentials()

      if (isEditing && id) {
        // Atualizar conexão existente
        const updates = {
          name: formData.name,
          connection_config: connectionConfig,
          sync_frequency: formData.sync_frequency,
        }
        
        // Incluir credenciais apenas se foram fornecidas (senha preenchida)
        if (credentials) {
          updates.credentials = credentials
        }

        const result = await DataIntegrationService.updateConnection(id, updates, user.id)

        if (result.success) {
          navigate('/integrations', { 
            state: { message: 'Conexão atualizada com sucesso!' } 
          })
        } else {
          alert(`Erro ao atualizar conexão: ${result.error || 'Erro desconhecido'}`)
        }
      } else {
        // Criar nova conexão
        const result = await DataIntegrationService.createConnection({
          name: formData.name,
          // Tipo lógico na tabela (restrito ao enum: api, csv, excel, database, google_sheets)
          connection_type: 'database',
          connection_config: connectionConfig,
          credentials,
          sync_frequency: formData.sync_frequency,
          created_by: user.id,
        }, user.id)

        if (result.success) {
          navigate('/integrations', { 
            state: { message: 'Conexão criada com sucesso!' } 
          })
        } else {
          alert(`Erro ao criar conexão: ${result.error || 'Erro desconhecido'}`)
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} connection:`, error)
      alert(`Erro ao ${isEditing ? 'atualizar' : 'criar'} conexão: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPort = () => {
    switch (formData.engine) {
      case 'postgresql': return '5432'
      case 'mysql': return '3306'
      case 'mariadb': return '3306'
      case 'sqlserver': return '1433'
      case 'oracle': return '1521'
      case 'mongodb': return '27017'
      case 'redis': return '6379'
      default: return ''
    }
  }

  const isConnectionStringBased = formData.engine === 'mongodb'
  const isFileBased = formData.engine === 'sqlite'
  const isStandardDB = !isConnectionStringBased && !isFileBased

  // Verificar permissões antes de renderizar
  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Verificando permissões...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <div className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-gray-600 mb-4">
              Apenas administradores podem criar ou editar conexões de banco de dados.
            </p>
            <Button onClick={() => navigate('/integrations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Conexões
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/integrations')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Conexão de Dados' : 'Nova Conexão de Dados'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Edite a configuração da integração com banco de dados' : 'Configure uma nova integração com banco de dados'}
          </p>
        </div>
      </div>

      {loadingConnection && (
        <Card className="p-6">
          <div className="flex items-center justify-center">
            <Loader className="h-5 w-5 animate-spin mr-2" />
            <span className="text-gray-600">Carregando dados da conexão...</span>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          {/* Nome da Conexão */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Conexão *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Ex: Banco de Produção"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Tipo de Banco de Dados */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Banco de Dados *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DATABASE_TYPES.map((db) => {
                const Icon = db.icon
                const isActive = formData.engine === db.value
                return (
                  <button
                    key={db.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        engine: db.value, 
                        port: getDefaultPort() 
                      }))
                      setTestResult(null)
                    }}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      isActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium text-gray-700">{db.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Campos específicos para MongoDB (Connection String) */}
          {isConnectionStringBased && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                String de Conexão MongoDB *
              </label>
              <textarea
                name="connection_string"
                value={formData.connection_string}
                onChange={handleChange}
                rows={3}
                className={`input w-full font-mono text-sm ${errors.connection_string ? 'border-red-500' : ''}`}
                placeholder="mongodb://username:password@host:port/database?options"
              />
              {errors.connection_string && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.connection_string}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Exemplo: mongodb://user:pass@localhost:27017/mydb?authSource=admin
              </p>
            </div>
          )}

          {/* Campos específicos para SQLite (File Path) */}
          {isFileBased && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caminho do Arquivo *
              </label>
              <input
                type="text"
                name="file_path"
                value={formData.file_path}
                onChange={handleChange}
                className={`input w-full ${errors.file_path ? 'border-red-500' : ''}`}
                placeholder="/caminho/para/arquivo.db"
              />
              {errors.file_path && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.file_path}
                </p>
              )}
            </div>
          )}

          {/* Campos padrão para bancos relacionais */}
          {isStandardDB && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Host */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host / Servidor *
                  </label>
                  <input
                    type="text"
                    name="host"
                    value={formData.host}
                    onChange={handleChange}
                    className={`input w-full ${errors.host ? 'border-red-500' : ''}`}
                    placeholder="localhost ou IP"
                  />
                  {errors.host && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.host}
                    </p>
                  )}
                </div>

                {/* Porta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porta *
                  </label>
                  <input
                    type="number"
                    name="port"
                    value={formData.port}
                    onChange={handleChange}
                    className={`input w-full ${errors.port ? 'border-red-500' : ''}`}
                    placeholder={getDefaultPort()}
                  />
                  {errors.port && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.port}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Database */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Banco de Dados *
                  </label>
                  <input
                    type="text"
                    name="database"
                    value={formData.database}
                    onChange={handleChange}
                    className={`input w-full ${errors.database ? 'border-red-500' : ''}`}
                    placeholder="nome_do_banco"
                  />
                  {errors.database && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.database}
                    </p>
                  )}
                </div>

                {/* Schema (apenas para alguns bancos) */}
                {(formData.connection_type === 'postgresql' || formData.connection_type === 'oracle') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schema (opcional)
                    </label>
                    <input
                      type="text"
                      name="schema"
                      value={formData.schema}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="public"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuário *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`input w-full ${errors.username ? 'border-red-500' : ''}`}
                    placeholder="usuario"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha {!isEditing && '*'}
                    {isEditing && <span className="text-xs text-gray-500 font-normal">(deixe em branco para não alterar)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input w-full ${errors.password ? 'border-red-500' : ''}`}
                    placeholder={isEditing ? "Deixe em branco para manter a senha atual" : "••••••••"}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* SSL */}
              {(formData.connection_type === 'postgresql' || formData.connection_type === 'mysql' || formData.connection_type === 'mariadb') && (
                <div className="mb-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="ssl"
                      checked={formData.ssl}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Usar conexão SSL/TLS</span>
                  </label>
                </div>
              )}

              {/* Opções Avançadas */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Opções Avançadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout (segundos)
                    </label>
                    <input
                      type="number"
                      name="connection_timeout"
                      value={formData.connection_timeout}
                      onChange={handleChange}
                      className="input w-full"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máx. Conexões
                    </label>
                    <input
                      type="number"
                      name="max_connections"
                      value={formData.max_connections}
                      onChange={handleChange}
                      className="input w-full"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamanho do Pool
                    </label>
                    <input
                      type="number"
                      name="pool_size"
                      value={formData.pool_size}
                      onChange={handleChange}
                      className="input w-full"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Frequência de Sincronização */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequência de Sincronização
            </label>
            <select
              name="sync_frequency"
              value={formData.sync_frequency}
              onChange={handleChange}
              className="input w-full"
            >
              {SYNC_FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resultado do Teste */}
          {testResult && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              testResult.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{testResult.message}</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handleTest}
              disabled={testing || loading}
            >
              {testing ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={loading || testing}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Conexão
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

export default NewIntegration


