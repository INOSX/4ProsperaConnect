import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Processando confirmação de email...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // O Supabase detecta automaticamente tokens na URL quando detectSessionInUrl: true
        // Verificar se há um token na URL (pode estar em hash ou query params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        
        // Também verificar query params
        const token = searchParams.get('token') || hashParams.get('token')
        const tokenType = searchParams.get('type') || type

        // Se houver token, o Supabase já processou automaticamente
        // Apenas verificar a sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError)
          setStatus('error')
          setMessage(sessionError.message || 'Erro ao confirmar email. O link pode ter expirado.')
          
          setTimeout(() => {
            navigate('/login', { replace: true })
          }, 3000)
          return
        }

        if (session?.user) {
          // Verificar se é recuperação de senha
          if (tokenType === 'recovery' || type === 'recovery') {
            setStatus('success')
            setMessage('Link de recuperação verificado! Redirecionando para redefinir senha...')
            
            // Limpar hash da URL
            window.history.replaceState({}, document.title, window.location.pathname)
            
            setTimeout(() => {
              navigate('/reset-password', { replace: true })
            }, 2000)
            return
          }
          
          setStatus('success')
          setMessage('Email confirmado com sucesso! Redirecionando...')
          
          // Limpar hash da URL
          window.history.replaceState({}, document.title, window.location.pathname)
          
          setTimeout(() => {
            navigate('/modules', { replace: true })
          }, 2000)
          return
        }

        // Se não houver sessão mas houver token, aguardar um pouco
        if (token || accessToken) {
          // Aguardar processamento do Supabase
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { data: { session: newSession } } = await supabase.auth.getSession()
          if (newSession?.user) {
            setStatus('success')
            setMessage('Email confirmado com sucesso! Redirecionando...')
            window.history.replaceState({}, document.title, window.location.pathname)
            setTimeout(() => {
              navigate('/modules', { replace: true })
            }, 2000)
            return
          }
        }

        // Se não houver token nem sessão, redirecionar para login
        setStatus('error')
        setMessage('Link inválido ou expirado. Redirecionando para login...')
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      } catch (error) {
        console.error('Erro ao processar callback:', error)
        setStatus('error')
        setMessage('Erro ao processar confirmação. Tente novamente.')
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-blue-500 shadow-lg mb-4">
                <Loader2 className="h-7 w-7 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Processando...
              </h2>
              <p className="text-sm text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg mb-4">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Sucesso! ✅
              </h2>
              <p className="text-sm text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-red-500 shadow-lg mb-4">
                <XCircle className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Erro
              </h2>
              <p className="text-sm text-gray-600">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallback

