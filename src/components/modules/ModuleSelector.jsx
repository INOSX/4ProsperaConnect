import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModule } from '../../contexts/ModuleContext'
import { useTour } from '../../contexts/TourContext'
import useSuperAdmin from '../../hooks/useSuperAdmin'
import Card from '../ui/Card'
import { Users, Target, Mail, ArrowRight, HelpCircle, X, Bot, Shield } from 'lucide-react'

const ModuleSelector = () => {
  const navigate = useNavigate()
  const { selectModule, modules } = useModule()
  const { run, startTour, stopTour, steps } = useTour()
  const { isSuperAdmin, isLoading } = useSuperAdmin()

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

  const moduleCards = [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    }
  ]

  // Adicionar módulo Super Admin apenas se o usuário for super_admin
  if (isSuperAdmin && !isLoading) {
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
  }

  const handleSelectModule = (moduleId, route) => {
    selectModule(moduleId)
    navigate(route)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      {/* Tour Button - Floating */}
      <div className="fixed top-4 right-4 z-50">
        <button
          data-tour-id="tour-button"
          onClick={handleTourClick}
          className={`p-3 rounded-full shadow-lg transition-all relative ${
            run 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }`}
          title={run ? 'Parar tour guiado' : 'Iniciar tour guiado'}
        >
          {run ? (
            <X className="h-5 w-5" />
          ) : (
            <HelpCircle className="h-5 w-5" />
          )}
          {run && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12" data-tour-id="page-header">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao 4Prospera
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o módulo de trabalho desejado para começar
          </p>
        </div>

        {/* Module Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-8`} data-tour-id="module-selector">
          {moduleCards.map((module) => {
            const Icon = module.icon
            const isDangerous = module.dangerous
            
            return (
              <Card
                key={module.id}
                data-tour-id={module.id === 'people' ? 'module-people' : module.id === 'prospecting' ? 'module-prospecting' : module.id === 'marketing' ? 'module-marketing' : module.id === 'superadmin' ? 'module-superadmin' : 'module-specialist'}
                className={`relative overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  isDangerous ? 'border-2 border-red-500 ring-2 ring-red-500/20' : ''
                }`}
                onClick={() => handleSelectModule(module.id, module.route)}
                hover
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Dangerous Badge */}
                {isDangerous && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ⚡ GOD MODE
                  </div>
                )}
                
                <div className="relative p-8">
                  {/* Icon */}
                  <div className={`${module.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 ${
                    isDangerous ? 'animate-pulse' : ''
                  }`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Title */}
                  <h2 className={`text-2xl font-bold mb-1 ${isDangerous ? 'text-red-600' : 'text-gray-900'}`}>
                    {module.name}
                  </h2>

                  {/* Subtitle */}
                  <p className={`text-sm font-medium mb-4 ${isDangerous ? 'text-red-500' : 'text-gray-500'}`}>
                    {module.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">
                    {module.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {module.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className={`w-1.5 h-1.5 rounded-full ${module.color} mr-2`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className={`flex items-center font-semibold transition-colors ${
                    isDangerous ? 'text-red-600 group-hover:text-red-700' : 'text-primary-600 group-hover:text-primary-700'
                  }`}>
                    <span>Acessar módulo</span>
                    <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center" data-tour-id="page-footer">
          <p className="text-sm text-gray-500">
            Você pode trocar de módulo a qualquer momento usando o menu superior
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModuleSelector

