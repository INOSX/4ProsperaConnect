import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ClientService } from '../../services/clientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { AlertCircle, Shield } from 'lucide-react'

/**
 * Componente para proteger rotas que requerem permissão de admin
 * Redireciona usuários não-admin para a página inicial
 */
const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    } else {
      setLoading(false)
    }
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const clientResult = await ClientService.getClientByUserId(user.id)
      if (clientResult.success && clientResult.client) {
        const role = clientResult.client.role
        const userIsAdmin = ['super_admin', 'bank_manager', 'admin'].includes(role)
        console.log('🔐 [AdminRoute] User role:', role, '| isAdmin:', userIsAdmin)
        setIsAdmin(userIsAdmin)
        if (!userIsAdmin) {
          // Redirecionar após um pequeno delay para mostrar mensagem
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }
      } else {
        setIsAdmin(false)
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <div className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-gray-600 mb-4">
              Esta página é restrita apenas para administradores.
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

export default AdminRoute

