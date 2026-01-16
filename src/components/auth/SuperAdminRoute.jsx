import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const SUPER_ADMIN_EMAIL = 'mariomayerlefilho@live.com'

const SuperAdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  // Aguardar carregamento da autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Verificar se é o super admin
  if (user.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta área. Esta funcionalidade está restrita ao administrador do sistema.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-blue-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  // Se for o super admin, permitir acesso
  return children
}

export default SuperAdminRoute
