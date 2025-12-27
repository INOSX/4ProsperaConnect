/**
 * Validador de queries SQL
 */
export function validateSQLQuery(query) {
  // Apenas SELECT permitido
  const upperQuery = query.trim().toUpperCase()
  
  if (!upperQuery.startsWith('SELECT')) {
    return {
      valid: false,
      error: 'Apenas queries SELECT são permitidas'
    }
  }

  // Verificar comandos perigosos
  const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE']
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      return {
        valid: false,
        error: `Comando ${keyword} não é permitido`
      }
    }
  }

  return {
    valid: true
  }
}

export function sanitizeQuery(query) {
  // Remover comentários
  let sanitized = query.replace(/--.*$/gm, '')
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '')

  // Limitar tamanho
  if (sanitized.length > 10000) {
    throw new Error('Query muito longa')
  }

  return sanitized.trim()
}

