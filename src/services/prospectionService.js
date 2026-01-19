/**
 * 🔥 PARTY-MODE: Serviço Unificado de Prospecção de Empresas
 * Integra múltiplas APIs para enriquecimento de dados empresariais
 */

// Cache em memória (30 minutos)
const cache = new Map()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos

/**
 * Limpar CNPJ (remover pontuação)
 */
const cleanCNPJ = (cnpj) => {
  return cnpj.replace(/[^\d]/g, '')
}

/**
 * Verificar se tem dados em cache
 */
const getFromCache = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ [ProspectionService] Dados encontrados no cache:', key)
    return cached.data
  }
  return null
}

/**
 * Salvar no cache
 */
const saveToCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
  console.log('💾 [ProspectionService] Dados salvos no cache:', key)
}

/**
 * 1. OpenCNPJ API (GRATUITA - sempre disponível)
 */
export const fetchOpenCNPJ = async (cnpj) => {
  const cleanedCNPJ = cleanCNPJ(cnpj)
  const cacheKey = `opencnpj_${cleanedCNPJ}`
  
  // Verificar cache
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    console.log('🔍 [OpenCNPJ] Consultando:', cleanedCNPJ)
    const response = await fetch(`https://api.opencnpj.org/${cleanedCNPJ}`)
    
    if (response.status === 404) {
      console.warn('⚠️ [OpenCNPJ] CNPJ não encontrado na base de dados')
      return null
    }
    
    if (!response.ok) {
      throw new Error(`OpenCNPJ API returned ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [OpenCNPJ] Dados recebidos:', data)
    
    // Salvar em cache
    saveToCache(cacheKey, data)
    
    return data
  } catch (error) {
    if (error.message.includes('404')) {
      console.warn('⚠️ [OpenCNPJ] CNPJ não encontrado')
      return null
    }
    console.error('❌ [OpenCNPJ] Erro:', error)
    throw error
  }
}

/**
 * 2. CNPJ.ws API (FREEMIUM - requer API key configurada)
 */
export const fetchCNPJws = async (cnpj, apiKey) => {
  if (!apiKey) {
    console.warn('⚠️ [CNPJ.ws] API Key não configurada')
    return null
  }

  const cleanedCNPJ = cleanCNPJ(cnpj)
  const cacheKey = `cnpjws_${cleanedCNPJ}`
  
  // Verificar cache
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    console.log('🔍 [CNPJ.ws] Consultando:', cleanedCNPJ)
    const response = await fetch(`https://www.cnpj.ws/cnpj/${cleanedCNPJ}`, {
      headers: {
        'Authorization': apiKey
      }
    })
    
    if (!response.ok) {
      throw new Error(`CNPJ.ws API returned ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [CNPJ.ws] Dados recebidos:', data)
    
    // Salvar em cache
    saveToCache(cacheKey, data)
    
    return data
  } catch (error) {
    console.error('❌ [CNPJ.ws] Erro:', error)
    return null
  }
}

/**
 * 3. Valida API (PREMIUM - requer token)
 */
export const fetchValidaAPI = async (cnpj, token) => {
  if (!token) {
    console.warn('⚠️ [Valida API] Token não configurado')
    return null
  }

  const cleanedCNPJ = cleanCNPJ(cnpj)
  const cacheKey = `valida_${cleanedCNPJ}`
  
  // Verificar cache
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    console.log('🔍 [Valida API] Consultando:', cleanedCNPJ)
    const response = await fetch(`https://valida.api.br/cnpj/${cleanedCNPJ}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Valida API returned ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [Valida API] Dados recebidos:', data)
    
    // Salvar em cache
    saveToCache(cacheKey, data)
    
    return data
  } catch (error) {
    console.error('❌ [Valida API] Erro:', error)
    return null
  }
}

/**
 * 4. Google Places API (PAY-AS-YOU-GO - requer API key)
 */
export const fetchGooglePlaces = async (companyName, address, apiKey) => {
  if (!apiKey) {
    console.warn('⚠️ [Google Places] API Key não configurada')
    return null
  }

  const query = `${companyName} ${address}`
  const cacheKey = `google_${query.replace(/\s/g, '_')}`
  
  // Verificar cache
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    console.log('🔍 [Google Places] Buscando:', query)
    
    // Text Search (New API)
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.googleMapsUri'
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'pt-BR'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Google Places API returned ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [Google Places] Dados recebidos:', data)
    
    // Salvar em cache
    saveToCache(cacheKey, data)
    
    return data.places?.[0] || null
  } catch (error) {
    console.error('❌ [Google Places] Erro:', error)
    return null
  }
}

/**
 * 🎯 FUNÇÃO PRINCIPAL: Buscar dados de empresa usando todas as APIs configuradas
 */
