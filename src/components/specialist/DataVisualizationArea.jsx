import React from 'react'
import Card from '../ui/Card'
import LineChart from '../dashboard/charts/LineChart'
import BarChart from '../dashboard/charts/BarChart'
import PieChart from '../dashboard/charts/PieChart'
import { BarChart3, Table, TrendingUp } from 'lucide-react'

const DataVisualizationArea = ({ visualizations = [] }) => {
  if (!visualizations || visualizations.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <BarChart3 className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">Área de Visualização</p>
          <p className="text-sm mt-2">Dados e gráficos aparecerão aqui quando você fizer consultas</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Visualizações</h2>
      <div className="space-y-6">
        {visualizations.map((viz, index) => {
          switch (viz.type) {
            case 'chart':
              if (viz.config?.chartType === 'line') {
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-700 mb-2">{viz.config?.title || 'Gráfico de Linha'}</h3>
                    <LineChart 
                      data={viz.data} 
                      xColumn={viz.config?.xColumn}
                      yColumn={viz.config?.yColumn}
                      title={viz.config?.title}
                    />
                  </div>
                )
              } else if (viz.config?.chartType === 'bar') {
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-700 mb-2">{viz.config?.title || 'Gráfico de Barras'}</h3>
                    <BarChart 
                      data={viz.data} 
                      xColumn={viz.config?.xColumn}
                      yColumn={viz.config?.yColumn}
                      title={viz.config?.title}
                    />
                  </div>
                )
              } else if (viz.config?.chartType === 'pie') {
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-700 mb-2">{viz.config?.title || 'Gráfico de Pizza'}</h3>
                    <PieChart 
                      data={viz.data} 
                      xColumn={viz.config?.xColumn}
                      yColumn={viz.config?.yColumn}
                      title={viz.config?.title}
                    />
                  </div>
                )
              }
              break
            case 'table':
              return (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2">{viz.config?.title || 'Tabela de Dados'}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {viz.data?.columns?.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {viz.data?.rows?.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => {
                              // Converter objetos e arrays para string JSON
                              let displayValue = cell
                              if (cell !== null && cell !== undefined) {
                                if (typeof cell === 'object') {
                                  displayValue = JSON.stringify(cell)
                                } else {
                                  displayValue = String(cell)
                                }
                              } else {
                                displayValue = ''
                              }
                              return (
                                <td key={j} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {displayValue}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            case 'card':
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {viz.data?.map((card, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{card.label}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                        </div>
                        {card.icon && <card.icon className="h-8 w-8 text-primary-500" />}
                      </div>
                    </Card>
                  ))}
                </div>
              )
            default:
              return (
                <div key={index} className="border rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(viz.data, null, 2)}
                  </pre>
                </div>
              )
          }
          return null
        })}
      </div>
    </Card>
  )
}

export default DataVisualizationArea

