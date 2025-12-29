/**
 * BenefitActionAgent - Ações relacionadas a benefícios
 */
export default class BenefitActionAgent {
  async create(params, user, context) {
    console.log('[AGX:BenefitActionAgent] 💰 ========== CRIANDO BENEFÍCIO ==========')
    console.log('[AGX:BenefitActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      companyId: params.companyId || context.userContext?.companyId
    })
    
    const startTime = Date.now()
    try {
      const { BenefitService } = await import('../../../services/benefitService')
      const benefitData = {
        name: params.name,
        company_id: params.companyId || context.userContext?.companyId
      }
      console.log('[AGX:BenefitActionAgent] 📤 Dados do benefício a criar:', JSON.stringify(benefitData, null, 2))
      
      const result = await BenefitService.createBenefit(benefitData)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:BenefitActionAgent] 📥 Resposta do BenefitService:', {
        success: result.success,
        hasBenefit: !!result.benefit,
        benefitId: result.benefit?.id,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.benefit,
        error: result.error
      }
      
      console.log('[AGX:BenefitActionAgent] ✅ ========== BENEFÍCIO CRIADO ==========')
      console.log('[AGX:BenefitActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:BenefitActionAgent] ❌ ========== ERRO AO CRIAR BENEFÍCIO ==========')
      console.error('[AGX:BenefitActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:BenefitActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:BenefitActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async list(params, user, context) {
    console.log('[AGX:BenefitActionAgent] 💰 ========== LISTANDO BENEFÍCIOS ==========')
    console.log('[AGX:BenefitActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      companyId: params.companyId || context.userContext?.companyId
    })
    
    const startTime = Date.now()
    try {
      const { BenefitService } = await import('../../../services/benefitService')
      const companyId = params.companyId || context.userContext?.companyId
      console.log('[AGX:BenefitActionAgent] 🔍 Company ID determinado:', companyId)
      console.log('[AGX:BenefitActionAgent] 🔍 Buscando benefícios...')
      
      const result = await BenefitService.getCompanyBenefits(companyId)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:BenefitActionAgent] 📥 Resposta do BenefitService:', {
        success: result.success,
        benefitsCount: result.benefits?.length || 0,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      if (result.benefits && result.benefits.length > 0) {
        console.log('[AGX:BenefitActionAgent] 📊 Primeiros 3 benefícios:', result.benefits.slice(0, 3).map(b => ({
          id: b.id,
          name: b.name,
          companyId: b.company_id
        })))
      }
      
      const finalResult = {
        success: result.success,
        data: result.benefits || [],
        error: result.error
      }
      
      console.log('[AGX:BenefitActionAgent] ✅ ========== BENEFÍCIOS LISTADOS ==========')
      console.log('[AGX:BenefitActionAgent] 📤 Resultado:', {
        success: finalResult.success,
        count: finalResult.data.length,
        hasError: !!finalResult.error
      })
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:BenefitActionAgent] ❌ ========== ERRO AO LISTAR BENEFÍCIOS ==========')
      console.error('[AGX:BenefitActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:BenefitActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:BenefitActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async update(params, user, context) {
    console.log('[AGX:BenefitActionAgent] 💰 ========== ATUALIZANDO BENEFÍCIO ==========')
    console.log('[AGX:BenefitActionAgent] 📝 Input:', {
      benefitId: params.id,
      params: params,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      const { BenefitService } = await import('../../../services/benefitService')
      const updateData = {
        name: params.name
      }
      console.log('[AGX:BenefitActionAgent] 📤 Dados a atualizar:', JSON.stringify(updateData, null, 2))
      
      const result = await BenefitService.updateBenefit(params.id, updateData)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:BenefitActionAgent] 📥 Resposta do BenefitService:', {
        success: result.success,
        hasBenefit: !!result.benefit,
        benefitId: result.benefit?.id,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.benefit,
        error: result.error
      }
      
      console.log('[AGX:BenefitActionAgent] ✅ ========== BENEFÍCIO ATUALIZADO ==========')
      console.log('[AGX:BenefitActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:BenefitActionAgent] ❌ ========== ERRO AO ATUALIZAR BENEFÍCIO ==========')
      console.error('[AGX:BenefitActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:BenefitActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:BenefitActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async delete(params, user, context) {
    console.log('[AGX:BenefitActionAgent] 💰 ========== DELETANDO BENEFÍCIO ==========')
    console.log('[AGX:BenefitActionAgent] 📝 Input:', {
      benefitId: params.id,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      const { BenefitService } = await import('../../../services/benefitService')
      console.log('[AGX:BenefitActionAgent] 🗑️ Deletando benefício ID:', params.id)
      
      const result = await BenefitService.deleteBenefit(params.id)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:BenefitActionAgent] 📥 Resposta do BenefitService:', {
        success: result.success,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        error: result.error
      }
      
      console.log('[AGX:BenefitActionAgent] ✅ ========== BENEFÍCIO DELETADO ==========')
      console.log('[AGX:BenefitActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:BenefitActionAgent] ❌ ========== ERRO AO DELETAR BENEFÍCIO ==========')
      console.error('[AGX:BenefitActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:BenefitActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:BenefitActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }
}

