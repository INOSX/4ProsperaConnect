import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Database, User, Wrench, Bug, X, Mail, Server, Save, CheckCircle, AlertCircle, Plug } from 'lucide-react'
import ClientTest from '../dashboard/ClientTest'
import AuthTest from '../dashboard/AuthTest'
import SimpleTest from '../dashboard/SimpleTest'
import DebugTest from '../dashboard/DebugTest'
import APIIntegrations from '../integrations/APIIntegrations'

const Settings = ({ initialTab }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showClientTest, setShowClientTest] = useState(false)
  const [showAuthTest, setShowAuthTest] = useState(false)
  const [showSimpleTest, setShowSimpleTest] = useState(false)
  const [showDebugTest, setShowDebugTest] = useState(false)
  
  // Detectar tab da URL, prop initialTab, ou usar 'smtp' como padrão
  const getInitialTab = () => {
    if (initialTab) return initialTab
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    return tab || 'smtp'
  }
  
  const [activeTab, setActiveTab] = useState(getInitialTab())
  
  // Atualizar tab quando a URL mudar
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [location.search])
  
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate(`/settings?tab=${tab}`, { replace: true })
  }
  
  // SMTP Settings
  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: '587',
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: ''
  })
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState(null)

  useEffect(() => {
    loadSmtpSettings()
  }, [])

  const loadSmtpSettings = async () => {
    try {
      // TODO: Carregar configurações SMTP da API
      // Por enquanto, usar valores vazios ou mockados
      const savedSettings = localStorage.getItem('smtp_settings')
      if (savedSettings) {
        setSmtpSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error)
    }
  }

  const handleSmtpSave = async (e) => {
    e.preventDefault()
    setSavingSmtp(true)
    try {
      // TODO: Salvar configurações SMTP via API
      // Por enquanto, salvar no localStorage
      localStorage.setItem('smtp_settings', JSON.stringify(smtpSettings))
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSmtpTestResult({ success: true, message: 'Configurações SMTP salvas com sucesso!' })
      setTimeout(() => setSmtpTestResult(null), 3000)
    } catch (error) {
      console.error('Error saving SMTP settings:', error)
      setSmtpTestResult({ success: false, message: 'Erro ao salvar configurações SMTP' })
    } finally {
      setSavingSmtp(false)
    }
  }

  const handleSmtpTest = async () => {
    setTestingSmtp(true)
    setSmtpTestResult(null)
    try {
      // TODO: Testar conexão SMTP via API
      const response = await fetch('/api/campaigns/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpSettings)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSmtpTestResult({ success: true, message: 'Conexão SMTP testada com sucesso!' })
      } else {
        setSmtpTestResult({ success: false, message: result.error || 'Erro ao testar conexão SMTP' })
      }
    } catch (error) {
      console.error('Error testing SMTP:', error)
      setSmtpTestResult({ success: false, message: 'Erro ao testar conexão SMTP. Verifique as configurações.' })
    } finally {
      setTestingSmtp(false)
      setTimeout(() => setSmtpTestResult(null), 5000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Configure sua conta e integrações</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200" data-tour-id="settings-tabs">
        <nav className="flex space-x-4">
          <button
            onClick={() => handleTabChange('smtp')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'smtp'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span className="font-medium">Configurações SMTP</span>
          </button>
          <button
            onClick={() => handleTabChange('integrations')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'integrations'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plug className="h-4 w-4" />
            <span className="font-medium">Integrações</span>
          </button>
          <button
            onClick={() => handleTabChange('tests')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'tests'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span className="font-medium">Testes e Diagnóstico</span>
          </button>
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'smtp' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configurações do Servidor SMTP</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure o servidor SMTP para envio de campanhas por email
              </p>
            </div>
          </div>

          {smtpTestResult && (
            <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
              smtpTestResult.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {smtpTestResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{smtpTestResult.message}</span>
            </div>
          )}

          <form onSubmit={handleSmtpSave}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servidor SMTP (Host) *
                  </label>
                  <input
                    type="text"
                    value={smtpSettings.host}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                    placeholder="Ex: smtp.gmail.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porta *
                  </label>
                  <input
                    type="number"
                    value={smtpSettings.port}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                    placeholder="587"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Porta padrão: 587 (TLS) ou 465 (SSL)
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={smtpSettings.secure}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, secure: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Usar SSL/TLS (Secure)
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Marque esta opção se o servidor requer conexão segura (SSL/TLS)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuário (Email) *
                  </label>
                  <input
                    type="email"
                    value={smtpSettings.username}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })}
                    placeholder="seu-email@exemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={smtpSettings.password}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Para Gmail, use uma senha de aplicativo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Remetente *
                  </label>
                  <input
                    type="email"
                    value={smtpSettings.fromEmail}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })}
                    placeholder="noreply@exemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Remetente *
                  </label>
                  <input
                    type="text"
                    value={smtpSettings.fromName}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, fromName: e.target.value })}
                    placeholder="4Prospera"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSmtpTest}
                  disabled={testingSmtp || !smtpSettings.host || !smtpSettings.username}
                >
                  <Server className="h-4 w-4 mr-2" />
                  {testingSmtp ? 'Testando...' : 'Testar Conexão'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={savingSmtp || !smtpSettings.host || !smtpSettings.username}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingSmtp ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Exemplos de Configuração</h3>
            <div className="space-y-2 text-xs text-blue-800">
              <div>
                <strong>Gmail:</strong> smtp.gmail.com, Porta 587, SSL desabilitado (use senha de aplicativo)
              </div>
              <div>
                <strong>Outlook/Hotmail:</strong> smtp-mail.outlook.com, Porta 587, SSL desabilitado
              </div>
              <div>
                <strong>SendGrid:</strong> smtp.sendgrid.net, Porta 587, SSL desabilitado
              </div>
              <div>
                <strong>Amazon SES:</strong> email-smtp.region.amazonaws.com, Porta 587, SSL desabilitado
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'integrations' && (
        <div>
          <APIIntegrations />
        </div>
      )}

      {activeTab === 'tests' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Testes e Diagnóstico</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowClientTest(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>Teste Cliente</span>
          </button>
          <button 
            onClick={() => setShowAuthTest(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Teste Auth</span>
          </button>
          <button 
            onClick={() => setShowSimpleTest(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Wrench className="h-4 w-4" />
            <span>Teste Simples</span>
          </button>
          <button 
            onClick={() => setShowDebugTest(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Bug className="h-4 w-4" />
            <span>Debug</span>
          </button>
        </div>
        </Card>
      )}

      {showClientTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Teste de Integração do Cliente</h2>
                <button
                  onClick={() => setShowClientTest(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <ClientTest />
            </Card>
          </div>
        </div>
      )}

      {showAuthTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Teste de Autenticação</h2>
                <button
                  onClick={() => setShowAuthTest(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <AuthTest />
            </Card>
          </div>
        </div>
      )}

      {showSimpleTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Teste Simples de Conexão</h2>
                <button
                  onClick={() => setShowSimpleTest(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <SimpleTest />
            </Card>
          </div>
        </div>
      )}

      {showDebugTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <Card className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Debug Completo</h2>
                <button
                  onClick={() => setShowDebugTest(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <DebugTest />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings


