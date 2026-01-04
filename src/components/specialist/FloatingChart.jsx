import React, { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

/**
 * FloatingChart - Renderiza gráficos flutuando sobre o avatar
 * Similar ao FloatingDataCards mas para visualizações de gráficos
 */
export default function FloatingChart({ data, config }) {
  console.log('[FloatingChart] 📊 Componente inicializado:', {
    hasData: !!data,
    dataLength: data?.length || 0,
    config: config,
    chartType: config?.chartType
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!data || data.length === 0) {
    console.log('[FloatingChart] ⚠️ Sem dados para renderizar')
    return null
  }

  const chartType = config?.chartType || 'bar'
  const title = config?.title || 'Gráfico'
  const xColumn = config?.xColumn || Object.keys(data[0])[0]
  const yColumn = config?.yColumn || Object.keys(data[0])[1]

  // Preparar dados para o gráfico
  const labels = data.map(item => {
    const label = item[xColumn]
    // Se for UUID, pegar só os primeiros 8 caracteres
    if (typeof label === 'string' && label.includes('-')) {
      return label.substring(0, 8) + '...'
    }
    return label
  })

  const values = data.map(item => item[yColumn] || item.number_of_employees || 0)

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: yColumn || 'Valor',
        data: values,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(244, 63, 94, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(244, 63, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex
            return data[index][xColumn] || labels[index]
          },
          label: (context) => {
            return `${yColumn || 'Valor'}: ${context.parsed.y || context.parsed}`
          }
        }
      },
    },
    scales: chartType === 'bar' || chartType === 'line' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxRotation: 45,
          minRotation: 45,
        },
      },
    } : {},
  }

  const ChartComponent = chartType === 'pie' ? Pie : chartType === 'line' ? Line : Bar
  const ChartIcon = chartType === 'pie' ? PieChart : chartType === 'line' ? Activity : BarChart3

  return (
    <div
      className={`absolute left-0 right-0 bottom-4 mx-auto max-w-2xl px-4 z-30 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md px-4 py-3 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ChartIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base truncate">
                {title.length > 60 ? title.substring(0, 60) + '...' : title}
              </h3>
              <p className="text-white/70 text-xs">
                {data.length} {data.length === 1 ? 'registro' : 'registros'}
              </p>
            </div>
            <div className="px-2 py-1 bg-white/10 rounded-full">
              <span className="text-xs font-medium text-white uppercase tracking-wide">
                {chartType === 'bar' ? 'Barras' : chartType === 'pie' ? 'Pizza' : 'Linha'}
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3" style={{ height: '280px' }}>
            <ChartComponent data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Footer com estatísticas */}
        <div className="bg-white/5 backdrop-blur-sm px-4 py-3 border-t border-white/10">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Total</p>
              <p className="text-base font-bold text-white">
                {data.length}
              </p>
            </div>
            <div className="text-center border-l border-r border-white/20">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Máximo</p>
              <p className="text-base font-bold text-white">
                {Math.max(...values)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Média</p>
              <p className="text-base font-bold text-white">
                {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl -z-10 animate-pulse"></div>
    </div>
  )
}
