import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'

/**
 * Componente que redireciona company_employee para seu dashboard pessoal
 * Outros roles passam direto
 */
const EmployeeRedirect = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    checkAndRedirect()
  }, [user])

  const checkAndRedirect = async () => {
    if (!user) return

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
        return
      }

      const userRole = clientData?.role
      console.log('✅ [EmployeeRedirect] Role encontrado:', userRole)

      // Se for company_employee, buscar o employee_id e redirecionar
      if (userRole === 'company_employee') {
        console.log('🔄 [EmployeeRedirect] É company_employee, buscando employee_id...')

        // Buscar o employee vinculado ao client
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('client_id', clientData.id)
          .single()

        if (employeeError) {
          console.error('❌ [EmployeeRedirect] Erro ao buscar employee:', employeeError)
          return
        }

        if (employeeData?.id) {
          console.log('✅ [EmployeeRedirect] Redirecionando para dashboard:', employeeData.id)
          setIsRedirecting(true)
          navigate(`/people/employees/${employeeData.id}`)
        }
      } else {
        console.log('✅ [EmployeeRedirect] Não é company_employee, continua navegação normal')
      }
    } catch (error) {
      console.error('❌ [EmployeeRedirect] Erro geral:', error)
    }
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
