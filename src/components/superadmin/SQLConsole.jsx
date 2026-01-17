import React, { useState, useEffect, useRef } from 'react'
import { 
  Terminal, 
  AlertTriangle, 
  Play, 
  Save, 
  History,
  Star,
  Trash2,
  Copy,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Database
} from 'lucide-react'
import Card from '../ui/Card'
import { supabase } from '../../services/supabase'
import superAdminService from '../../services/superAdminService'

const SQLConsole = () => {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [executionTime, setExecutionTime] = useState(0)
  const [history, setHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    loadHistory()
    loadFavorites()
  }, [])

  const loadHistory = () => {
    const saved = localStorage.getItem('sql_console_history')
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem('sql_console_favorites')
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }

  const saveToHistory = (query, result, error, time) => {
    const newHistory = [
      {
        id: Date.now(),
        query,
        result: error ? null : result,
        error: error?.message || null,
        executionTime: time,
        timestamp: new Date().toISOString()
      },
      ...history.slice(0, 49) // Manter apenas 50 últimas
    ]
    setHistory(newHistory)
    localStorage.setItem('sql_console_history', JSON.stringify(newHistory))
  }

  const executeQuery = async () => {
    if (!query.trim()) {
      setError({ message: 'Digite uma query para executar' })
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    
    const startTime = performance.now()

    try {
      // Registrar no audit log
      await superAdminService.logAction('SQL_CONSOLE_QUERY', {
        resourceType: 'database',
        query: query.substring(0, 100) // Primeiros 100 chars
      })

      // Executar query via RPC
      const { data, error: queryError } = await supabase.rpc('exec_sql', { sql: query })

      const endTime = performance.now()
      const time = Math.round(endTime - startTime)
      setExecutionTime(time)

      if (queryError) {
        // Se não tiver exec_sql, tentar query direta (somente SELECT)
        if (queryError.message.includes('Could not find the function')) {
          const isSelect = query.trim().toLowerCase().startsWith('select')
          
          if (isSelect) {
            // Tentar executar como query normal
            const { data: directData, error: directError } = await supabase
              .from('_raw_query')
              .select('*')
            
            if (directError) {
              throw new Error('Console SQL requer a função exec_sql no banco. Por enquanto, apenas consultas via interface Supabase são possíveis.')
            }
          } else {
            throw new Error('Console SQL requer a função exec_sql no banco de dados.')
          }
        } else {
          throw queryError
        }
      }

      setResult(data)
      saveToHistory(query, data, null, time)
      
    } catch (err) {
      console.error('Erro ao executar query:', err)
      const errorObj = { message: err.message || 'Erro desconhecido' }
      setError(errorObj)
      saveToHistory(query, null, errorObj, 0)
    } finally {
      setLoading(false)
    }
  }

  const saveAsFavorite = () => {
    if (!query.trim()) return

    const name = prompt('Nome para esta query:')
    if (!name) return

    const newFavorite = {
      id: Date.now(),
      name,
      query,
      createdAt: new Date().toISOString()
    }

    const newFavorites = [newFavorite, ...favorites]
    setFavorites(newFavorites)
    localStorage.setItem('sql_console_favorites', JSON.stringify(newFavorites))
  }

  const loadFavorite = (favorite) => {
    setQuery(favorite.query)
    setShowFavorites(false)
  }

  const deleteFavorite = (id) => {
    const newFavorites = favorites.filter(f => f.id !== id)
    setFavorites(newFavorites)
    localStorage.setItem('sql_console_favorites', JSON.stringify(newFavorites))
  }

  const loadFromHistory = (item) => {
    setQuery(item.query)
    setShowHistory(false)
  }

  const clearHistory = () => {
    if (confirm('Limpar todo o histórico?')) {
      setHistory([])
      localStorage.removeItem('sql_console_history')
    }
  }

  const copyQuery = () => {
    navigator.clipboard.writeText(query)
    alert('Query copiada!')
  }

  const downloadResults = () => {
    if (!result) return
    
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query_result_${Date.now()}.json`
    a.click()
  }

  const quickQueries = [
    { name: 'Ver tabelas', query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" },
    { name: 'Total usuários', query: 'SELECT role, COUNT(*) as total FROM public.clients GROUP BY role ORDER BY total DESC;' },
    { name: 'Total empresas', query: 'SELECT COUNT(*) as total, SUM(employee_count) as total_employees FROM public.companies;' },
    { name: 'Atividade hoje', query: "SELECT action, COUNT(*) as total FROM public.audit_logs WHERE DATE(created_at) = CURRENT_DATE GROUP BY action;" },
    { name: 'Top prospects', query: 'SELECT * FROM public.prospects ORDER BY score DESC LIMIT 10;' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Terminal className="h-8 w-8 text-red-500" />
            Console SQL
          </h1>
          <p className="text-gray-400 mt-1">⚠️ Acesso direto ao banco de dados - USE COM EXTREMO CUIDADO</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <History className="h-4 w-4" />
            Histórico ({history.length})
          </button>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Star className="h-4 w-4" />
            Favoritos ({favorites.length})
          </button>
        </div>
      </div>

      {/* Warning */}
      <Card className="bg-red-900/20 border-red-800 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-2">⚠️ ZONA DE PERIGO - MÁXIMA ATENÇÃO</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Qualquer query pode ser executada: SELECT, INSERT, UPDATE, DELETE, DROP</li>
              <li>• Não há confirmação para operações destrutivas</li>
              <li>• Todas as queries são registradas no Audit Log</li>
              <li>• USE TRANSACTIONS quando necessário: BEGIN; ... COMMIT; ou ROLLBACK;</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Quick Queries */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">QUERIES RÁPIDAS:</h3>
        <div className="flex flex-wrap gap-2">
          {quickQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => setQuery(q.query)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              {q.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Editor */}
      <Card className="bg-gray-800 border-gray-700 overflow-hidden">
        <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Database className="h-4 w-4" />
            <span>Query Editor</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyQuery}
              disabled={!query}
              className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              title="Copiar query"
            >
              <Copy className="h-4 w-4 text-gray-400" />
            </button>
            <button
              onClick={saveAsFavorite}
              disabled={!query}
              className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              title="Salvar como favorito"
            >
              <Star className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite sua query SQL aqui...&#10;&#10;Exemplo:&#10;SELECT * FROM public.clients LIMIT 10;"
          className="w-full h-64 p-4 bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              executeQuery()
            }
          }}
        />

        <div className="bg-gray-900 px-4 py-3 border-t border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Pressione Ctrl+Enter para executar
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setQuery('')}
              disabled={!query || loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Limpar
            </button>
            <button
              onClick={executeQuery}
              disabled={!query || loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Executar Query
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {(result || error) && (
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
          <div className={`px-4 py-2 border-b flex items-center justify-between ${
            error ? 'bg-red-900/30 border-red-800' : 'bg-green-900/30 border-green-800'
          }`}>
            <div className="flex items-center gap-2">
              {error ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-500 font-semibold">Erro na Query</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-semibold">Query Executada com Sucesso</span>
                  <span className="text-gray-400 text-sm ml-4 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {executionTime}ms
                  </span>
                  {Array.isArray(result) && (
                    <span className="text-gray-400 text-sm">
                      • {result.length} registro(s)
                    </span>
                  )}
                </>
              )}
            </div>
            {result && (
              <button
                onClick={downloadResults}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Download JSON"
              >
                <Download className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="p-4 max-h-96 overflow-auto">
            {error ? (
              <div className="font-mono text-sm text-red-400 whitespace-pre-wrap">
                {error.message}
              </div>
            ) : (
              <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </Card>
      )}

      {/* History Panel */}
      {showHistory && (
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Queries
            </h3>
            <button
              onClick={clearHistory}
              className="text-sm text-red-500 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Limpar
            </button>
          </div>
          <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma query executada ainda
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-900/50 cursor-pointer" onClick={() => loadFromHistory(item)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.error ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString('pt-BR')}
                      </span>
                      {item.executionTime > 0 && (
                        <span className="text-xs text-gray-500">• {item.executionTime}ms</span>
                      )}
                    </div>
                  </div>
                  <code className="text-xs text-gray-300 block truncate">
                    {item.query}
                  </code>
                  {item.error && (
                    <p className="text-xs text-red-400 mt-1 truncate">{item.error}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Favorites Panel */}
      {showFavorites && (
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="h-5 w-5" />
              Queries Favoritas
            </h3>
          </div>
          <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {favorites.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma query favorita salva
              </div>
            ) : (
              favorites.map((fav) => (
                <div key={fav.id} className="p-4 hover:bg-gray-900/50 group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{fav.name}</h4>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => loadFavorite(fav)}
                        className="text-xs text-blue-500 hover:text-blue-400"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => deleteFavorite(fav.id)}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <code className="text-xs text-gray-400 block truncate">
                    {fav.query}
                  </code>
                  <span className="text-xs text-gray-600 mt-1 block">
                    {new Date(fav.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default SQLConsole
