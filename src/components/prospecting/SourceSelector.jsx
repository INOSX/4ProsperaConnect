import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'
import { DataIntegrationService } from '../../services/dataIntegrationService'
import Card from '../ui/Card'
import { FileText, Database, Link2, Check, Eye, ChevronRight } from 'lucide-react'

const SourceSelector = ({ selectedSources = [], onSelectionChange }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('uploads')
  const [uploads, setUploads] = useState([])
  const [connections, setConnections] = useState([])
  const [externalApis, setExternalApis] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewSource, setPreviewSource] = useState(null)

  useEffect(() => {
    if (user) {
      loadSources()
    }
  }, [user])

  const loadSources = async () => {
    setLoading(true)
    try {
      // Carregar uploads
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('data_sources_new')
        .select('*')
        .eq('is_available_for_prospecting', true)
        .order('created_at', { ascending: false })

      if (!uploadsError && uploadsData) {
        setUploads(uploadsData)
      }

      // Carregar conexões
      if (user) {
        const connectionsResult = await DataIntegrationService.getConnections(user.id)
        if (connectionsResult.success) {
          const availableConnections = (connectionsResult.connections || []).filter(
            c => c.is_available_for_prospecting !== false
          )
          setConnections(availableConnections)
        }
      }

      // Carregar APIs externas
      const { data: apisData, error: apisError } = await supabase
        .from('external_api_integrations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!apisError && apisData) {
        setExternalApis(apisData)
      }
    } catch (error) {
      console.error('Error loading sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSourceToggle = (sourceType, sourceId) => {
    const sourceKey = `${sourceType}:${sourceId}`
    const isSelected = selectedSources.some(s => s.key === sourceKey)

    let newSelection
    if (isSelected) {
      newSelection = selectedSources.filter(s => s.key !== sourceKey)
    } else {
      // Adicionar nova fonte
      let sourceData = null
      if (sourceType === 'upload') {
        sourceData = uploads.find(u => u.id === sourceId)
      } else if (sourceType === 'database') {
        sourceData = connections.find(c => c.id === sourceId)
      } else if (sourceType === 'external_api') {
        sourceData = externalApis.find(a => a.id === sourceId)
      }

      if (sourceData) {
        newSelection = [
          ...selectedSources,
          {
            key: sourceKey,
            type: sourceType,
            id: sourceId,
            name: sourceData.name || sourceData.filename || `${sourceData.api_provider} API`,
            data: sourceData
          }
        ]
      } else {
        return
      }
    }

    onSelectionChange(newSelection)
  }

  const handlePreview = (sourceType, sourceId) => {
    let sourceData = null
    if (sourceType === 'upload') {
      sourceData = uploads.find(u => u.id === sourceId)
    } else if (sourceType === 'database') {
      sourceData = connections.find(c => c.id === sourceId)
    } else if (sourceType === 'external_api') {
      sourceData = externalApis.find(a => a.id === sourceId)
    }

    if (sourceData) {
      setPreviewSource({
        type: sourceType,
        id: sourceId,
        data: sourceData
      })
    }
  }

  const getSourceFields = (source) => {
    if (source.type === 'upload') {
      return source.data.column_names || []
    } else if (source.type === 'database') {
      // Campos mapeados para prospecção
      const mapping = source.data.prospecting_table_mapping || {}
      return Object.keys(mapping)
    } else if (source.type === 'external_api') {
      // Campos retornados pela API
      return ['cpf', 'cnpj', 'nome', 'email', 'telefone', 'score_credito', 'situacao']
    }
    return []
  }

  const tabs = [
    { id: 'uploads', label: 'Uploads', icon: FileText },
    { id: 'connections', label: 'Conexões', icon: Database },
    { id: 'apis', label: 'APIs Externas', icon: Link2 }
  ]

  const renderSourceList = (sources, sourceType) => {
    if (loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p>Carregando fontes...</p>
        </div>
      )
    }

    if (sources.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma fonte disponível</p>
          <p className="text-sm mt-2">
            {sourceType === 'upload' && 'Faça upload de arquivos para usar como fonte'}
            {sourceType === 'database' && 'Configure conexões de banco de dados'}
            {sourceType === 'external_api' && 'Configure APIs externas'}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {sources.map((source) => {
          const sourceKey = `${sourceType}:${source.id}`
          const isSelected = selectedSources.some(s => s.key === sourceKey)
          const sourceName = source.name || source.filename || `${source.api_provider} API`

          return (
            <div
              key={source.id}
              className={`border rounded-lg p-4 transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => handleSourceToggle(sourceType, source.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{sourceName}</h4>
                    <p className="text-sm text-gray-500 truncate">
                      {sourceType === 'upload' && `${source.row_count || 0} linhas, ${source.column_count || 0} colunas`}
                      {sourceType === 'database' && `${source.connection_config?.engine || 'Database'}`}
                      {sourceType === 'external_api' && source.api_provider}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreview(sourceType, source.id)}
                  className="ml-2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Visualizar campos"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <Card className="p-6">
        {activeTab === 'uploads' && renderSourceList(uploads, 'upload')}
        {activeTab === 'connections' && renderSourceList(connections, 'database')}
        {activeTab === 'apis' && renderSourceList(externalApis, 'external_api')}
      </Card>

      {/* Preview Modal */}
      {previewSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Campos Disponíveis
              </h3>
              <button
                onClick={() => setPreviewSource(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {getSourceFields(previewSource).length > 0 ? (
                getSourceFields(previewSource).map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-700">{field}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum campo disponível</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewSource(null)}
                className="btn-secondary"
              >
                Fechar
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Selected Sources Summary */}
      {selectedSources.length > 0 && (
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">
                {selectedSources.length} fonte{selectedSources.length !== 1 ? 's' : ''} selecionada{selectedSources.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-primary-700 mt-1">
                {selectedSources.map(s => s.name).join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default SourceSelector

