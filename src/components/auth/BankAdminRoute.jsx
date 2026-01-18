import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ClientService } from '../../services/clientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { AlertCircle, Shield } from 'lucide-react'

/**
 * Componente para proteger rotas que requerem permissão de Admin do Banco
 * Redireciona usuários não-admin para a página inicial
 */
const BankAdminRoute = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isBankAdmin, setIsBankAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkBankAdminStatus()
    } else {
      setLoading(false)
    }
  }, [user])

  const checkBankAdminStatus = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const clientResult = await ClientService.getClientByUserId(user.id)
      if (clientResult.success && clientResult.client) {
        const userRole = clientResult.client.role
        // Permitir acesso para super_admin, bank_manager e admin (legado)
        const hasAccess = userRole === 'super_admin' || userRole === 'bank_manager' || userRole === 'admin'
        
        console.log('🔍 [BankAdminRoute] Role:', userRole, '| Acesso:', hasAccess)
        
        setIsBankAdmin(hasAccess)
        if (!hasAccess) {
          // Redirecionar após um pequeno delay para mostrar mensagem
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }
      } else {
        setIsBankAdmin(false)
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (error) {
      console.error('Error checking bank admin status:', error)
      setIsBankAdmin(false)
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

  if (!isBankAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <div className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-gray-600 mb-4">
              Esta página é restrita para administradores do banco e super admins.
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

export default BankAdminRoute

