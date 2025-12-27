/**
 * BenefitActionAgent - Ações relacionadas a benefícios
 */
export default class BenefitActionAgent {
  async create(params, user, context) {
    try {
      const { BenefitService } = await import('../../../services/benefitService')
      const result = await BenefitService.createBenefit({
        name: params.name,
        company_id: params.companyId || context.userContext?.companyId
      })
      return {
        success: result.success,
        data: result.benefit,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async list(params, user, context) {
    try {
      const { BenefitService } = await import('../../../services/benefitService')
      const companyId = params.companyId || context.userContext?.companyId
      const result = await BenefitService.getCompanyBenefits(companyId)
      return {
        success: result.success,
        data: result.benefits || [],
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async update(params, user, context) {
    try {
      const { BenefitService } = await import('../../../services/benefitService')
      const result = await BenefitService.updateBenefit(params.id, {
        name: params.name
      })
      return {
        success: result.success,
        data: result.benefit,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async delete(params, user, context) {
    try {
      const { BenefitService } = await import('../../../services/benefitService')
      const result = await BenefitService.deleteBenefit(params.id)
      return {
        success: result.success,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

