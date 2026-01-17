import React from 'react'
import { Building2 } from 'lucide-react'
import Card from '../ui/Card'

const CompanyManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Building2 className="h-8 w-8 text-green-500" />
          Gerenciamento de Empresas
        </h1>
        <p className="text-gray-400 mt-1">Controle total sobre todas as empresas cadastradas</p>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-8">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Em Desenvolvimento</h3>
          <p className="text-gray-400">
            O gerenciamento completo de empresas estará disponível na Fase 2
          </p>
        </div>
      </Card>
    </div>
  )
}

export default CompanyManagement
