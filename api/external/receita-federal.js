/**
 * API Route para integração com Receita Federal (Mockada)
 * Em produção, integrar com API real da Receita Federal
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

    // Dados mockados - em produção, fazer chamada real à API da Receita Federal
    const mockData = {
      cpf: cpf || '123.456.789-00',
      cnpj: cnpj || '12.345.678/0001-90',
      razao_social: cnpj ? 'Empresa Exemplo LTDA' : null,
      nome_fantasia: cnpj ? 'Empresa Exemplo' : null,
      situacao: 'ATIVA',
      data_abertura: '2020-01-15',
      natureza_juridica: 'Sociedade Empresária Limitada',
      capital_social: 50000,
      atividade_principal: {
        code: '6201-5/00',
        description: 'Desenvolvimento e licenciamento de programas de computador customizáveis'
      },
      atividades_secundarias: [
        {
          code: '6202-3/00',
          description: 'Desenvolvimento e licenciamento de programas de computador não-customizáveis'
        }
      ],
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '123',
        complemento: 'Sala 45',
        bairro: 'Centro',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01000-000'
      },
      telefone: '(11) 1234-5678',
      email: 'contato@exemplo.com.br',
      porte: 'DEMAIS',
      simples: true,
      mei: !cnpj || cnpj.includes('0001') // Simular MEI
    }

    return res.status(200).json({
      success: true,
      data: mockData
    })
  } catch (error) {
    console.error('Error in Receita Federal API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch data from Receita Federal'
    })
  }
}

