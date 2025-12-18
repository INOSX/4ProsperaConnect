/**
 * API Route para integração com Bureau de Crédito (Mockada)
 * Em produção, integrar com API real de bureau de crédito (Boa Vista, Quod, etc)
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { cpf, cnpj } = req.body

    if (!cpf && !cnpj) {
      return res.status(400).json({ error: 'cpf or cnpj is required' })
    }

    // Dados mockados - em produção, fazer chamada real à API do bureau
    const mockData = {
      cpf: cpf || null,
      cnpj: cnpj || null,
      historico_credito: {
        total_operacoes: Math.floor(Math.random() * 20) + 5,
        operacoes_ativas: Math.floor(Math.random() * 5) + 1,
        operacoes_encerradas: Math.floor(Math.random() * 15) + 3,
        valor_total_contratado: Math.floor(Math.random() * 1000000) + 100000,
        valor_total_pago: Math.floor(Math.random() * 800000) + 80000
      },
      restricoes: {
        total: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
        tipos: [],
        valor_total: 0
      },
      capacidade_pagamento: {
        nivel: 'ALTA',
        valor_maximo_estimado: Math.floor(Math.random() * 500000) + 50000,
        percentual_comprometido: Math.floor(Math.random() * 40) + 10
      },
      comportamento_pagamento: {
        media_dias_atraso: Math.random() > 0.8 ? Math.floor(Math.random() * 15) : 0,
        percentual_pontualidade: Math.floor(Math.random() * 20) + 80,
        ultima_operacao: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      ultima_atualizacao: new Date().toISOString()
    }

    return res.status(200).json({
      success: true,
      data: mockData
    })
  } catch (error) {
    console.error('Error in Credit Bureau API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch data from Credit Bureau'
    })
  }
}

