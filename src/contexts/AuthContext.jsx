import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, auth } from '../services/supabase'
import { ClientService } from '../services/clientService'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Obter sessão inicial e processar tokens de confirmação de email
    const getInitialSession = async () => {
      try {
        // Verificar se há um token na URL (confirmação de email)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        
        // Processar token de confirmação se presente
        if (accessToken && type === 'recovery') {
          // Token de recuperação de senha
          const { data, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Erro ao processar token de recuperação:', error)
          }
        }

        // Obter sessão atual
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_OUT') {
          setError(null)
        }
        
        // Se o email foi confirmado, limpar erros
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setError(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      // Validações básicas
      if (!email || !email.includes('@')) {
        const errorMsg = 'Email inválido'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      
      if (!password) {
        const errorMsg = 'Senha é obrigatória'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        // Traduzir mensagens de erro comuns do Supabase
        let errorMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login.'
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Usuário não encontrado. Verifique seu email ou crie uma conta.'
        }
        
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      return { success: true, data }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao fazer login. Tente novamente.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      // Validações básicas
      if (!email || !email.includes('@')) {
        const errorMsg = 'Email inválido'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      
      if (!password || password.length < 6) {
        const errorMsg = 'A senha deve ter pelo menos 6 caracteres'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        // Traduzir mensagens de erro comuns do Supabase
        let errorMessage = error.message
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email inválido. Verifique o formato do email.'
        } else if (error.message.includes('Password')) {
          errorMessage = 'A senha não atende aos requisitos de segurança.'
        }
        
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Se o usuário foi criado com sucesso, tentar criar cliente automaticamente
      // Isso é opcional - o registro não falha se a criação do cliente falhar
      if (data.user) {
        try {
          const clientResult = await ClientService.createClient({
            name: userData.full_name || email.split('@')[0],
            email: email,
            userId: data.user.id
          })

          if (!clientResult.success) {
            console.warn('Usuário criado, mas falha ao criar cliente:', clientResult.error)
            // Não falhar o registro por causa do cliente, apenas logar o erro
            // O usuário pode criar o cliente manualmente depois se necessário
          } else {
            console.log('Cliente criado com sucesso para o usuário:', data.user.id)
          }
        } catch (clientError) {
          console.warn('Erro ao criar cliente após registro:', clientError)
          // Não falhar o registro por causa do cliente
          // Isso pode acontecer se a tabela clients não existir ainda
        }
      }
      
      return { success: true, data }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao criar conta. Tente novamente.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await auth.signOut()
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
