/**
 * API Route para integração com Serasa (Mockada)
 * Em produção, integrar com API real da Serasa
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

    // Dados mockados - em produção, fazer chamada real à API da Serasa
    const mockData = {
      cpf: cpf || null,
      cnpj: cnpj || null,
      score_credito: Math.floor(Math.random() * 300) + 500, // 500-800
      score_descricao: 'Bom',
      historico_pagamentos: {
        total_parcelas: 24,
        parcelas_pagas: 22,
        parcelas_em_atraso: 2,
        parcelas_canceladas: 0,
        percentual_pago: 91.67
      },
      restricoes: {
        total: 0,
        tipo: [],
        valor_total: 0
      },
      indicadores_financeiros: {
        faturamento_estimado: Math.floor(Math.random() * 500000) + 100000,
        capacidade_pagamento: 'ALTA',
        risco_credito: 'BAIXO',
        tempo_atividade: Math.floor(Math.random() * 10) + 1
      },
      ultima_atualizacao: new Date().toISOString()
    }

    return res.status(200).json({
      success: true,
      data: mockData
    })
  } catch (error) {
    console.error('Error in Serasa API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch data from Serasa'
    })
  }
}

