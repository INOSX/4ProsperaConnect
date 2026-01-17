import React from 'react'
import { Navigate } from 'react-router-dom'
import useSuperAdmin from '../../hooks/useSuperAdmin'
import Loading from '../ui/Loading'

/**
 * Componente de proteção de rota para Super Admin
 * Só permite acesso se o usuário for super_admin
 */
const SuperAdminGuard = ({ children }) => {
  const { isSuperAdmin, isLoading } = useSuperAdmin()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default SuperAdminGuard
