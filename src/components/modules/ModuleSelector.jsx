import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModule } from '../../contexts/ModuleContext'
import { useTour } from '../../contexts/TourContext'
import { useAuth } from '../../contexts/AuthContext'
import useSuperAdmin from '../../hooks/useSuperAdmin'
import Card from '../ui/Card'
import { Users, Target, Mail, ArrowRight, HelpCircle, X, Bot, Shield } from 'lucide-react'

const ModuleSelector = () => {
  const navigate = useNavigate()
  const { selectModule, modules } = useModule()
  const { run, startTour, stopTour, steps } = useTour()
  const { isSuperAdmin, isLoading, userRole } = useSuperAdmin()
  const { user } = useAuth()

  console.log('🎯 [ModuleSelector] Estado:', { isSuperAdmin, isLoading, userRole })

  const handleTourClick = () => {
    if (run) {
      stopTour()
    } else {
      if (steps.length > 0) {
        startTour(steps)
      } else {
        // Aguardar um pouco e tentar novamente
        setTimeout(() => {
          if (steps.length > 0) {
            startTour(steps)
          }
        }, 500)
      }
    }
  }

  // Função para verificar se o usuário tem acesso ao módulo
  const hasAccessToModule = (module) => {
    // Se o módulo não tem allowedRoles, todos têm acesso
    if (!module.allowedRoles) return true
    
    // Verificar se o role do usuário está na lista de allowedRoles
    return module.allowedRoles.includes(userRole)
  }

  const moduleCards = []
  
  // Adicionar módulo PEOPLE apenas se o usuário tiver acesso
  if (hasAccessToModule(modules.PEOPLE)) {
    moduleCards.push({
      id: modules.PEOPLE.id,
      name: modules.PEOPLE.name,
      subtitle: 'Visão da Empresa',
      description: modules.PEOPLE.description,
      icon: Users,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      route: modules.PEOPLE.defaultRoute,
      features: [
        'Gerenciar colaboradores',
        'Configurar benefícios',
        'Portal do colaborador',
        'Dashboard da empresa'
      ]
    })
  }
  
  // PROSPECTING - Disponível para todos
  moduleCards.push({
    id: modules.PROSPECTING.id,
    name: modules.PROSPECTING.name,
    subtitle: 'Visão do Banco',
    description: modules.PROSPECTING.description,
    icon: Target,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600',
    route: modules.PROSPECTING.defaultRoute,
    features: [
      'Identificar prospects',
      'Enriquecer dados',
      'Scoring inteligente',
      'Análise de potencial'
    ]
  })
  
  // MARKETING - Disponível para todos
  moduleCards.push({
    id: modules.MARKETING.id,
    name: modules.MARKETING.name,
    subtitle: 'Ferramentas para o banco',
    description: modules.MARKETING.description,
    icon: Mail,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    route: modules.MARKETING.defaultRoute,
    features: [
      'Criar campanhas',
      'Email marketing',
      'Segmentação',
      'Acompanhar resultados'
    ]
  })
  
  // SPECIALIST - Disponível para todos
  moduleCards.push({
    id: modules.SPECIALIST.id,
    name: modules.SPECIALIST.name,
    subtitle: 'Inteligência Artificial Agentic',
    description: modules.SPECIALIST.description,
    icon: Bot,
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    route: modules.SPECIALIST.defaultRoute,
    features: [
      'Consultoria por voz',
      'Ações inteligentes',
      'Busca semântica',
      'Visualizações automáticas'
    ]
  })

  // Adicionar módulo Super Admin apenas se o usuário for super_admin
  if (isSuperAdmin && !isLoading) {
    console.log('✅ [ModuleSelector] Adicionando card Super Admin!')
    moduleCards.push({
      id: modules.SUPERADMIN.id,
      name: modules.SUPERADMIN.name,
      subtitle: '👑 God Mode',
      description: modules.SUPERADMIN.description,
      icon: Shield,
      color: 'bg-red-600',
      gradient: 'from-red-600 to-red-800',
      route: modules.SUPERADMIN.defaultRoute,
      features: [
        '⚡ Acesso total ao sistema',
        '🔍 SQL Console',
        '👥 Gerenciar todos os usuários',
        '🏢 Controle de empresas'
      ],
      dangerous: true
    })
  } else {
    console.log('❌ [ModuleSelector] NÃO adicionando Super Admin:', { isSuperAdmin, isLoading })
  }

  console.log('📋 [ModuleSelector] Total de cards:', moduleCards.length)
  console.log('🔐 [ModuleSelector] Acesso Gestão de Pessoas:', hasAccessToModule(modules.PEOPLE), '| Role:', userRole)

  const handleSelectModule = (moduleId, route) => {
    selectModule(moduleId)
    navigate(route)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 px-4 relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Tour Button - Floating */}
      <div className="fixed top-6 right-6 z-50">
        <button
          data-tour-id="tour-button"
          onClick={handleTourClick}
          className={`p-4 rounded-2xl shadow-2xl transition-all duration-300 relative backdrop-blur-sm ${
            run 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white scale-110' 
              : 'bg-white/90 hover:bg-white text-gray-700 hover:scale-105'
          }`}
          title={run ? 'Parar tour guiado' : 'Iniciar tour guiado'}
        >
          {run ? (
            <X className="h-6 w-6" />
          ) : (
            <HelpCircle className="h-6 w-6" />
          )}
          {run && (
            <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full animate-ping border-4 border-white"></span>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Animation */}
        <div className="text-center mb-16 animate-fade-in-down" data-tour-id="page-header">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 drop-shadow-sm">
            Bem-vindo ao 4Prospera
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
            Escolha o módulo de trabalho desejado para começar
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Module Cards - Grid Responsivo PERFEITO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16" data-tour-id="module-selector">
          {moduleCards.map((module, index) => {
            const Icon = module.icon
            const isDangerous = module.dangerous
            
            return (
              <div
                key={module.id}
                data-tour-id={module.id === 'people' ? 'module-people' : module.id === 'prospecting' ? 'module-prospecting' : module.id === 'marketing' ? 'module-marketing' : module.id === 'superadmin' ? 'module-superadmin' : 'module-specialist'}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`relative overflow-hidden group cursor-pointer h-full transform transition-all duration-500 hover:-translate-y-2 ${
                    isDangerous 
                      ? 'hover:scale-105 hover:rotate-1' 
                      : 'hover:scale-105'
                  }`}
                  onClick={() => handleSelectModule(module.id, module.route)}
                >
                  {/* Card Container */}
                  <div className={`h-full bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 ${
                    isDangerous ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-transparent hover:ring-offset-red-100' : 'hover:shadow-purple-200'
                  }`}>
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                    
                    {/* Dangerous Badge - ÉPICO */}
                    {isDangerous && (
                      <div className="absolute -top-2 -right-2 z-20">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-600 rounded-full blur-lg animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black px-4 py-2 rounded-full shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
                            ⚡ GOD MODE
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative p-6 h-full flex flex-col">
                      {/* Icon with Glow */}
                      <div className="mb-6">
                        <div className={`relative inline-flex`}>
                          {isDangerous && (
                            <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                          )}
                          <div className={`relative ${module.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                            <Icon className="h-9 w-9 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className={`text-2xl font-bold mb-2 ${isDangerous ? 'text-red-600 drop-shadow-sm' : 'text-gray-900'}`}>
                        {module.name}
                      </h2>

                      {/* Subtitle */}
                      <p className={`text-sm font-semibold mb-4 ${isDangerous ? 'text-red-500' : 'text-gray-500'}`}>
                        {module.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                        {module.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-6 flex-grow">
                        {module.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-700 transform group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${idx * 50}ms` }}>
                            <div className={`${module.color} w-1.5 h-1.5 rounded-full mr-3 mt-1.5 flex-shrink-0`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <div className={`flex items-center justify-between font-bold text-sm transition-all duration-300 ${
                        isDangerous 
                          ? 'text-red-600 group-hover:text-red-700' 
                          : 'text-indigo-600 group-hover:text-indigo-700'
                      }`}>
                        <span>Acessar módulo</span>
                        <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Info - Melhorado */}
        <div className="text-center animate-fade-in-up animation-delay-1000" data-tour-id="page-footer">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-gray-700">
              Você pode trocar de módulo a qualquer momento usando o menu superior
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  )
}

export default ModuleSelector

