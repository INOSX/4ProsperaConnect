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

      // ✅ GARANTIR que o cliente seja criado em public.clients
      // Isso é CRÍTICO para que o usuário tenha acesso à plataforma
      if (data.user) {
        try {
          // Tentar criar via API (que cria recursos OpenAI também)
          const clientResult = await ClientService.createClient({
            name: userData.full_name || email.split('@')[0],
            email: email,
            userId: data.user.id
          })

          if (clientResult.success) {
            console.log('✅ Cliente criado com sucesso (com recursos OpenAI):', data.user.id)
          } else {
            console.warn('⚠️ Falha ao criar cliente via API, tentando criação direta...', clientResult.error)
            
            // ✅ FALLBACK: Criar registro direto em clients (sem OpenAI)
            // Isso garante que o usuário tenha acesso mesmo se OpenAI falhar
            try {
              const { data: directClient, error: directError } = await supabase
                .from('clients')
                .insert({
                  user_id: data.user.id,
                  client_code: 'CLI-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                  name: userData.full_name || email.split('@')[0],
                  email: email,
                  role: 'admin' // ✅ Sempre admin por padrão
                })
                .select()
                .single()
              
              if (directError && directError.code !== '23505') { // Ignorar erro de duplicata
                console.error('❌ Erro crítico ao criar cliente:', directError)
              } else {
                console.log('✅ Cliente criado diretamente (fallback) com sucesso!')
              }
            } catch (fallbackError) {
              console.error('❌ Erro no fallback de criação de cliente:', fallbackError)
            }
          }
        } catch (clientError) {
          console.error('❌ Erro ao criar cliente:', clientError)
          
          // ✅ ÚLTIMO RECURSO: Garantir que o registro existe
          try {
            const { error: emergencyError } = await supabase
              .from('clients')
              .upsert({
                user_id: data.user.id,
                client_code: 'CLI-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                name: userData.full_name || email.split('@')[0],
                email: email,
                role: 'admin'
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: true
              })
            
            if (!emergencyError) {
              console.log('✅ Cliente garantido via upsert de emergência')
            }
          } catch (emergencyError) {
            console.error('❌ Falha total ao criar cliente:', emergencyError)
          }
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
