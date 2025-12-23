import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ClientService } from '../../services/clientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { User, Mail, Shield, Save, CheckCircle, AlertCircle, Building2, Calendar } from 'lucide-react'

const UserProfile = () => {
  const { user } = useAuth()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      loadClientData()
    }
  }, [user])

  const loadClientData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const result = await ClientService.getClientByUserId(user.id)
      if (result.success && result.client) {
        setClient(result.client)
        setIsAdmin(result.client.role === 'admin')
      }
    } catch (error) {
      console.error('Error loading client data:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar dados do perfil' })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (newRole) => {
    if (!user || !client) return

    setSaving(true)
    setMessage(null)
    
    try {
      // Atualizar role via API
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: client.id,
          role: newRole
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setClient({ ...client, role: newRole })
        setIsAdmin(newRole === 'admin')
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil' })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando perfil...</div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Perfil não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações e permissões</p>
      </div>

      {/* Mensagens */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Usuário */}
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Membro desde</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {client.company_id && (
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Empresa Associada</p>
                  <p className="text-sm font-medium text-gray-900">
                    {client.company_id}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Permissões e Role */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Permissões</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Tipo de Usuário</p>
              <div className="flex items-center space-x-3">
                <div className={`flex-1 p-4 rounded-lg border-2 ${
                  !isAdmin
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Usuário</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Acesso apenas às suas empresas e dados
                      </p>
                    </div>
                    {!isAdmin && (
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className={`flex-1 p-4 rounded-lg border-2 ${
                isAdmin
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">Administrador</p>
                      {isAdmin && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary-600 text-white rounded">
                          ATIVO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Acesso completo a todas as empresas e dados do sistema
                    </p>
                  </div>
                  {isAdmin && (
                    <CheckCircle className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Botão para alternar role (apenas para desenvolvimento/teste) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                  ⚠️ Apenas para desenvolvimento: Alternar role
                </p>
                <Button
                  variant="secondary"
                  onClick={() => handleRoleChange(isAdmin ? 'user' : 'admin')}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Salvando...' : isAdmin ? 'Remover Permissões de Admin' : 'Tornar Administrador'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">ID do Usuário</p>
            <p className="text-sm font-mono text-gray-900 break-all">{user.id}</p>
          </div>
          {client.id && (
            <div>
              <p className="text-sm text-gray-500">ID do Cliente</p>
              <p className="text-sm font-mono text-gray-900 break-all">{client.id}</p>
            </div>
          )}
          {client.openai_assistant_id && (
            <div>
              <p className="text-sm text-gray-500">OpenAI Assistant ID</p>
              <p className="text-sm font-mono text-gray-900 break-all">{client.openai_assistant_id}</p>
            </div>
          )}
          {client.vectorstore_id && (
            <div>
              <p className="text-sm text-gray-500">Vectorstore ID</p>
              <p className="text-sm font-mono text-gray-900 break-all">{client.vectorstore_id}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default UserProfile

