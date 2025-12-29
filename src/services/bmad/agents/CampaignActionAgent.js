/**
 * CampaignActionAgent - Ações relacionadas a campanhas
 */
import { CampaignService } from '../../../services/campaignService'

export default class CampaignActionAgent {
  async create(params, user, context) {
    console.log('[AGX:CampaignActionAgent] 📢 ========== CRIANDO CAMPANHA ==========')
    console.log('[AGX:CampaignActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      campaignType: params.type || 'email'
    })
    
    const startTime = Date.now()
    try {
      const campaignData = {
        name: params.name,
        type: params.type || 'email',
        created_by: user.id
      }
      console.log('[AGX:CampaignActionAgent] 📤 Dados da campanha a criar:', JSON.stringify(campaignData, null, 2))
      
      const result = await CampaignService.createCampaign(campaignData)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CampaignActionAgent] 📥 Resposta do CampaignService:', {
        success: result.success,
        hasCampaign: !!result.campaign,
        campaignId: result.campaign?.id,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.campaign,
        error: result.error
      }
      
      console.log('[AGX:CampaignActionAgent] ✅ ========== CAMPANHA CRIADA ==========')
      console.log('[AGX:CampaignActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CampaignActionAgent] ❌ ========== ERRO AO CRIAR CAMPANHA ==========')
      console.error('[AGX:CampaignActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CampaignActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CampaignActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async list(params, user, context) {
    console.log('[AGX:CampaignActionAgent] 📢 ========== LISTANDO CAMPANHAS ==========')
    console.log('[AGX:CampaignActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      const filters = { createdBy: user.id }
      console.log('[AGX:CampaignActionAgent] 🔍 Buscando campanhas com filtros:', JSON.stringify(filters, null, 2))
      
      const result = await CampaignService.getCampaigns(filters)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CampaignActionAgent] 📥 Resposta do CampaignService:', {
        success: result.success,
        campaignsCount: result.campaigns?.length || 0,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      if (result.campaigns && result.campaigns.length > 0) {
        console.log('[AGX:CampaignActionAgent] 📊 Primeiras 3 campanhas:', result.campaigns.slice(0, 3).map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          status: c.status
        })))
      }
      
      const finalResult = {
        success: true,
        data: result.campaigns || [],
        error: result.error
      }
      
      console.log('[AGX:CampaignActionAgent] ✅ ========== CAMPANHAS LISTADAS ==========')
      console.log('[AGX:CampaignActionAgent] 📤 Resultado:', {
        success: finalResult.success,
        count: finalResult.data.length,
        hasError: !!finalResult.error
      })
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CampaignActionAgent] ❌ ========== ERRO AO LISTAR CAMPANHAS ==========')
      console.error('[AGX:CampaignActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CampaignActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CampaignActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async update(params, user, context) {
    console.log('[AGX:CampaignActionAgent] 📢 ========== ATUALIZANDO CAMPANHA ==========')
    console.log('[AGX:CampaignActionAgent] 📝 Input:', {
      campaignId: params.id,
      params: params,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      const updateData = {
        name: params.name,
        status: params.status
      }
      console.log('[AGX:CampaignActionAgent] 📤 Dados a atualizar:', JSON.stringify(updateData, null, 2))
      
      const result = await CampaignService.updateCampaign(params.id, updateData)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CampaignActionAgent] 📥 Resposta do CampaignService:', {
        success: result.success,
        hasCampaign: !!result.campaign,
        campaignId: result.campaign?.id,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.campaign,
        error: result.error
      }
      
      console.log('[AGX:CampaignActionAgent] ✅ ========== CAMPANHA ATUALIZADA ==========')
      console.log('[AGX:CampaignActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CampaignActionAgent] ❌ ========== ERRO AO ATUALIZAR CAMPANHA ==========')
      console.error('[AGX:CampaignActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CampaignActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CampaignActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async delete(params, user, context) {
    console.log('[AGX:CampaignActionAgent] 📢 ========== DELETANDO CAMPANHA ==========')
    console.log('[AGX:CampaignActionAgent] 📝 Input:', {
      campaignId: params.id,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      console.log('[AGX:CampaignActionAgent] 🗑️ Deletando campanha ID:', params.id)
      
      const result = await CampaignService.deleteCampaign(params.id)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CampaignActionAgent] 📥 Resposta do CampaignService:', {
        success: result.success,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        error: result.error
      }
      
      console.log('[AGX:CampaignActionAgent] ✅ ========== CAMPANHA DELETADA ==========')
      console.log('[AGX:CampaignActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CampaignActionAgent] ❌ ========== ERRO AO DELETAR CAMPANHA ==========')
      console.error('[AGX:CampaignActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CampaignActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CampaignActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async activate(params, user, context) {
    console.log('[AGX:CampaignActionAgent] 📢 ========== ATIVANDO CAMPANHA ==========')
    console.log('[AGX:CampaignActionAgent] 📝 Input:', {
      campaignId: params.id,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      console.log('[AGX:CampaignActionAgent] ▶️ Ativando campanha ID:', params.id)
      
      const result = await CampaignService.updateCampaign(params.id, {
        status: 'active'
      })
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CampaignActionAgent] 📥 Resposta do CampaignService:', {
        success: result.success,
        hasCampaign: !!result.campaign,
        campaignStatus: result.campaign?.status,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.campaign,
        error: result.error
      }
      
      console.log('[AGX:CampaignActionAgent] ✅ ========== CAMPANHA ATIVADA ==========')
      console.log('[AGX:CampaignActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CampaignActionAgent] ❌ ========== ERRO AO ATIVAR CAMPANHA ==========')
      console.error('[AGX:CampaignActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CampaignActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CampaignActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async pause(params, user, context) {
    console.log('[AGX:CampaignActionAgent] 📢 ========== PAUSANDO CAMPANHA ==========')
    console.log('[AGX:CampaignActionAgent] 📝 Input:', {
      campaignId: params.id,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      console.log('[AGX:CampaignActionAgent] ⏸️ Pausando campanha ID:', params.id)
      
      const result = await CampaignService.updateCampaign(params.id, {
        status: 'paused'
      })
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CampaignActionAgent] 📥 Resposta do CampaignService:', {
        success: result.success,
        hasCampaign: !!result.campaign,
        campaignStatus: result.campaign?.status,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.campaign,
        error: result.error
      }
      
      console.log('[AGX:CampaignActionAgent] ✅ ========== CAMPANHA PAUSADA ==========')
      console.log('[AGX:CampaignActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CampaignActionAgent] ❌ ========== ERRO AO PAUSAR CAMPANHA ==========')
      console.error('[AGX:CampaignActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CampaignActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CampaignActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }
}

