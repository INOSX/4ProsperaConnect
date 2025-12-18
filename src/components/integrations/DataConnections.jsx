import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { DataIntegrationService } from '../../services/dataIntegrationService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Plus, Database, FileText, Link2, CheckCircle, XCircle, Clock, RefreshCw, Settings, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DataConnections = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadConnections()
    }
  }, [user])

  const loadConnections = async () => {
    if (!user) return

    setLoading(true)
    try {
      const result = await DataIntegrationService.getConnections(user.id)
      if (result.success) {
        setConnections(result.connections || [])
      }
    } catch (error) {
      console.error('Error loading connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async (connectionId) => {
    try {
      const connection = connections.find(c => c.id === connectionId)
      if (!connection) return

      const result = await DataIntegrationService.testConnection({
        connectionId,
        connectionType: connection.connection_type,
        connectionConfig: connection.connection_config
      })

      if (result.success) {
        alert('Conexão testada com sucesso!')
        await loadConnections()
      } else {
        alert(`Erro ao testar conexão: ${result.result?.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      alert('Erro ao testar conexão')
    }
  }

  const handleSyncConnection = async (connectionId) => {
    try {
      const result = await DataIntegrationService.syncConnection(connectionId)
      if (result.success) {
        alert('Sincronização iniciada!')
        await loadConnections()
      }
    } catch (error) {
      console.error('Error syncing connection:', error)
      alert('Erro ao iniciar sincronização')
    }
  }

  const handleEditConnection = (connectionId) => {
    navigate(`/integrations/edit/${connectionId}`)
  }

  const handleDeleteConnection = async (connectionId) => {
    const connection = connections.find(c => c.id === connectionId)
    if (!connection) return

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a conexão "${connection.name}"?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    try {
      const result = await DataIntegrationService.deleteConnection(connectionId)
      if (result.success) {
        alert('Conexão excluída com sucesso!')
        await loadConnections()
      } else {
        alert(`Erro ao excluir conexão: ${result.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Error deleting connection:', error)
      alert(`Erro ao excluir conexão: ${error.message || 'Erro desconhecido'}`)
    }
  }

  const getConnectionIcon = (type) => {
    switch (type) {
      case 'api': return Link2
      case 'database': return Database
      case 'csv':
      case 'excel': return FileText
      default: return Database
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'testing': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConnectionTypeLabel = (connection) => {
    const engine = connection?.connection_config?.engine
    if (connection.connection_type === 'database' && engine) {
      switch (engine) {
        case 'postgresql': return 'PostgreSQL'
        case 'mysql': return 'MySQL'
        case 'mariadb': return 'MariaDB'
        case 'sqlserver': return 'SQL Server'
        case 'oracle': return 'Oracle'
        case 'mongodb': return 'MongoDB'
        case 'redis': return 'Redis'
        case 'sqlite': return 'SQLite'
        default: return 'Banco de Dados'
      }
    }
    return connection.connection_type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando conexões...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conexões de Dados</h1>
          <p className="text-gray-600">Gerencie suas integrações com bases de dados externas</p>
        </div>
        <Button onClick={() => navigate('/integrations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conexão
        </Button>
      </div>

      {/* Conexão fixa: Supabase atual da plataforma */}
      <Card className="p-6 border border-primary-100 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Database className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Supabase - Banco principal da plataforma
              </h2>
              <p className="text-sm text-gray-600">
                Esta é a conexão oficial usada pelo 4Prospera Connect para armazenar usuários, clientes,
                dados financeiros e datasets.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Você pode configurar esta conexão como um módulo na área de integrações para testes e documentação.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end space-y-3">
            <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </span>
            <div className="text-xs text-gray-500 text-left md:text-right max-w-xs">
              Projeto: <span className="font-mono break-all">dytuwutsjjxxmyefrfed</span>
              <br />
              Tipo: Banco de dados gerenciado (Supabase / PostgreSQL)
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center justify-center"
              onClick={() => navigate('/integrations/new?from=supabase')}
            >
              <Settings className="h-3 w-3 mr-1" />
              Editar conexão Supabase
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Conexões */}
      {connections.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Nenhuma conexão configurada</p>
            <p className="text-sm text-gray-400 mb-4">
              Crie uma nova conexão para integrar dados externos à plataforma
            </p>
            <Button onClick={() => navigate('/integrations/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Conexão
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => {
            const Icon = getConnectionIcon(connection.connection_type)
            return (
              <Card key={connection.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{connection.name}</h3>
                      <p className="text-sm text-gray-500">{getConnectionTypeLabel(connection)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(connection.status)}`}>
                    {connection.status === 'active' ? 'Ativo' :
                     connection.status === 'error' ? 'Erro' :
                     connection.status === 'testing' ? 'Testando' : 'Inativo'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {connection.last_sync_at && (
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Última sync: {new Date(connection.last_sync_at).toLocaleString('pt-BR')}
                    </div>
                  )}
                  {connection.sync_frequency && (
                    <div className="text-xs text-gray-600">
                      Frequência: {connection.sync_frequency === 'realtime' ? 'Tempo real' :
                                   connection.sync_frequency === 'hourly' ? 'A cada hora' :
                                   connection.sync_frequency === 'daily' ? 'Diária' :
                                   connection.sync_frequency === 'weekly' ? 'Semanal' : 'Manual'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTestConnection(connection.id)}
                      className="flex-1"
                    >
                      Testar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSyncConnection(connection.id)}
                      className="flex-1"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sincronizar
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditConnection(connection.id)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteConnection(connection.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DataConnections

