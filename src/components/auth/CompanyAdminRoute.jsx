import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ClientService } from '../../services/clientService'
import { isCompanyAdminAny } from '../../services/employeeService'
import { canManageEmployees } from '../../utils/permissions'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { AlertCircle, Shield } from 'lucide-react'

/**
 * Componente para proteger rotas que requerem ser Admin do Banco OU Admin do Cliente
 * Redireciona usuários sem permissão para a página inicial
 */
const CompanyAdminRoute = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hasPermission, setHasPermission] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkPermissions()
    } else {
      setLoading(false)
    }
  }, [user])

  const checkPermissions = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Verificar se é Admin do Banco
      const clientResult = await ClientService.getClientByUserId(user.id)
      let userIsBankAdmin = false
      if (clientResult.success && clientResult.client) {
        userIsBankAdmin = clientResult.client.role === 'admin'
      }

      // Verificar se é Admin do Cliente
      const userIsCompanyAdmin = await isCompanyAdminAny(user.id)

      // Verificar se tem permissão para gerenciar colaboradores
      const canManage = canManageEmployees(userIsBankAdmin ? 'admin' : 'user', userIsCompanyAdmin)
      setHasPermission(canManage)

      if (!canManage) {
        // Redirecionar após um pequeno delay para mostrar mensagem
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setHasPermission(false)
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Verificando permissões...</div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <div className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-gray-600 mb-4">
              Esta página requer permissões de administrador do banco ou administrador da empresa.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Você será redirecionado em instantes...
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar para o Início
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

export default CompanyAdminRoute

