import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

const ForgotPasswordForm = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validar email
      if (!email || !email.includes('@')) {
        setError('Por favor, insira um email válido')
        setIsLoading(false)
        return
      }

      // Obter URL de redirecionamento baseada no ambiente atual
      // O Supabase usará esta URL para redirecionar após o usuário clicar no link do email
      // Isso garante que funciona tanto em production quanto em preview
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback?type=recovery`
        : process.env.NEXT_PUBLIC_SITE_URL 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`
          : 'https://4prosperaconnect.vercel.app/auth/callback?type=recovery'

      // Enviar email de recuperação de senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      })

      if (resetError) {
        // Traduzir mensagens de erro comuns do Supabase
        let errorMessage = resetError.message
        if (resetError.message.includes('rate limit')) {
          errorMessage = 'Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.'
        } else if (resetError.message.includes('not found')) {
          // Por segurança, não revelamos se o email existe ou não
          errorMessage = 'Se o email estiver cadastrado, você receberá um link de recuperação.'
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      // Sucesso - mostrar mensagem
      setSuccess(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Erro ao solicitar recuperação de senha:', err)
      setError('Ocorreu um erro inesperado. Por favor, tente novamente.')
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    // Limpar erro quando usuário começar a digitar
    if (error) setError(null)
    if (success) setSuccess(false)
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
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite seu email e enviaremos um link para redefinir sua senha
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
                <p className="font-semibold mb-1">Email enviado com sucesso!</p>
                <p className="text-sm">
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  Se não encontrar o email, verifique também a pasta de spam.
                </p>
              </div>
            </div>
          )}

          {!success && (
            <>
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
                      value={email}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="seu@email.com"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                      disabled={isLoading}
                    />
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
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Link de Recuperação'
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

export default ForgotPasswordForm

