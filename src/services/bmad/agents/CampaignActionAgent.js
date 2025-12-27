/**
 * CampaignActionAgent - Ações relacionadas a campanhas
 */
import { CampaignService } from '../../../services/campaignService'

export default class CampaignActionAgent {
  async create(params, user, context) {
    try {
      const result = await CampaignService.createCampaign({
        name: params.name,
        type: params.type || 'email',
        created_by: user.id
      })
      return {
        success: result.success,
        data: result.campaign,
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
      const result = await CampaignService.getCampaigns({
        createdBy: user.id
      })
      return {
        success: true,
        data: result.campaigns || [],
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
      const result = await CampaignService.updateCampaign(params.id, {
        name: params.name,
        status: params.status
      })
      return {
        success: result.success,
        data: result.campaign,
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
      const result = await CampaignService.deleteCampaign(params.id)
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

  async activate(params, user, context) {
    try {
      const result = await CampaignService.updateCampaign(params.id, {
        status: 'active'
      })
      return {
        success: result.success,
        data: result.campaign,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async pause(params, user, context) {
    try {
      const result = await CampaignService.updateCampaign(params.id, {
        status: 'paused'
      })
      return {
        success: result.success,
        data: result.campaign,
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