export const prospectCompany = async (cnpj, config = {}) => {
  const results = {
    cnpj: cleanCNPJ(cnpj),
    timestamp: new Date().toISOString(),
    sources: {}
  }

  console.log('🎯 [ProspectionService] Iniciando prospecção:', cnpj)
  console.log('⚙️ [ProspectionService] Configurações:', config)

  // 1. SEMPRE buscar OpenCNPJ (gratuito)
  try {
    const openCNPJData = await fetchOpenCNPJ(cnpj)
    if (openCNPJData) {
      results.sources.opencnpj = openCNPJData
      results.basicData = {
        razaoSocial: openCNPJData.razao_social || openCNPJData.nome,
        nomeFantasia: openCNPJData.nome_fantasia || openCNPJData.fantasia,
        situacao: openCNPJData.situacao_cadastral || openCNPJData.situacao,
        dataAbertura: openCNPJData.data_inicio_atividade || openCNPJData.abertura,
        porte: openCNPJData.porte,
        naturezaJuridica: openCNPJData.natureza_juridica,
        endereço: {
          logradouro: openCNPJData.logradouro,
          numero: openCNPJData.numero,
          complemento: openCNPJData.complemento,
          bairro: openCNPJData.bairro,
          municipio: openCNPJData.municipio,
          uf: openCNPJData.uf,
          cep: openCNPJData.cep
        },
        telefone: openCNPJData.telefone || openCNPJData.ddd_telefone_1,
        email: openCNPJData.email,
        atividadePrincipal: openCNPJData.atividade_principal,
        atividadesSecundarias: openCNPJData.atividades_secundarias
      }
    }
  } catch (error) {
    console.error('❌ [ProspectionService] Erro ao buscar OpenCNPJ:', error)
  }

  // 2. Buscar CNPJ.ws se configurado
  if (config.cnpjwsApiKey) {
    try {
      const cnpjwsData = await fetchCNPJws(cnpj, config.cnpjwsApiKey)
      if (cnpjwsData) {
        results.sources.cnpjws = cnpjwsData
      }
    } catch (error) {
      console.error('❌ [ProspectionService] Erro ao buscar CNPJ.ws:', error)
    }
  }

  // 3. Buscar Valida API se configurado
  if (config.validaToken) {
    try {
      const validaData = await fetchValidaAPI(cnpj, config.validaToken)
      if (validaData) {
        results.sources.valida = validaData
        results.riskData = {
          protestos: validaData.protestos,
          simplesNacional: validaData.simples_nacional,
          mei: validaData.mei
        }
      }
    } catch (error) {
      console.error('❌ [ProspectionService] Erro ao buscar Valida API:', error)
    }
  }

  // 4. Buscar Google Places se configurado E se temos endereço
  if (config.googleApiKey && results.basicData) {
    try {
      const googleData = await fetchGooglePlaces(
        results.basicData.razaoSocial,
        `${results.basicData.endereço.logradouro}, ${results.basicData.endereço.municipio}`,
        config.googleApiKey
      )
      if (googleData) {
        results.sources.google = googleData
        results.onlinePresence = {
          rating: googleData.rating,
          totalReviews: googleData.userRatingCount,
          website: googleData.websiteUri,
          phone: googleData.nationalPhoneNumber || googleData.internationalPhoneNumber,
          mapsLink: googleData.googleMapsUri
        }
      }
    } catch (error) {
      console.error('❌ [ProspectionService] Erro ao buscar Google Places:', error)
    }
  }

  // Calcular score de qualidade dos dados
  results.dataQuality = calculateDataQuality(results)

  console.log('✅ [ProspectionService] Prospecção concluída:', results)
  return results
}

/**
 * Calcular score de qualidade dos dados (0-100)
 */
const calculateDataQuality = (results) => {
  let score = 0
  let maxScore = 0

  // OpenCNPJ (40 pontos)
  if (results.sources.opencnpj) {
    maxScore += 40
    score += 40
  }

  // CNPJ.ws (20 pontos)
  if (results.sources.cnpjws) {
    maxScore += 20
    score += 20
  }

  // Valida API (20 pontos)
  if (results.sources.valida) {
    maxScore += 20
    score += 20
  }

  // Google Places (20 pontos)
  if (results.sources.google) {
    maxScore += 20
    score += 20
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
}

/**
 * Limpar cache (útil para testes)
 */
export const clearCache = () => {
  cache.clear()
  console.log('🧹 [ProspectionService] Cache limpo')
}

/**
 * Obter estatísticas do cache
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  }
}

export default {
  prospectCompany,
  fetchOpenCNPJ,
  fetchCNPJws,
  fetchValidaAPI,
  fetchGooglePlaces,
  clearCache,
  getCacheStats
}
