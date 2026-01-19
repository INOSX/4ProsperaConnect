/**
 * 🎉 PARTY-MODE: Componente de Integrações de APIs de Prospecção
 * Gerencia configurações de múltiplas APIs para enriquecimento de dados empresariais
 */

import React, { useState, useEffect } from 'react'
import { 
  Save, Check, X, Eye, EyeOff, ExternalLink, Zap, Shield, 
  DollarSign, Globe, Database, AlertCircle, CheckCircle, 
  RefreshCw, TrendingUp, BarChart3
} from 'lucide-react'
import Card from '../ui/Card'
import prospectionService from '../../services/prospectionService'

const APIIntegrations = () => {
  const [config, setConfig] = useState({
    cnpjwsApiKey: '',
    cnpjwsEnabled: false,
    validaToken: '',
    validaEnabled: false,
    googleApiKey: '',
    googleEnabled: false
  })

  const [showKeys, setShowKeys] = useState({
    cnpjws: false,
    valida: false,
    google: false
  })

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [testing, setTesting] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] })

  // Carregar configurações salvas
  useEffect(() => {
    loadConfig()
    updateCacheStats()
  }, [])

  const loadConfig = () => {
    try {
      const saved = localStorage.getItem('api_integrations_config')
      if (saved) {
        setConfig(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const updateCacheStats = () => {
    const stats = prospectionService.getCacheStats()
    setCacheStats(stats)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem('api_integrations_config', JSON.stringify(config))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (apiName) => {
    setTesting(apiName)
    setTestResults({ ...testResults, [apiName]: null })

    try {
      let result = null

      switch (apiName) {
        case 'opencnpj':
          // Testar com CNPJ da 4Prospera (exemplo)
          result = await prospectionService.fetchOpenCNPJ('00.000.000/0000-00')
          break

        case 'cnpjws':
          if (!config.cnpjwsApiKey) {
            throw new Error('API Key não configurada')
          }
          result = await prospectionService.fetchCNPJws('00.000.000/0000-00', config.cnpjwsApiKey)
          break

        case 'valida':
          if (!config.validaToken) {
            throw new Error('Token não configurado')
          }
          result = await prospectionService.fetchValidaAPI('00.000.000/0000-00', config.validaToken)
          break

        case 'google':
          if (!config.googleApiKey) {
            throw new Error('API Key não configurada')
          }
          result = await prospectionService.fetchGooglePlaces('4Prospera', 'São Paulo, Brasil', config.googleApiKey)
          break

        default:
          throw new Error('API não reconhecida')
      }

      setTestResults({
        ...testResults,
        [apiName]: {
          success: !!result,
          message: result ? 'Conexão OK! API funcionando.' : 'Sem dados retornados.',
          data: result
        }
      })
    } catch (error) {
      setTestResults({
        ...testResults,
        [apiName]: {
          success: false,
          message: error.message,
          data: null
        }
      })
    } finally {
      setTesting(null)
    }
  }

  const handleClearCache = () => {
    prospectionService.clearCache()
    updateCacheStats()
    alert('Cache limpo com sucesso!')
  }

  const toggleShow = (api) => {
    setShowKeys({ ...showKeys, [api]: !showKeys[api] })
  }

  return (
    <div className="space-y-6">
      {/* Header com Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">APIs Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {[config.cnpjwsEnabled, config.validaEnabled, config.googleEnabled].filter(Boolean).length + 1}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cache Ativo</p>
              <p className="text-2xl font-bold text-blue-600">{cacheStats.size}</p>
            </div>
            <Database className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Economia</p>
              <p className="text-2xl font-bold text-purple-600">R$ 0,00</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consultas</p>
              <p className="text-2xl font-bold text-orange-600">0</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Mensagem de sucesso */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Configurações salvas com sucesso!</span>
        </div>
      )}

      {/* 1. OpenCNPJ (GRATUITA) */}
      <Card className="p-6 border-l-4 border-green-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">OpenCNPJ API</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    GRATUITA
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    SEMPRE ATIVA
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-14">
              API gratuita e open source com dados da Receita Federal. Atualização mensal, cache de 30 dias.
              <strong> Nenhuma configuração necessária!</strong>
            </p>
          </div>
          <button
            onClick={() => handleTest('opencnpj')}
            disabled={testing === 'opencnpj'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {testing === 'opencnpj' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Testando...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Testar</span>
              </>
            )}
          </button>
        </div>

        {testResults.opencnpj && (
          <div className={`mt-4 p-4 rounded-lg border ${
            testResults.opencnpj.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {testResults.opencnpj.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                testResults.opencnpj.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResults.opencnpj.message}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">✨ Dados Disponíveis:</h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Razão Social, Nome Fantasia</li>
            <li>• Situação Cadastral, Data de Abertura</li>
            <li>• Endereço Completo, Telefone, Email</li>
            <li>• Atividade Principal e Secundárias (CNAE)</li>
            <li>• Porte, Natureza Jurídica</li>
          </ul>
        </div>

        <a
          href="https://opencnpj.org"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center space-x-2 text-sm text-green-600 hover:text-green-700"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Documentação OpenCNPJ</span>
        </a>
      </Card>

      {/* 2. CNPJ.ws (FREEMIUM) */}
      <Card className="p-6 border-l-4 border-blue-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">CNPJ.ws API</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    FREEMIUM
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                    3 consultas/min (grátis)
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-14">
              Dados em tempo real da Receita Federal + Sintegra + Sefaz. Plano gratuito com limite de 3 consultas/minuto.
            </p>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.cnpjwsEnabled}
              onChange={(e) => setConfig({ ...config, cnpjwsEnabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Ativar</span>
          </label>
        </div>

        {config.cnpjwsEnabled && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (opcional para plano gratuito)
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showKeys.cnpjws ? 'text' : 'password'}
                      value={config.cnpjwsApiKey}
                      onChange={(e) => setConfig({ ...config, cnpjwsApiKey: e.target.value })}
                      placeholder="Deixe vazio para usar plano gratuito"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('cnpjws')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showKeys.cnpjws ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTest('cnpjws')}
                    disabled={testing === 'cnpjws'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {testing === 'cnpjws' ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha uma chave em <a href="https://www.cnpj.ws" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.cnpj.ws</a> para planos pagos
                </p>
              </div>
            </div>

            {testResults.cnpjws && (
              <div className={`p-4 rounded-lg border ${
                testResults.cnpjws.success
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {testResults.cnpjws.success ? (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    testResults.cnpjws.success ? 'text-blue-800' : 'text-red-800'
                  }`}>
                    {testResults.cnpjws.message}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">✨ Dados Adicionais:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Dados da Receita Federal em tempo real</li>
                <li>• Informações do Sintegra (estadual)</li>
                <li>• Dados do Sefaz</li>
                <li>• Atualização automática</li>
              </ul>
            </div>
          </>
        )}

        <a
          href="https://docs.cnpj.ws"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Documentação CNPJ.ws</span>
        </a>
      </Card>

      {/* 3. Valida API (PREMIUM) */}
      <Card className="p-6 border-l-4 border-purple-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Valida API</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    PREMIUM
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                    CRÉDITOS PAGOS
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-14">
              API profissional para análise de crédito com protestos, Simples Nacional, MEI e geolocalização.
            </p>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.validaEnabled}
              onChange={(e) => setConfig({ ...config, validaEnabled: e.target.checked })}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">Ativar</span>
          </label>
        </div>

        {config.validaEnabled && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token de Acesso *
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showKeys.valida ? 'text' : 'password'}
                      value={config.validaToken}
                      onChange={(e) => setConfig({ ...config, validaToken: e.target.value })}
                      placeholder="Token da Valida API"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('valida')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showKeys.valida ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTest('valida')}
                    disabled={testing === 'valida' || !config.validaToken}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {testing === 'valida' ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha em <a href="https://valida.api.br" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">valida.api.br</a>
                </p>
              </div>
            </div>

            {testResults.valida && (
              <div className={`p-4 rounded-lg border ${
                testResults.valida.success
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {testResults.valida.success ? (
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    testResults.valida.success ? 'text-purple-800' : 'text-red-800'
                  }`}>
                    {testResults.valida.message}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">✨ Dados Premium:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Protestos e negativações</li>
                <li>• Simples Nacional (status e enquadramento)</li>
                <li>• MEI (verificação)</li>
                <li>• Geolocalização precisa</li>
                <li>• Score de crédito empresarial</li>
              </ul>
            </div>
          </>
        )}

        <a
          href="https://valida.api.br"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Documentação Valida API</span>
        </a>
      </Card>

      {/* 4. Google Places API (PAY-AS-YOU-GO) */}
      <Card className="p-6 border-l-4 border-red-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Globe className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Google Places API</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                    PAY-AS-YOU-GO
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    $200/mês grátis
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-14">
              Enriquecimento de dados com avaliações, fotos, website e presença online da empresa.
            </p>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.googleEnabled}
              onChange={(e) => setConfig({ ...config, googleEnabled: e.target.checked })}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">Ativar</span>
          </label>
        </div>

        {config.googleEnabled && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key *
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showKeys.google ? 'text' : 'password'}
                      value={config.googleApiKey}
                      onChange={(e) => setConfig({ ...config, googleApiKey: e.target.value })}
                      placeholder="Chave do Google Cloud Platform"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('google')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showKeys.google ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTest('google')}
                    disabled={testing === 'google' || !config.googleApiKey}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {testing === 'google' ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Crie em <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Google Cloud Console</a>
                </p>
              </div>
            </div>

            {testResults.google && (
              <div className={`p-4 rounded-lg border ${
                testResults.google.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {testResults.google.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    testResults.google.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResults.google.message}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">✨ Dados de Presença Online:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Avaliação (rating) e número de reviews</li>
                <li>• Website oficial</li>
                <li>• Telefone atualizado</li>
                <li>• Link do Google Maps</li>
                <li>• Fotos do estabelecimento</li>
                <li>• Horário de funcionamento</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Dica de Economia:</h4>
              <p className="text-xs text-blue-800">
                Google oferece $200 de crédito grátis por mês. Com cache de 30 minutos, você pode fazer 
                <strong> milhares de consultas sem custo!</strong>
              </p>
            </div>
          </>
        )}

        <a
          href="https://developers.google.com/maps/documentation/places/web-service"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center space-x-2 text-sm text-red-600 hover:text-red-700"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Documentação Google Places</span>
        </a>
      </Card>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleClearCache}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Limpar Cache ({cacheStats.size})</span>
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 flex items-center space-x-2 shadow-lg"
        >
          {saving ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Salvar Configurações</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default APIIntegrations
