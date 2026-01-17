import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

/**
 * Hook para verificar se o usuário atual é Super Admin
 * @returns {Object} { isSuperAdmin, isLoading, user, userRole }
 */
export const useSuperAdmin = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    checkSuperAdmin()
  }, [])

  const checkSuperAdmin = async () => {
    try {
      setIsLoading(true)

      // Obter usuário autenticado
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        setIsSuperAdmin(false)
        setIsLoading(false)
        return
      }

      setUser(authUser)

      // Buscar role do usuário na tabela clients
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('role')
        .eq('user_id', authUser.id)
        .single()

      if (clientError) {
        console.error('Erro ao verificar role:', clientError)
        setIsSuperAdmin(false)
        setUserRole(null)
      } else {
        const role = clientData?.role
        setUserRole(role)
        setIsSuperAdmin(role === 'super_admin')
      }
    } catch (error) {
      console.error('Erro ao verificar super admin:', error)
      setIsSuperAdmin(false)
      setUserRole(null)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSuperAdmin,
    isLoading,
    user,
    userRole
  }
}

export default useSuperAdmin
