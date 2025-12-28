import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

const ResetPasswordForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    // Verificar se há uma sessão válida (necessária para redefinir senha)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Sessão inválida ou expirada. Por favor, solicite um novo link de recuperação.')
        setTimeout(() => {
          navigate('/forgot-password', { replace: true })
        }, 3000)
      } else {
        setHasSession(true)
      }
    }
    checkSession()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) setError(null)
    if (success) setSuccess(false)
  }

  const validatePassword = (password) => {
    // Mínimo 6 caracteres (requisito do Supabase)
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validar senhas
      if (!formData.password || !formData.confirmPassword) {
        setError('Por favor, preencha todos os campos')
        setIsLoading(false)
        return
      }

      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        setError(passwordError)
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem')
        setIsLoading(false)
        return
      }

      // Verificar sessão novamente
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Sessão expirada. Por favor, solicite um novo link de recuperação.')
        setIsLoading(false)
        setTimeout(() => {
          navigate('/forgot-password', { replace: true })
        }, 3000)
        return
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (updateError) {
        let errorMessage = updateError.message
        if (updateError.message.includes('same')) {
          errorMessage = 'A nova senha deve ser diferente da senha atual'
        } else if (updateError.message.includes('weak')) {
          errorMessage = 'A senha é muito fraca. Use uma senha mais forte.'
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      // Sucesso
      setSuccess(true)
      setIsLoading(false)

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    } catch (err) {
      console.error('Erro ao redefinir senha:', err)
      setError('Ocorreu um erro inesperado. Por favor, tente novamente.')
      setIsLoading(false)
    }
  }

  if (!hasSession && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando sessão...</p>
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
              4Prospera
            </h1>
            <p className="text-sm text-gray-500 font-medium">Dashboard Inteligente</p>
          </div>
          
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-blue-500 shadow-lg">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Redefinir Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite sua nova senha abaixo
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Senha redefinida com sucesso!</p>
                <p className="text-sm">
                  Redirecionando para o login...
                </p>
              </div>
            </div>
          )}

          {!success && (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Nova Senha
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
                      disabled={isLoading}
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
                  <p className="mt-1 text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Confirmar Nova Senha
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
                      placeholder="Digite a senha novamente"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                      disabled={isLoading}
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
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-blue-600 text-white hover:from-orange-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redefinindo...
                    </div>
                  ) : (
                    'Redefinir Senha'
                  )}
                </button>
              </div>
            </>
          )}

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordForm

