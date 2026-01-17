import React from 'react'
import { Navigate } from 'react-router-dom'
import useSuperAdmin from '../../hooks/useSuperAdmin'
import Loading from '../ui/Loading'

console.log('🔥🔥🔥 SuperAdminGuard.jsx CARREGADO! 🔥🔥🔥')

/**
 * Componente de proteção de rota para Super Admin
 * Só permite acesso se o usuário for super_admin
 */
const SuperAdminGuard = ({ children }) => {
  console.log('🛡️🛡️🛡️ [SuperAdminGuard] Guard está executando!')
  
  const { isSuperAdmin, isLoading, userRole } = useSuperAdmin()

  console.log('🛡️ [SuperAdminGuard] Estado:', { isSuperAdmin, isLoading, userRole })

  if (isLoading) {
    console.log('⏳ [SuperAdminGuard] Ainda carregando...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    )
  }

  if (!isSuperAdmin) {
    console.error('❌❌❌ [SuperAdminGuard] NÃO É SUPER ADMIN! Redirecionando para /')
    console.error('❌ isSuperAdmin:', isSuperAdmin)
    console.error('❌ userRole:', userRole)
    return <Navigate to="/" replace />
  }

  console.log('✅✅✅ [SuperAdminGuard] É SUPER ADMIN! Permitindo acesso!')
  return children
}

export default SuperAdminGuard
