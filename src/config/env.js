// Configuração de variáveis de ambiente
export const config = {
  supabase: {
    url: import.meta.env.SUPABASE_URL || '',
    anonKey: import.meta.env.SUPABASE_ANON_KEY || '',
  },
  // OPENAI_API_KEY não deve estar no frontend - usar API routes do backend
  // openai: {
  //   apiKey: import.meta.env.OPENAI_API_KEY || '',
  // }
  // OpenAI Assistant ID fixo
  openai: {
    assistantId: 'asst_wC8j4cN0pgmVqEAgVNJbFgVy',
  }
}

// Validação das variáveis obrigatórias
export const validateEnv = () => {
  const errors = []
  
  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required')
  }
  
  if (!config.supabase.anonKey) {
    errors.push('SUPABASE_ANON_KEY is required')
  }
  
  if (errors.length > 0) {
    console.error('Environment validation failed:', errors)
    throw new Error(`Missing required environment variables: ${errors.join(', ')}`)
  }
  
  return true
}

// Validar no carregamento
validateEnv()
