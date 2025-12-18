import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ProspectingService } from '../../services/prospectingService'
import { ProspectEnrichmentService } from '../../services/ProspectEnrichmentService'
import SourceSelector from './SourceSelector'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'

const EnrichmentWizard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProspects, setSelectedProspects] = useState([])
  const [allProspects, setAllProspects] = useState([])
  const [selectedSources, setSelectedSources] = useState([])
  const [fieldMappings, setFieldMappings] = useState({})
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [jobId, setJobId] = useState(null)

  useEffect(() => {
    loadProspects()
    
    // Se veio da lista com prospects selecionados
    if (location.state?.prospectIds) {
      setSelectedProspects(location.state.prospectIds)
    }
  }, [])

  const loadProspects = async () => {
    setLoading(true)
    try {
      const result = await ProspectingService.getProspects({ limit: 1000 })
      if (result.success) {
        setAllProspects(result.prospects || [])
      }
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProspectToggle = (prospectId) => {
    if (selectedProspects.includes(prospectId)) {
      setSelectedProspects(selectedProspects.filter(id => id !== prospectId))
    } else {
      setSelectedProspects([...selectedProspects, prospectId])
    }
  }

  const handleSelectAll = () => {
    if (selectedProspects.length === allProspects.length) {
      setSelectedProspects([])
    } else {
      setSelectedProspects(allProspects.map(p => p.id))
    }
  }

  const handleSourceSelectionChange = (sources) => {
    setSelectedSources(sources)
    
    // Gerar mapeamentos básicos automaticamente
    const mappings = {}
    sources.forEach(source => {
      // Mapeamento básico (em produção, usar IA para mapear)
      mappings[source.key] = {
        name: 'name',
        email: 'email',
        phone: 'phone',
        cpf: 'cpf',
        cnpj: 'cnpj'
      }
    })
    setFieldMappings(mappings)
  }

  const handleNext = () => {
    if (currentStep === 1 && selectedProspects.length === 0) {
      alert('Selecione pelo menos um prospect')
      return
    }
    if (currentStep === 2 && selectedSources.length === 0) {
      alert('Selecione pelo menos uma fonte de dados')
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleExecute = async () => {
    if (!user) return

    setProcessing(true)
    try {
      const sourceConfigs = selectedSources.map(source => ({
        sourceType: source.type,
        sourceId: source.id,
        fieldMapping: fieldMappings[source.key] || {}
      }))

      const result = await ProspectEnrichmentService.enrichProspects(
        selectedProspects,
        sourceConfigs,
        user.id
      )

      if (result.success) {
        setJobId(result.jobId)
        setCurrentStep(5) // Ir para acompanhamento
      } else {
        alert('Erro ao iniciar enriquecimento')
      }
    } catch (error) {
      console.error('Error executing enrichment:', error)
      alert(`Erro: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const checkJobStatus = async () => {
    if (!jobId) return

    try {
      const result = await ProspectEnrichmentService.getEnrichmentJobStatus(jobId)
      if (result.success && result.job) {
        if (result.job.status === 'completed' || result.job.status === 'failed') {
          // Redirecionar para lista
          navigate('/prospecting/list')
        }
      }
    } catch (error) {
      console.error('Error checking job status:', error)
    }
  }

  useEffect(() => {
    if (jobId && currentStep === 5) {
      const interval = setInterval(checkJobStatus, 2000)
      return () => clearInterval(interval)
    }
  }, [jobId, currentStep])

  const steps = [
    { number: 1, title: 'Selecionar Prospects', description: 'Escolha os prospects para enriquecer' },
    { number: 2, title: 'Selecionar Fontes', description: 'Escolha as fontes de dados' },
    { number: 3, title: 'Mapear Campos', description: 'Configure o mapeamento de campos' },
    { number: 4, title: 'Revisar', description: 'Revise as configurações' },
    { number: 5, title: 'Processando', description: 'Acompanhe o progresso' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wizard de Enriquecimento</h1>
        <p className="text-gray-600">Enriqueça prospects com múltiplas fontes de dados</p>
      </div>

      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 ${
                  currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Seleção de Prospects */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Selecionar Prospects</h2>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                {selectedProspects.length === allProspects.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                <p className="text-gray-500">Carregando prospects...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allProspects.map((prospect) => {
                  const isSelected = selectedProspects.includes(prospect.id)
                  return (
                    <div
                      key={prospect.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProspectToggle(prospect.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleProspectToggle(prospect.id)}
                          className="rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{prospect.name}</p>
                          <p className="text-sm text-gray-500">{prospect.cpf}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">Score: {prospect.score || 0}</p>
                          <p className="text-xs text-gray-500">{prospect.qualification_status}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-900">
                <strong>{selectedProspects.length}</strong> prospect{selectedProspects.length !== 1 ? 's' : ''} selecionado{selectedProspects.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Seleção de Fontes */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Fontes de Dados</h2>
            <SourceSelector
              selectedSources={selectedSources}
              onSelectionChange={handleSourceSelectionChange}
            />
          </div>
        )}

        {/* Step 3: Mapeamento de Campos */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mapeamento de Campos</h2>
            <p className="text-sm text-gray-600 mb-4">
              Os campos serão mapeados automaticamente. Você pode ajustar se necessário.
            </p>
            {selectedSources.map((source) => (
              <Card key={source.key} className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">{source.name}</h3>
                <div className="space-y-2">
                  {Object.entries(fieldMappings[source.key] || {}).map(([sourceField, targetField]) => (
                    <div key={sourceField} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Campo na fonte: <strong>{sourceField}</strong></p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <select
                          value={targetField}
                          onChange={(e) => {
                            const newMappings = { ...fieldMappings }
                            newMappings[source.key] = {
                              ...newMappings[source.key],
                              [sourceField]: e.target.value
                            }
                            setFieldMappings(newMappings)
                          }}
                          className="input text-sm"
                        >
                          <option value="name">Nome</option>
                          <option value="email">Email</option>
                          <option value="phone">Telefone</option>
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="score">Score</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Step 4: Revisão */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revisão</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Prospects Selecionados</h3>
                <p className="text-sm text-gray-600">{selectedProspects.length} prospect(s)</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Fontes Selecionadas</h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {selectedSources.map(source => (
                    <li key={source.key}>{source.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Processando */}
        {currentStep === 5 && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Processando Enriquecimento</h2>
            <p className="text-sm text-gray-600">
              Aguarde enquanto os dados são enriquecidos...
            </p>
          </div>
        )}

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={currentStep === 1 ? () => navigate('/prospecting') : handleBack}
              disabled={processing}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Cancelar' : 'Voltar'}
            </Button>
            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={processing}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleExecute} loading={processing}>
                Executar Enriquecimento
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default EnrichmentWizard

