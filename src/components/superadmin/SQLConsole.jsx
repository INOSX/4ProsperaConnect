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
  Database,
  Loader2,
  RefreshCw,
  X,
  Zap
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
    console.log('🔍 [SQLConsole] Carregando histórico e favoritos...')
    loadHistory()
    loadFavorites()
  }, [])

  const loadHistory = () => {
    const saved = localStorage.getItem('sql_console_history')
    if (saved) {
      const parsed = JSON.parse(saved)
      setHistory(parsed)
      console.log('✅ [SQLConsole] Histórico carregado:', parsed.length, 'queries')
    }
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem('sql_console_favorites')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFavorites(parsed)
      console.log('✅ [SQLConsole] Favoritos carregados:', parsed.length, 'queries')
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
    console.log('💾 [SQLConsole] Query salva no histórico')
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
    console.log('▶️ [SQLConsole] Executando query:', query.substring(0, 100))

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
            throw new Error('Console SQL requer a função exec_sql no banco. Por enquanto, apenas consultas via interface Supabase são possíveis.')
          } else {
            throw new Error('Console SQL requer a função exec_sql no banco de dados.')
          }
        } else {
          throw queryError
        }
      }

      console.log('✅ [SQLConsole] Query executada com sucesso em', time, 'ms')
      setResult(data)
      saveToHistory(query, data, null, time)
      
    } catch (err) {
      console.error('❌ [SQLConsole] Erro ao executar query:', err)
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
    console.log('⭐ [SQLConsole] Query salva nos favoritos:', name)
  }

  const loadFavorite = (favorite) => {
    setQuery(favorite.query)
    setShowFavorites(false)
    console.log('📥 [SQLConsole] Favorito carregado:', favorite.name)
  }

  const deleteFavorite = (id) => {
    const newFavorites = favorites.filter(f => f.id !== id)
    setFavorites(newFavorites)
    localStorage.setItem('sql_console_favorites', JSON.stringify(newFavorites))
    console.log('🗑️ [SQLConsole] Favorito removido')
  }

  const loadFromHistory = (item) => {
    setQuery(item.query)
    setShowHistory(false)
    console.log('📥 [SQLConsole] Query do histórico carregada')
  }

  const clearHistory = () => {
    if (confirm('Limpar todo o histórico?')) {
      setHistory([])
      localStorage.removeItem('sql_console_history')
      console.log('🗑️ [SQLConsole] Histórico limpo')
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
    console.log('💾 [SQLConsole] Resultados baixados')
  }

  const quickQueries = [
    { name: 'Ver tabelas', query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" },
    { name: 'Total usuários', query: 'SELECT role, COUNT(*) as total FROM public.clients GROUP BY role ORDER BY total DESC;' },
    { name: 'Total empresas', query: 'SELECT COUNT(*) as total, SUM(employee_count) as total_employees FROM public.companies;' },
    { name: 'Atividade hoje', query: "SELECT action, COUNT(*) as total FROM public.audit_logs WHERE DATE(created_at) = CURRENT_DATE GROUP BY action;" },
    { name: 'Top prospects', query: 'SELECT * FROM public.prospects ORDER BY score DESC LIMIT 10;' }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Moderno com Gradiente */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-orange-600 to-red-700 bg-clip-text text-transparent flex items-center gap-3">
            <Terminal className="h-10 w-10 text-red-500 drop-shadow-glow" />
            Console SQL
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">
            Acesso direto ao banco de dados • Todas as queries são registradas
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg font-semibold ${
              showHistory
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-blue-500/50'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            } hover:scale-105`}
          >
            <History className="h-5 w-5" />
            Histórico ({history.length})
          </button>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg font-semibold ${
              showFavorites
                ? 'bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-700 hover:to-orange-800 text-white hover:shadow-yellow-500/50'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            } hover:scale-105`}
          >
            <Star className="h-5 w-5" />
            Favoritos ({favorites.length})
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 border-2 border-red-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600/20 rounded-xl">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-2">⚠️ Zona de Máximo Risco</h3>
            <p className="text-gray-300">
              Você tem <span className="font-bold text-white">acesso total ao banco de dados</span>. 
              Queries mal construídas podem <span className="text-red-400 font-semibold">danificar ou excluir dados permanentemente</span>.
              Todas as queries são registradas no audit log.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Queries */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-white">QUERIES RÁPIDAS</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => setQuery(q.query)}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-gray-500 text-white rounded-lg transition-all hover:scale-105 font-medium"
            >
              {q.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="bg-gray-900/80 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Database className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-white font-bold text-lg">Query Editor</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyQuery}
              disabled={!query}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copiar query"
            >
              <Copy className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={saveAsFavorite}
              disabled={!query}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Salvar como favorito"
            >
              <Star className="h-5 w-5 text-yellow-400 hover:text-yellow-300" />
            </button>
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite sua query SQL aqui...&#10;&#10;Exemplo:&#10;SELECT * FROM public.clients LIMIT 10;"
          className="w-full h-64 p-6 bg-gray-900/50 text-white font-mono text-base resize-none focus:outline-none"
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              executeQuery()
            }
          }}
        />

        <div className="bg-gray-900/80 px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-400 font-medium">
            💡 Pressione <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-white font-mono text-xs">Ctrl+Enter</kbd> para executar
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setQuery('')}
              disabled={!query || loading}
              className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Limpar
            </button>
            <button
              onClick={executeQuery}
              disabled={!query || loading}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-red-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Executar Query
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {(result || error) && (
        <div className={`bg-gradient-to-r backdrop-blur-sm rounded-2xl border-2 overflow-hidden ${
          error 
            ? 'from-red-600/20 to-red-800/20 border-red-500/30' 
            : 'from-green-600/20 to-emerald-800/20 border-green-500/30'
        }`}>
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            error ? 'border-red-500/30' : 'border-green-500/30'
          }`}>
            <div className="flex items-center gap-3">
              {error ? (
                <>
                  <XCircle className="h-6 w-6 text-red-400" />
                  <span className="text-red-400 font-bold text-lg">Erro na Query</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-green-400 font-bold text-lg">Query Executada com Sucesso</span>
                  <span className="text-gray-300 text-sm ml-4 flex items-center gap-2 font-semibold px-3 py-1 bg-gray-800/50 rounded-lg">
                    <Clock className="h-4 w-4" />
                    {executionTime}ms
                  </span>
                  {Array.isArray(result) && (
                    <span className="text-gray-300 text-sm font-semibold px-3 py-1 bg-gray-800/50 rounded-lg">
                      {result.length} registro(s)
                    </span>
                  )}
                </>
              )}
            </div>
            {result && (
              <button
                onClick={downloadResults}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                title="Download JSON"
              >
                <Download className="h-5 w-5 text-gray-300 hover:text-white" />
              </button>
            )}
          </div>

          <div className="p-6 max-h-96 overflow-auto bg-gray-900/50">
            {error ? (
              <div className="font-mono text-sm text-red-300 whitespace-pre-wrap">
                {error.message}
              </div>
            ) : (
              <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600/10 to-blue-800/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <History className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Histórico de Queries</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg flex items-center gap-2 transition-all font-semibold"
              >
                <Trash2 className="h-4 w-4" />
                Limpar
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-12 text-center">
                <History className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-semibold">Nenhuma query executada ainda</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-900/50 cursor-pointer transition-all" onClick={() => loadFromHistory(item)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {item.error ? (
                        <XCircle className="h-5 w-5 text-red-400" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(item.timestamp).toLocaleString('pt-BR')}
                      </span>
                      {item.executionTime > 0 && (
                        <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-800/50 rounded">
                          {item.executionTime}ms
                        </span>
                      )}
                    </div>
                  </div>
                  <code className="text-sm text-gray-300 block truncate font-mono bg-gray-900/50 px-3 py-2 rounded">
                    {item.query}
                  </code>
                  {item.error && (
                    <p className="text-xs text-red-400 mt-2 truncate font-medium">{item.error}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Favorites Panel */}
      {showFavorites && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-yellow-600/10 to-orange-800/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-600/20 rounded-xl">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Queries Favoritas</h3>
            </div>
            <button
              onClick={() => setShowFavorites(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {favorites.length === 0 ? (
              <div className="p-12 text-center">
                <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-semibold">Nenhuma query favorita salva</p>
              </div>
            ) : (
              favorites.map((fav) => (
                <div key={fav.id} className="p-4 hover:bg-gray-900/50 group transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-bold text-lg">{fav.name}</h4>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => loadFavorite(fav)}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-semibold transition-all"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => deleteFavorite(fav.id)}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-semibold transition-all"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <code className="text-sm text-gray-400 block truncate font-mono bg-gray-900/50 px-3 py-2 rounded">
                    {fav.query}
                  </code>
                  <span className="text-xs text-gray-500 mt-2 block font-medium">
                    Criado em {new Date(fav.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}

export default SQLConsole
