/**
 * Extrator de parâmetros de comandos de voz
 */
export function extractParams(text, intent) {
  const params = {}
  const lowerText = text.toLowerCase()

  // Extrair CNPJ
  const cnpjMatch = text.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/)
  if (cnpjMatch) {
    params.cnpj = cnpjMatch[0].replace(/\D/g, '')
  }

  // Extrair CPF
  const cpfMatch = text.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/)
  if (cpfMatch) {
    params.cpf = cpfMatch[0].replace(/\D/g, '')
  }

  // Extrair ID
  const idMatch = text.match(/(?:id|identificador)\s*:?\s*(\w+)/i)
  if (idMatch) {
    params.id = idMatch[1]
  }

  // Extrair nome
  const namePatterns = [
    /nome\s+(?:é|de|da|do)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /chamad[ao]\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ]
  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match) {
      params.name = match[1].trim()
      break
    }
  }

  // Extrair email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    params.email = emailMatch[0]
  }

  // Extrair números
  const numberMatch = text.match(/(\d+)/)
  if (numberMatch && !params.id) {
    params.id = numberMatch[1]
  }

  return params
}

