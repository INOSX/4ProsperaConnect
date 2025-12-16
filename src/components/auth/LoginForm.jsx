import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const LoginForm = () => {
  const { signIn, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await signIn(formData.email, formData.password)
    
    if (result?.success) {
      // Redireciona para a rota originalmente requisitada ou dashboard
      navigate(from, { replace: true })
    }
    // Em qualquer caso, encerra o loading
    setIsLoading(false)
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
            <LogIn className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Entre na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
            >
              crie uma nova conta
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-4">
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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Sua senha"
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
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
              >
                Esqueceu sua senha?
              </Link>
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
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
