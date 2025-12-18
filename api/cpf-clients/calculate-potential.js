/**
 * API para calcular potencial de conversão CPF → CNPJ/MEI
 * Lógica de Scoring:
 * - Volume transacional (peso 0.25)
 * - Frequência de transações (peso 0.20)
 * - Indicadores de atividade empresarial (peso 0.20)
 * - Score de crédito (peso 0.15)
 * - Presença digital (peso 0.10)
 * - Produtos bancários atuais (peso 0.10)
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { clients, client } = req.body
    const clientsToProcess = clients || (client ? [client] : [])

    if (clientsToProcess.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No clients provided'
      })
    }

    const scores = clientsToProcess.map(cpfClient => {
      // Fator 1: Volume transacional (peso 0.25)
      const transactionVolume = parseFloat(cpfClient.transaction_volume || 0)
      let volumeScore = 0
      if (transactionVolume >= 50000) volumeScore = 100
      else if (transactionVolume >= 30000) volumeScore = 80
      else if (transactionVolume >= 20000) volumeScore = 60
      else if (transactionVolume >= 10000) volumeScore = 40
      else if (transactionVolume >= 5000) volumeScore = 20
      else volumeScore = 10

      // Fator 2: Frequência de transações (peso 0.20)
      const transactionFrequency = parseInt(cpfClient.transaction_frequency || 0)
      let frequencyScore = 0
      if (transactionFrequency >= 30) frequencyScore = 100
      else if (transactionFrequency >= 20) frequencyScore = 80
      else if (transactionFrequency >= 15) frequencyScore = 60
      else if (transactionFrequency >= 10) frequencyScore = 40
      else if (transactionFrequency >= 5) frequencyScore = 20
      else frequencyScore = 10

      // Fator 3: Indicadores de atividade empresarial (peso 0.20)
      let businessScore = 0
      if (cpfClient.has_business_indicators) {
        businessScore += 50
      }
      if (cpfClient.business_activity_score) {
        businessScore += Math.min(parseFloat(cpfClient.business_activity_score), 50)
      }
      if (cpfClient.business_category) {
        businessScore += 20
      }
      if (cpfClient.estimated_employees > 0) {
        businessScore += Math.min(cpfClient.estimated_employees * 5, 30)
      }
      businessScore = Math.min(businessScore, 100)

      // Fator 4: Score de crédito (peso 0.15)
      const creditScore = parseInt(cpfClient.credit_score || 0)
      let creditScoreNormalized = 0
      if (creditScore >= 800) creditScoreNormalized = 100
      else if (creditScore >= 700) creditScoreNormalized = 80
      else if (creditScore >= 600) creditScoreNormalized = 60
      else if (creditScore >= 500) creditScoreNormalized = 40
      else if (creditScore >= 400) creditScoreNormalized = 20
      else creditScoreNormalized = 10

      // Fator 5: Presença digital (peso 0.10)
      const digitalPresence = parseFloat(cpfClient.digital_presence_score || 0)
      const socialMediaActivity = parseInt(cpfClient.social_media_activity || 0)
      let digitalScore = Math.min(digitalPresence, 60) + Math.min(socialMediaActivity * 2, 40)
      digitalScore = Math.min(digitalScore, 100)

      // Fator 6: Produtos bancários atuais (peso 0.10)
      const bankingProducts = Array.isArray(cpfClient.banking_products) 
        ? cpfClient.banking_products 
        : []
      let productsScore = 0
      if (bankingProducts.includes('conta_empresa')) productsScore = 100
      else if (bankingProducts.includes('investimentos')) productsScore = 70
      else if (bankingProducts.includes('emprestimo')) productsScore = 50
      else if (bankingProducts.includes('cartao_credito')) productsScore = 30
      else if (bankingProducts.includes('conta_corrente')) productsScore = 20
      else productsScore = 10

      // Calcular score combinado
      const conversionPotentialScore = Math.round(
        volumeScore * 0.25 +
        frequencyScore * 0.20 +
        businessScore * 0.20 +
        creditScoreNormalized * 0.15 +
        digitalScore * 0.10 +
        productsScore * 0.10
      )

      // Calcular probabilidade de conversão (similar ao score, mas com ajustes)
      const conversionProbability = Math.min(conversionPotentialScore + (businessScore > 70 ? 5 : 0), 100)

      // Determinar ação recomendada
      let recommendedAction = 'monitor'
      let priority = 0

      if (conversionPotentialScore >= 80) {
        recommendedAction = 'contact_immediately'
        priority = 9
      } else if (conversionPotentialScore >= 70) {
        recommendedAction = 'contact_this_week'
        priority = 8
      } else if (conversionPotentialScore >= 60) {
        recommendedAction = 'contact_this_month'
        priority = 6
      } else if (conversionPotentialScore >= 50) {
        recommendedAction = 'monitor'
        priority = 4
      } else {
        recommendedAction = 'low_priority'
        priority = 2
      }

      // Ajustar prioridade baseado em outros fatores
      if (transactionVolume >= 40000 && transactionFrequency >= 25) {
        priority = Math.min(priority + 1, 10)
      }
      if (cpfClient.has_business_indicators && cpfClient.business_activity_score >= 80) {
        priority = Math.min(priority + 1, 10)
      }

      return {
        conversion_potential_score: conversionPotentialScore,
        conversion_probability: conversionProbability,
        recommended_action: recommendedAction,
        priority: priority,
        score_breakdown: {
          volume_score: volumeScore,
          frequency_score: frequencyScore,
          business_score: businessScore,
          credit_score: creditScoreNormalized,
          digital_score: digitalScore,
          products_score: productsScore
        }
      }
    })

    return res.status(200).json({
      success: true,
      scores: scores
    })
  } catch (error) {
    console.error('Error calculating conversion potential:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate conversion potential'
    })
  }
}

