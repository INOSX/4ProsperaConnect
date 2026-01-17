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

      console.log('🔍 [useSuperAdmin] Verificando super admin...', { authUser: authUser?.email })

      if (authError || !authUser) {
        console.log('❌ [useSuperAdmin] Sem usuário autenticado')
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

      console.log('📊 [useSuperAdmin] Resultado da query:', { clientData, clientError })

      if (clientError) {
        console.error('❌ [useSuperAdmin] Erro ao verificar role:', clientError)
        setIsSuperAdmin(false)
        setUserRole(null)
      } else {
        const role = clientData?.role
        setUserRole(role)
        const isSA = role === 'super_admin'
        console.log('✅ [useSuperAdmin] Role verificada:', { role, isSuperAdmin: isSA })
        setIsSuperAdmin(isSA)
      }
    } catch (error) {
      console.error('❌ [useSuperAdmin] Erro geral:', error)
      setIsSuperAdmin(false)
      setUserRole(null)
    } finally {
      setIsLoading(false)
      console.log('🏁 [useSuperAdmin] Verificação finalizada')
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
