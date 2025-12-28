/**
 * Painel de administração para gerenciar vetorização de dados
 */
import React, { useState, useEffect } from 'react'
import Card from '../ui/Card'
import { Database, Play, RefreshCw, BarChart3, Loader2 } from 'lucide-react'
import VectorizationService from '../../services/vectorizationService'

const VectorizationPanel = () => {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    loadStatus()
    // Carregar status a cada 5 segundos quando não estiver processando
    const interval = setInterval(() => {
      if (!processing) {
        loadStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [processing])

  const loadStatus = async () => {
    try {
      const result = await VectorizationService.getStatus()
      setStatus(result)
    } catch (error) {
      console.error('Error loading status:', error)
    }
  }

  const handleVectorizeAll = async () => {
    if (!confirm('Deseja vetorizar todos os dados? Isso pode demorar alguns minutos.')) {
      return
    }

    setProcessing(true)
    setProgress({ message: 'Iniciando vetorização...' })
    
    console.log('[VectorizationPanel] Starting vectorizeAll...')

    try {
      console.log('[VectorizationPanel] Calling VectorizationService.vectorizeAll()')
      const result = await VectorizationService.vectorizeAll()
      console.log('[VectorizationPanel] VectorizeAll result:', result)
      
      // Log detalhado de cada tabela
      if (result.results && result.results.length > 0) {
        console.log('[VectorizationPanel] 📋 Detailed results by table:')
        result.results.forEach((tableResult, index) => {
          console.log(`  ${index + 1}. ${tableResult.table}:`, {
            success: tableResult.success,
            processed: tableResult.processed || 0,
            total: tableResult.total || 0,
            message: tableResult.message,
            error: tableResult.error
          })
        })
      }
      
      const message = result.totalProcessed > 0 
        ? `Vetorização concluída! ${result.totalProcessed} registros processados de ${result.successfulTables || 0} tabelas.`
        : `Vetorização concluída, mas nenhum registro foi processado.\n\nPossíveis causas:\n- As tabelas estão vazias (companies, employees, prospects, cpf_clients, unbanked_companies)\n- A tabela data_embeddings não existe (execute o script SQL primeiro)\n\nVerifique o console para detalhes de cada tabela.`
      
      alert(message)
      
      if (result.results && result.results.length > 0) {
        const failedTables = result.results.filter(r => !r.success)
        const emptyTables = result.results.filter(r => r.success && (r.processed === 0 || r.total === 0))
        
        if (failedTables.length > 0) {
          console.warn('[VectorizationPanel] ❌ Failed tables:', failedTables)
          alert(`Atenção: ${failedTables.length} tabela(s) falharam. Verifique o console para detalhes.`)
        }
        
        if (emptyTables.length > 0 && result.totalProcessed === 0) {
          console.warn('[VectorizationPanel] ⚠️ Empty tables:', emptyTables.map(t => t.table))
          console.log('[VectorizationPanel] 💡 Dica: Verifique se há dados nas tabelas:', emptyTables.map(t => t.table).join(', '))
        }
      }
      
      await loadStatus()
    } catch (error) {
      console.error('[VectorizationPanel] Error in vectorizeAll:', error)
      alert(`Erro: ${error.message || 'Erro desconhecido. Verifique o console para mais detalhes.'}`)
    } finally {
      setProcessing(false)
      setProgress(null)
    }
  }

  const handleVectorizeTable = async (tableName) => {
    if (!confirm(`Deseja vetorizar todos os dados da tabela ${tableName}?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await VectorizationService.vectorizeTable(tableName)
      alert(`Vetorização concluída! ${result.processed} registros processados.`)
      await loadStatus()
    } catch (error) {
      alert(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPending = async () => {
    setProcessing(true)
    setProgress({ message: 'Processando registros pendentes...', processed: 0 })

    try {
      const result = await VectorizationService.processAllPending((progress) => {
        setProgress(progress)
      })
      alert(`Processamento concluído! ${result.totalProcessed} registros processados.`)
      await loadStatus()
    } catch (error) {
      alert(`Erro: ${error.message}`)
    } finally {
      setProcessing(false)
      setProgress(null)
    }
  }

  const tables = [
    { name: 'companies', label: 'Empresas' },
    { name: 'employees', label: 'Colaboradores' },
    { name: 'prospects', label: 'Prospects' },
    { name: 'cpf_clients', label: 'Clientes CPF' },
    { name: 'unbanked_companies', label: 'Empresas Não Bancarizadas' }
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6" data-tour-id="vectorization-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Vetorização de Dados</h2>
          </div>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" data-tour-id="vectorization-stats">
            {status ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{status.total || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Vetorizados</p>
                  <p className="text-2xl font-bold text-green-900">{status.withEmbedding || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-900">{status.pending || 0}</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">0</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Vetorizados</p>
                  <p className="text-2xl font-bold text-green-900">0</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-900">0</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2" data-tour-id="vectorization-status-table">
            {status?.byTable ? (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Por Tabela:</h3>
                {Object.entries(status.byTable).map(([table, stats]) => (
                  <div key={table} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{table}</p>
                      <p className="text-xs text-gray-500">
                        {stats.withEmbedding} vetorizados / {stats.total} total ({stats.pending} pendentes)
                      </p>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.withEmbedding / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-sm text-gray-500">
                <p>Carregando status das tabelas...</p>
              </div>
            )}
          </div>
        </div>

        {progress && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">{progress.message}</p>
                {progress.processed > 0 && (
                  <p className="text-xs text-blue-700 mt-1">
                    {progress.processed} registros processados
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleProcessPending}
            disabled={processing || loading}
            data-tour-id="vectorization-process-pending"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5" />
            <span>Processar Registros Pendentes</span>
          </button>

          <button
            onClick={handleVectorizeAll}
            disabled={processing || loading}
            data-tour-id="vectorization-vectorize-all"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="h-5 w-5" />
            <span>Vetorizar Todos os Dados</span>
          </button>

          <div className="border-t pt-3" data-tour-id="vectorization-table-list">
            <p className="text-sm font-medium text-gray-700 mb-2">Vetorizar Tabela Específica:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => handleVectorizeTable(table.name)}
                  disabled={processing || loading}
                  className="flex items-center justify-between px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{table.label}</span>
                  <BarChart3 className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default VectorizationPanel

