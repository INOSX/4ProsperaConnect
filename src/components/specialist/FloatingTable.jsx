import React, { useEffect, useState } from 'react'
import { Table2, TrendingUp } from 'lucide-react'

/**
 * FloatingTable - Renderiza tabelas flutuando sobre o avatar
 * Similar ao FloatingChart mas para visualizações de tabelas
 */
export default function FloatingTable({ data, config }) {
  console.log('[FloatingTable] 📋 Componente inicializado:', {
    hasData: !!data,
    dataStructure: data ? Object.keys(data) : [],
    config: config,
    hasColumns: !!data?.columns,
    hasRows: !!data?.rows,
    rowCount: data?.rows?.length || 0
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!data || !data.columns || !data.rows) {
    console.log('[FloatingTable] ⚠️ Dados inválidos ou incompletos')
    return null
  }

  const { columns, rows } = data
  const title = config?.title || 'Resultados da Consulta'
  const maxRows = config?.maxRows || 10

  // Limitar número de linhas exibidas
  const displayRows = rows.slice(0, maxRows)
  const hasMoreRows = rows.length > maxRows

  // Formatar valores das células
  const formatCellValue = (value, columnName) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
    if (typeof value === 'number') {
      // Se for valor monetário
      if (columnName.toLowerCase().includes('revenue') || 
          columnName.toLowerCase().includes('receita') ||
          columnName.toLowerCase().includes('valor') ||
          columnName.toLowerCase().includes('preco')) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      }
      // Se for porcentagem
      if (columnName.toLowerCase().includes('percent') || 
          columnName.toLowerCase().includes('taxa')) {
        return `${value.toFixed(1)}%`
      }
      // Número normal
      return new Intl.NumberFormat('pt-BR').format(value)
    }
    if (typeof value === 'string') {
      // Se for UUID, encurtar
      if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return value.substring(0, 8) + '...'
      }
      // Se for muito longo, truncar
      if (value.length > 50) {
        return value.substring(0, 47) + '...'
      }
      return value
    }
    return String(value)
  }

  // Formatar nome da coluna
  const formatColumnName = (col) => {
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div
      className={`absolute left-[10px] bottom-[140px] max-w-3xl px-4 z-30 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md px-4 py-3 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Table2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base truncate">
                {title}
              </h3>
              <p className="text-white/70 text-xs">
                {rows.length} {rows.length === 1 ? 'registro' : 'registros'}
                {hasMoreRows && ` (mostrando ${displayRows.length})`}
              </p>
            </div>
            <div className="px-2 py-1 bg-white/10 rounded-full">
              <span className="text-xs font-medium text-white uppercase tracking-wide">
                Tabela
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-4 max-h-96 overflow-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/10 border-b border-white/20">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider"
                    >
                      {formatColumnName(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {displayRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-white/5 transition-colors duration-150"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-3 py-2 text-white/90 whitespace-nowrap"
                      >
                        {formatCellValue(cell, columns[cellIdx])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer com estatísticas */}
        <div className="bg-white/5 backdrop-blur-sm px-4 py-3 border-t border-white/10">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Total</p>
              <p className="text-base font-bold text-white">
                {rows.length}
              </p>
            </div>
            <div className="text-center border-l border-r border-white/20">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Colunas</p>
              <p className="text-base font-bold text-white">
                {columns.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Exibindo</p>
              <p className="text-base font-bold text-white">
                {displayRows.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl -z-10 animate-pulse"></div>
    </div>
  )
}
