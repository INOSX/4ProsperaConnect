import React from 'react'
import { Terminal, AlertTriangle } from 'lucide-react'
import Card from '../ui/Card'

const SQLConsole = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Terminal className="h-8 w-8 text-red-500" />
          Console SQL
        </h1>
        <p className="text-gray-400 mt-1">⚠️ Acesso direto ao banco de dados - USE COM EXTREMO CUIDADO</p>
      </div>

      <Card className="bg-red-900/20 border-red-800 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-2">⚠️ ZONA DE PERIGO</h3>
            <p className="text-gray-300 text-sm">
              O Console SQL permite executar qualquer query no banco de dados.
              Todas as ações são registradas e rastreáveis.
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-8">
        <div className="text-center">
          <Terminal className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Em Desenvolvimento</h3>
          <p className="text-gray-400">
            O Console SQL estará disponível na Fase 3
          </p>
        </div>
      </Card>
    </div>
  )
}

export default SQLConsole
