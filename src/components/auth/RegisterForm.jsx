import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'

const RegisterForm = () => {
  const { signUp, loading, error, clearError, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Se o usuário já estiver autenticado, redirecionar para o dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) clearError()
  }

  const [validationError, setValidationError] = useState(null)

  const validateForm = () => {
    setValidationError(null)
    
    if (!formData.fullName || formData.fullName.trim() === '') {
      setValidationError('Nome completo é obrigatório')
      return false
    }
    
    if (!formData.email || formData.email.trim() === '') {
      setValidationError('Email é obrigatório')
      return false
    }
    
    if (!formData.email.includes('@')) {
      setValidationError('Email inválido')
      return false
    }
    
    if (formData.password.length < 6) {
      setValidationError('A senha deve ter pelo menos 6 caracteres')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('As senhas não coincidem')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    setValidationError(null)
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.fullName
      })
      
      if (result.success) {
        setSuccess(true)
        
        // Se o usuário foi autenticado automaticamente (sem confirmação de email)
        // Aguardar um pouco para o AuthContext atualizar e então redirecionar
        setTimeout(() => {
          if (user) {
            navigate('/', { replace: true })
          }
        }, 1000)
      } else {
        // O erro já será exibido pelo AuthContext
        console.error('Erro ao criar conta:', result.error)
      }
    } catch (err) {
      console.error('Erro inesperado ao criar conta:', err)
      setValidationError(err.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Conta criada com sucesso! 🎉
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sua conta foi criada. Você pode fazer login agora.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Se a confirmação de email estiver ativada, verifique sua caixa de entrada.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-blue-600 text-white hover:from-orange-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Ir para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* Logo/Nome da Aplicação */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
              4Prospera Connect
            </h1>
            <p className="text-sm text-gray-500 font-medium">Dashboard Inteligente</p>
          </div>
          
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-blue-500 shadow-lg">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/login"
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
            >
              faça login na sua conta existente
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error || validationError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Nome completo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Seu nome completo"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="seu@email.com"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Mínimo 6 caracteres"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Confirmar senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Confirme sua senha"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || loading}
              className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-blue-600 text-white hover:from-orange-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {isLoading || loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </div>
              ) : (
                'Criar conta'
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link to="/terms" className="text-orange-600 hover:text-orange-500 transition-colors">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link to="/privacy" className="text-orange-600 hover:text-orange-500 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
