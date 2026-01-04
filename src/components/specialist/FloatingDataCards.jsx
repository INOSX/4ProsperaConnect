import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Building2, DollarSign, Calendar, Mail, Phone, MapPin } from 'lucide-react'

/**
 * FloatingDataCards - Cartões flutuantes com glassmorphism
 * Exibe dados sobre o avatar do especialista de forma inovadora
 */
export default function FloatingDataCards({ data = [], type = 'companies' }) {
  console.log('[FloatingDataCards] 🎴 ========== COMPONENTE INICIADO ==========')
  console.log('[FloatingDataCards] 🎴 data recebido:', data)
  console.log('[FloatingDataCards] 🎴 data.length:', data?.length || 0)
  console.log('[FloatingDataCards] 🎴 type:', type)
  console.log('[FloatingDataCards] 🎴 Primeiro item:', data?.[0])
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Auto-scroll suave a cada 5 segundos
  useEffect(() => {
    console.log('[FloatingDataCards] 🎴 useEffect auto-scroll - data.length:', data.length)
    if (data.length <= 1) return

    const interval = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex, data.length])

  // Animação ao trocar de card
  useEffect(() => {
    setIsAnimating(true)
    const timeout = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timeout)
  }, [currentIndex])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % data.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length)
  }

  if (!data || data.length === 0) {
    console.log('[FloatingDataCards] ❌ SEM DADOS - retornando null')
    return null
  }
  
  console.log('[FloatingDataCards] ✅ RENDERIZANDO FLOATING CARDS COM', data.length, 'ITENS')

  // Pegar 3 cards visíveis (anterior, atual, próximo)
  const visibleCards = []
  for (let i = -1; i <= 1; i++) {
    const index = (currentIndex + i + data.length) % data.length
    visibleCards.push({ data: data[index], offset: i })
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
      {/* Gradiente de fade no topo */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/40 via-black/20 to-transparent pointer-events-none" />

      {/* Container de cards */}
      <div className="relative h-48 pointer-events-auto">
        {visibleCards.map(({ data: item, offset }, idx) => (
          <CompanyCard
            key={`${item.id}-${idx}`}
            company={item}
            offset={offset}
            isActive={offset === 0}
            isAnimating={isAnimating}
          />
        ))}
      </div>

      {/* Controles de navegação */}
      {data.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4 pointer-events-auto">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110"
            aria-label="Card anterior"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>

          {/* Indicadores */}
          <div className="flex gap-2">
            {data.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Ir para card ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110"
            aria-label="Próximo card"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * CompanyCard - Card individual de empresa com glassmorphism
 */
function CompanyCard({ company, offset, isActive, isAnimating }) {
  // Detectar se é um dado agregado (só tem company_name + 1 valor numérico)
  const keys = Object.keys(company)
  const isAggregateData = keys.length <= 3 && (company.total_employees !== undefined || company.num_colaboradores !== undefined || company.quantidade !== undefined)
  
  console.log('[FloatingDataCards] 🎴 CompanyCard render:', {
    companyName: company.company_name,
    keys: keys,
    isAggregateData: isAggregateData,
    isActive: isActive
  })
  
  // Gradientes por indústria
  const industryGradients = {
    'Comércio': 'from-blue-500/80 to-cyan-500/80',
    'Consultoria': 'from-purple-500/80 to-pink-500/80',
    'Tecnologia': 'from-green-500/80 to-emerald-500/80',
    'Serviços': 'from-orange-500/80 to-amber-500/80',
    'Varejo': 'from-red-500/80 to-rose-500/80',
    'Consultoria Financeira': 'from-indigo-500/80 to-blue-500/80',
    'Marketing Digital': 'from-pink-500/80 to-fuchsia-500/80',
    'Construção Civil': 'from-yellow-500/80 to-orange-500/80',
    'Alimentação': 'from-lime-500/80 to-green-500/80',
  }

  const gradient = industryGradients[company.industry] || 'from-purple-600/90 to-blue-600/90'

  // Formatação de valores
  const formatRevenue = (value) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Cálculo de posição e escala
  const getTransform = () => {
    if (offset === 0) {
      return 'translateX(0%) scale(1)'
    } else if (offset === -1) {
      return 'translateX(-110%) scale(0.85)'
    } else {
      return 'translateX(110%) scale(0.85)'
    }
  }

  return (
    <div
      className={`absolute inset-x-0 transition-all duration-500 ease-out ${
        isActive ? 'z-20' : 'z-10'
      } ${isAnimating ? 'animate-pulse' : ''}`}
      style={{
        transform: getTransform(),
        opacity: isActive ? 1 : 0.4,
      }}
    >
      <div
        className={`mx-auto max-w-md rounded-2xl backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden transform transition-all duration-300 ${
          isActive ? 'hover:scale-105 hover:shadow-3xl' : ''
        }`}
      >
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${gradient} p-4`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                {company.company_name || company.trade_name}
              </h3>
              <p className="text-sm text-white/90 line-clamp-1">
                {company.trade_name && company.trade_name !== company.company_name
                  ? company.trade_name
                  : company.company_type}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-white/80 flex-shrink-0 ml-2" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white/10 backdrop-blur-md p-4 space-y-3">
          {/* Dados Agregados (se houver) */}
          {isAggregateData && (
            <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
              <TrendingUp className="h-8 w-8 text-white flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-white/70 uppercase tracking-wide">Colaboradores</p>
                <p className="text-3xl font-bold text-white">
                  {company.total_employees || company.num_colaboradores || company.quantidade || 0}
                </p>
              </div>
            </div>
          )}
          
          {/* Receita e Indústria (se houver - dados completos) */}
          {!isAggregateData && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-white/20 rounded-lg p-2">
                <DollarSign className="h-4 w-4 text-white flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/70">Receita Anual</p>
                  <p className="text-sm font-bold text-white truncate">
                    {formatRevenue(company.annual_revenue)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/20 rounded-lg p-2">
                <TrendingUp className="h-4 w-4 text-white flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/70">Indústria</p>
                  <p className="text-sm font-bold text-white truncate">{company.industry || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contato (apenas para dados completos) */}
          {!isAggregateData && (company.email || company.phone) && (
            <div className="space-y-2">
              {company.email && (
                <div className="flex items-center gap-2 text-white/90">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <p className="text-xs truncate">{company.email}</p>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2 text-white/90">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <p className="text-xs">{company.phone}</p>
                </div>
              )}
            </div>
          )}

          {/* Endereço (apenas para dados completos) */}
          {!isAggregateData && company.address && typeof company.address === 'object' && (
            <div className="flex items-start gap-2 text-white/90">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <p className="text-xs line-clamp-2">
                {company.address.street && `${company.address.street}, `}
                {company.address.city && `${company.address.city} - `}
                {company.address.state}
              </p>
            </div>
          )}
        </div>

        {/* Footer com data (apenas para dados completos) */}
        {!isAggregateData && (
          <div className="bg-white/5 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="h-3.5 w-3.5" />
              <p className="text-xs">
              Cadastrado em {new Date(company.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <span className="text-xs font-medium text-white/90 bg-white/20 px-2 py-1 rounded-full">
            {company.company_type}
          </span>
        </div>
      </div>
    </div>
  )
}
