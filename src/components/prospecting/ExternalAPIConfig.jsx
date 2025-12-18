import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Save, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const ExternalAPIConfig = () => {
  const { user } = useAuth()
  const [apis, setApis] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingApi, setEditingApi] = useState(null)
  const [testing, setTesting] = useState(null)
  const [testResult, setTestResult] = useState(null)

  const apiProviders = [
    { id: 'receita_federal', name: 'Receita Federal', fields: ['api_key', 'base_url'] },
    { id: 'serasa', name: 'Serasa', fields: ['api_key', 'base_url', 'client_id', 'client_secret'] },
    { id: 'credit_bureau', name: 'Bureau de Crédito', fields: ['api_key', 'base_url', 'username', 'password'] },
    { id: 'social_media', name: 'Redes Sociais/Web', fields: ['api_key', 'base_url', 'access_token'] }
  ]

  useEffect(() => {
    if (user) {
      loadAPIs()
    }
  }, [user])

  const loadAPIs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('external_api_integrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setApis(data || [])
    } catch (error) {
      console.error('Error loading APIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (api) => {
    setEditingApi({
      ...api,
      config: typeof api.api_config === 'string' ? JSON.parse(api.api_config) : api.api_config
    })
    setTestResult(null)
  }

  const handleSave = async () => {
    if (!editingApi || !user) return

    try {
      const apiConfig = {}
      const provider = apiProviders.find(p => p.id === editingApi.api_provider)
      if (provider) {
        provider.fields.forEach(field => {
          const input = document.getElementById(`field_${field}`)
          if (input) {
            apiConfig[field] = input.value
          }
        })
      }

      const { error } = await supabase
        .from('external_api_integrations')
        .upsert({
          id: editingApi.id,
          api_provider: editingApi.api_provider,
          api_config: apiConfig,
          is_active: editingApi.is_active,
          rate_limit: editingApi.rate_limit || 100,
          created_by: user.id
        }, {
          onConflict: 'id'
        })

      if (error) throw error

      await loadAPIs()
      setEditingApi(null)
      setTestResult(null)
      alert('Configuração salva com sucesso!')
    } catch (error) {
      console.error('Error saving API config:', error)
      alert(`Erro ao salvar: ${error.message}`)
    }
  }

  const handleTest = async (api) => {
    setTesting(api.id)
    setTestResult(null)

    try {
      const response = await fetch(`/api/external/${api.api_provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: '123.456.789-00',
          cnpj: '12.345.678/0001-90'
        })
      })

      if (response.ok) {
        setTestResult({ success: true, message: 'Conexão testada com sucesso!' })
      } else {
        const error = await response.json().catch(() => ({}))
        setTestResult({ success: false, message: error.error || 'Erro ao testar conexão' })
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message || 'Erro ao testar conexão' })
    } finally {
      setTesting(null)
    }
  }

  const handleCreateNew = (providerId) => {
    const provider = apiProviders.find(p => p.id === providerId)
    if (!provider) return

    setEditingApi({
      id: null,
      api_provider: providerId,
      api_config: {},
      is_active: true,
      rate_limit: 100
    })
    setTestResult(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando configurações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuração de APIs Externas</h1>
        <p className="text-gray-600">Configure credenciais e teste conexões com APIs externas</p>
      </div>

      {/* Lista de APIs Configuradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apiProviders.map((provider) => {
          const existingApi = apis.find(a => a.api_provider === provider.id)
          return (
            <Card key={provider.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-500">
                    {existingApi ? 'Configurado' : 'Não configurado'}
                  </p>
                </div>
                {existingApi && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    existingApi.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {existingApi.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                )}
              </div>

              {existingApi ? (
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleEdit(existingApi)}
                  >
                    Editar Configuração
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleTest(existingApi)}
                    loading={testing === existingApi.id}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleCreateNew(provider.id)}
                >
                  Configurar
                </Button>
              )}

              {testResult && editingApi?.api_provider === provider.id && (
                <div className={`mt-3 p-3 rounded-lg flex items-center space-x-2 ${
                  testResult.success
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <p className="text-sm">{testResult.message}</p>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Modal de Edição */}
      {editingApi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Configurar {apiProviders.find(p => p.id === editingApi.api_provider)?.name}
              </h2>
              <button
                onClick={() => {
                  setEditingApi(null)
                  setTestResult(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {apiProviders
                .find(p => p.id === editingApi.api_provider)
                ?.fields.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <input
                      id={`field_${field}`}
                      type={field.includes('password') || field.includes('secret') ? 'password' : 'text'}
                      defaultValue={editingApi.config?.[field] || ''}
                      className="input w-full"
                      placeholder={`Digite o ${field.replace(/_/g, ' ')}`}
                    />
                  </div>
                ))}

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingApi.is_active}
                    onChange={(e) => setEditingApi({ ...editingApi, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">API Ativa</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit (chamadas/hora)
                </label>
                <input
                  type="number"
                  value={editingApi.rate_limit || 100}
                  onChange={(e) => setEditingApi({ ...editingApi, rate_limit: parseInt(e.target.value) || 100 })}
                  className="input w-full"
                  min="1"
                />
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  testResult.success
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <p className="text-sm">{testResult.message}</p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingApi(null)
                    setTestResult(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleTest(editingApi)}
                  loading={testing === editingApi.id}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ExternalAPIConfig

