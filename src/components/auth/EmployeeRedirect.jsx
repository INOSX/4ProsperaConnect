import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'

/**
 * Componente que redireciona company_employee para seu dashboard pessoal
 * Outros roles passam direto
 */
const EmployeeRedirect = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Só verifica uma vez por mudança de usuário
    if (!hasChecked && user) {
      checkAndRedirect()
    }
  }, [user, hasChecked])

  const checkAndRedirect = async () => {
    if (!user) return

    // Se já estiver na rota de employee, não faz nada
    if (location.pathname.startsWith('/people/employees/')) {
      console.log('✅ [EmployeeRedirect] Já está no dashboard do employee, não redireciona')
      setHasChecked(true)
      return
    }

    try {
      console.log('🔍 [EmployeeRedirect] Verificando role do usuário...')

      // Buscar role do usuário na tabela clients
      const { data: clientData, error } = await supabase
        .from('clients')
        .select('role, id')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('❌ [EmployeeRedirect] Erro ao buscar role:', error)
        setHasChecked(true)
        return
      }

      const userRole = clientData?.role
      console.log('✅ [EmployeeRedirect] Role encontrado:', userRole)

      // Se for company_employee, buscar o employee_id e redirecionar
      if (userRole === 'company_employee') {
        console.log('🔄 [EmployeeRedirect] É company_employee, buscando employee_id...')

        // Buscar o employee vinculado ao user_id
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('platform_user_id', user.id)
          .single()

        if (employeeError) {
          console.error('❌ [EmployeeRedirect] Erro ao buscar employee:', employeeError)
          setHasChecked(true)
          return
        }

        if (employeeData?.id) {
          console.log('✅ [EmployeeRedirect] Redirecionando para dashboard:', employeeData.id)
          setIsRedirecting(true)
          setHasChecked(true)
          navigate(`/people/employees/${employeeData.id}`, { replace: true })
        } else {
          console.warn('⚠️ [EmployeeRedirect] Employee não encontrado para user_id:', user.id)
          setHasChecked(true)
        }
      } else {
        console.log('✅ [EmployeeRedirect] Não é company_employee, continua navegação normal')
        setHasChecked(true)
      }
    } catch (error) {
      console.error('❌ [EmployeeRedirect] Erro geral:', error)
      setHasChecked(true)
    }
  }

  // Enquanto não verificou, mostra loading (evita renderizar ModuleSelector antes de saber se é employee)
  if (!hasChecked) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Verificando permissões...</div>
      </div>
    )
  }

  // Se estiver redirecionando, mostra loading
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Redirecionando para seu dashboard...</div>
      </div>
    )
  }

  return <>{children}</>
}

export default EmployeeRedirect
