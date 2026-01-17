import React from 'react'
import { Users } from 'lucide-react'
import Card from '../ui/Card'

const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" />
          Gerenciamento de Usuários
        </h1>
        <p className="text-gray-400 mt-1">Controle total sobre todos os usuários da plataforma</p>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-8">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Em Desenvolvimento</h3>
          <p className="text-gray-400">
            O gerenciamento completo de usuários estará disponível na Fase 2
          </p>
        </div>
      </Card>
    </div>
  )
}

export default UserManagement
