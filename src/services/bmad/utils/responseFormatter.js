/**
 * Formatador de respostas para apresentação ao usuário
 */
export function formatResponse(data, intent) {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return 'Nenhum resultado encontrado.'
    }
    return `Encontrei ${data.length} resultado${data.length !== 1 ? 's' : ''}.`
  }

  if (typeof data === 'object') {
    return 'Operação realizada com sucesso!'
  }

  return String(data)
}

export function formatError(error) {
  if (typeof error === 'string') {
    return error
  }
  if (error?.message) {
    return error.message
  }
  return 'Ocorreu um erro ao processar sua solicitação.'
}

