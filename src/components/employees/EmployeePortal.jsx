import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { EmployeeService } from '../../services/employeeService'
import { RecommendationService } from '../../services/recommendationService'
import Card from '../ui/Card'
import { Package, Gift, TrendingUp, CheckCircle } from 'lucide-react'

const EmployeePortal = () => {
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [benefits, setBenefits] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadEmployeeData()
    }
  }, [user])

  const loadEmployeeData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Buscar dados do colaborador
      const employeeResult = await EmployeeService.getEmployeeByUserId(user.id)
      if (employeeResult.success && employeeResult.employee) {
        setEmployee(employeeResult.employee)

        // Carregar benefícios e recomendações
        await Promise.all([
          loadBenefits(employeeResult.employee.id),
          loadRecommendations(employeeResult.employee.id)
        ])
      }
    } catch (error) {
      console.error('Error loading employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBenefits = async (employeeId) => {
    try {
      const result = await EmployeeService.getEmployeeBenefits(employeeId)
      if (result.success) {
        setBenefits(result.benefits || [])
      }
    } catch (error) {
      console.error('Error loading benefits:', error)
    }
  }

  const loadRecommendations = async (employeeId) => {
    try {
      const result = await RecommendationService.getRecommendations('employee', employeeId)
      if (result.success) {
        setRecommendations(result.recommendations || [])
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const handleAcceptRecommendation = async (recommendationId) => {
    try {
      await RecommendationService.trackRecommendation(recommendationId, 'accepted')
      await loadRecommendations(employee?.id)
    } catch (error) {
      console.error('Error accepting recommendation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Você não está vinculado a nenhuma empresa</p>
        <p className="text-sm text-gray-400 mt-2">Entre em contato com o administrador da sua empresa</p>
      </div>
    )
  }

  const activeBenefits = benefits.filter(b => b.status === 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portal do Colaborador</h1>
        <p className="text-gray-600">Bem-vindo, {employee.name}!</p>
      </div>

      {/* Meus Benefícios */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Meus Benefícios</span>
            </h2>
            <span className="text-sm text-gray-600">{activeBenefits.length} ativo{activeBenefits.length !== 1 ? 's' : ''}</span>
          </div>

          {activeBenefits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Você ainda não possui benefícios ativos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBenefits.map((benefit) => (
                <div key={benefit.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {benefit.company_benefits?.name || 'Benefício'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {benefit.company_benefits?.description || ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Ativo desde {new Date(benefit.activation_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Recomendações Personalizadas */}
      {recommendations.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Recomendações para Você</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <p className="font-medium text-gray-900">{rec.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  {rec.reasoning && (
                    <p className="text-xs text-gray-500 mt-2 italic">{rec.reasoning}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      Prioridade: {rec.priority}/10
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRecommendation(rec.id)}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => RecommendationService.trackRecommendation(rec.id, 'rejected')}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Informações do Colaborador */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Minhas Informações</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cargo</p>
              <p className="text-base font-medium text-gray-900">{employee.position || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Departamento</p>
              <p className="text-base font-medium text-gray-900">{employee.department || '-'}</p>
            </div>
            {employee.hire_date && (
              <div>
                <p className="text-sm text-gray-600">Data de Admissão</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(employee.hire_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EmployeePortal

