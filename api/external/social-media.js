/**
 * API Route para integração com Redes Sociais/Web (Mockada)
 * Em produção, integrar com APIs de redes sociais e web scraping
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
    const { cpf, cnpj, nome, razao_social } = req.body

    if (!cpf && !cnpj && !nome && !razao_social) {
      return res.status(400).json({ error: 'cpf, cnpj, nome or razao_social is required' })
    }

    // Dados mockados - em produção, fazer scraping e chamadas a APIs de redes sociais
    const mockData = {
      cpf: cpf || null,
      cnpj: cnpj || null,
      nome: nome || razao_social || null,
      presenca_digital: {
        website: Math.random() > 0.3,
        website_url: Math.random() > 0.3 ? 'https://www.exemplo.com.br' : null,
        facebook: Math.random() > 0.4,
        instagram: Math.random() > 0.5,
        linkedin: Math.random() > 0.6,
        twitter: Math.random() > 0.7
      },
      reviews: {
        google: {
          avaliacoes: Math.floor(Math.random() * 50) + 5,
          nota_media: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
          ultima_avaliacao: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        outros: {
          total_avaliacoes: Math.floor(Math.random() * 30) + 2,
          nota_media: (Math.random() * 1.5 + 3.5).toFixed(1) // 3.5-5.0
        }
      },
      mencoes: {
        total: Math.floor(Math.random() * 20) + 1,
        positivas: Math.floor(Math.random() * 15) + 1,
        neutras: Math.floor(Math.random() * 5),
        negativas: Math.floor(Math.random() * 3)
      },
      atividade_recente: {
        posts_ultimos_30_dias: Math.floor(Math.random() * 20) + 1,
        engajamento_medio: Math.floor(Math.random() * 100) + 10,
        crescimento_seguidores: Math.floor(Math.random() * 50) + 5
      },
      ultima_atualizacao: new Date().toISOString()
    }

    return res.status(200).json({
      success: true,
      data: mockData
    })
  } catch (error) {
    console.error('Error in Social Media API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch data from Social Media'
    })
  }
}

