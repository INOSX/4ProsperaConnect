/**
 * ProductActionAgent - Ações relacionadas a produtos financeiros
 */
export default class ProductActionAgent {
  async list(params, user, context) {
    console.log('[BMAD:ProductActionAgent] 📦 ========== LISTANDO PRODUTOS ==========')
    console.log('[BMAD:ProductActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      filters: params.filters || {}
    })
    
    const startTime = Date.now()
    try {
      const { ProductService } = await import('../../../services/productService')
      const filters = params.filters || {}
      console.log('[BMAD:ProductActionAgent] 🔍 Buscando produtos com filtros:', JSON.stringify(filters, null, 2))
      
      const result = await ProductService.getProducts(filters)
      const elapsed = Date.now() - startTime
      
      console.log('[BMAD:ProductActionAgent] 📥 Resposta do ProductService:', {
        success: result.success,
        productsCount: result.products?.length || 0,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      if (result.products && result.products.length > 0) {
        console.log('[BMAD:ProductActionAgent] 📊 Primeiros 3 produtos:', result.products.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          type: p.type
        })))
      }
      
      const finalResult = {
        success: result.success,
        data: result.products || [],
        error: result.error
      }
      
      console.log('[BMAD:ProductActionAgent] ✅ ========== PRODUTOS LISTADOS ==========')
      console.log('[BMAD:ProductActionAgent] 📤 Resultado:', {
        success: finalResult.success,
        count: finalResult.data.length,
        hasError: !!finalResult.error
      })
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[BMAD:ProductActionAgent] ❌ ========== ERRO AO LISTAR PRODUTOS ==========')
      console.error('[BMAD:ProductActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[BMAD:ProductActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[BMAD:ProductActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async recommend(params, user, context) {
    console.log('[BMAD:ProductActionAgent] 📦 ========== RECOMENDANDO PRODUTOS ==========')
    console.log('[BMAD:ProductActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      employeeId: params.employeeId || params.id
    })
    
    const startTime = Date.now()
    try {
      console.log('[BMAD:ProductActionAgent] 🔄 Gerando recomendações de produtos...')
      // Implementar recomendação de produtos
      
      const elapsed = Date.now() - startTime
      const finalResult = {
        success: true,
        data: { products: [] }
      }
      
      console.log('[BMAD:ProductActionAgent] ✅ ========== PRODUTOS RECOMENDADOS ==========')
      console.log('[BMAD:ProductActionAgent] 📊 Produtos recomendados:', finalResult.data.products.length)
      console.log('[BMAD:ProductActionAgent] 📤 Resultado (elapsed:', elapsed + 'ms):', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[BMAD:ProductActionAgent] ❌ ========== ERRO AO RECOMENDAR PRODUTOS ==========')
      console.error('[BMAD:ProductActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[BMAD:ProductActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[BMAD:ProductActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }
}

