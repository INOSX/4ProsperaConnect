/**
 * 🎯 COMPONENTE UNIFICADO DE INTEGRAÇÕES
 * Combina Conexões de Dados (banco de dados) e APIs de Prospecção
 */

import React, { useState } from 'react'
import { Database, Zap } from 'lucide-react'
import DataConnections from './DataConnections'
import APIIntegrations from './APIIntegrations'

const IntegrationsHub = () => {
  const [activeTab, setActiveTab] = useState('databases')

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-gray-600">Gerencie conexões de banco de dados e APIs externas</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('databases')}
            className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'databases'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="h-5 w-5" />
            <span>Conexões de Dados</span>
          </button>

          <button
            onClick={() => setActiveTab('apis')}
            className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'apis'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap className="h-5 w-5" />
            <span>APIs de Prospecção</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'databases' && (
          <div key="databases-tab">
            <DataConnections />
          </div>
        )}

        {activeTab === 'apis' && (
          <div key="apis-tab">
            <APIIntegrations key="api-integrations" />
          </div>
        )}
      </div>
    </div>
  )
}

export default IntegrationsHub
