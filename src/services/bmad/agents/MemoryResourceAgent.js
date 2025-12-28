/**
 * MemoryResourceAgent - Monitora memória e recursos
 */
export default class MemoryResourceAgent {
  constructor() {
    this.conversationHistory = []
    this.memoryUsage = 0
    this.maxHistoryMessages = 50
    this.maxTokensPerRequest = 4000
  }

  async optimizeBeforeProcessing() {
    console.log('[BMAD:MemoryResourceAgent] 🧹 ========== OTIMIZAÇÃO DE MEMÓRIA (ANTES) ==========')
    const beforeLength = this.conversationHistory.length
    const beforeMemory = this.estimateMemoryUsage()
    
    console.log('[BMAD:MemoryResourceAgent] 📊 Estado atual:', {
      historyLength: beforeLength,
      maxHistoryMessages: this.maxHistoryMessages,
      memoryUsage: beforeMemory.toFixed(2) + '%',
      needsCleanup: beforeLength > this.maxHistoryMessages
    })
    
    // Limpar histórico antigo se necessário
    if (this.conversationHistory.length > this.maxHistoryMessages) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryMessages)
      const afterMemory = this.estimateMemoryUsage()
      console.log('[BMAD:MemoryResourceAgent] 🗑️ Histórico limpo:', {
        before: beforeLength,
        after: this.conversationHistory.length,
        removed: beforeLength - this.conversationHistory.length,
        memoryBefore: beforeMemory.toFixed(2) + '%',
        memoryAfter: afterMemory.toFixed(2) + '%'
      })
    } else {
      console.log('[BMAD:MemoryResourceAgent] ✅ Tamanho do histórico OK:', this.conversationHistory.length, 'mensagens')
    }
    
    console.log('[BMAD:MemoryResourceAgent] ✅ Otimização concluída')
  }

  async optimizeAfterProcessing(feedback) {
    console.log('[BMAD:MemoryResourceAgent] 📊 ========== OTIMIZAÇÃO DE MEMÓRIA (DEPOIS) ==========')
    console.log('[BMAD:MemoryResourceAgent] 📝 Input:', {
      hasFeedback: !!feedback,
      feedbackText: feedback?.text?.substring(0, 100),
      historyLength: this.conversationHistory.length
    })
    
    // Atualizar métricas de memória
    const beforeMemory = this.memoryUsage
    this.memoryUsage = this.estimateMemoryUsage()
    
    console.log('[BMAD:MemoryResourceAgent] 💾 Uso de memória:', {
      before: beforeMemory.toFixed(2) + '%',
      after: this.memoryUsage.toFixed(2) + '%',
      threshold: '80%',
      needsCleanup: this.memoryUsage > 80
    })
    
    // Limpar cache se necessário
    if (this.memoryUsage > 80) {
      const beforeLength = this.conversationHistory.length
      this.cleanupCache()
      const afterMemory = this.estimateMemoryUsage()
      console.log('[BMAD:MemoryResourceAgent] 🧹 Limpeza de cache acionada:', {
        before: beforeLength,
        after: this.conversationHistory.length,
        removed: beforeLength - this.conversationHistory.length,
        memoryBefore: this.memoryUsage.toFixed(2) + '%',
        memoryAfter: afterMemory.toFixed(2) + '%'
      })
    } else {
      console.log('[BMAD:MemoryResourceAgent] ✅ Uso de memória dentro do limite')
    }
    
    console.log('[BMAD:MemoryResourceAgent] ✅ Otimização concluída')
  }

  async updateHistory(entry) {
    console.log('[BMAD:MemoryResourceAgent] 📝 ========== ATUALIZANDO HISTÓRICO ==========')
    console.log('[BMAD:MemoryResourceAgent] 📝 Entrada:', {
      hasCommand: !!entry.command,
      command: entry.command?.substring(0, 100),
      intent: entry.intent?.intent,
      timestamp: entry.timestamp,
      hasResult: !!entry.result,
      hasFeedback: !!entry.feedback
    })
    
    const beforeLength = this.conversationHistory.length
    this.conversationHistory.push(entry)
    
    // Manter apenas últimas N mensagens
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-50)
      console.log('[BMAD:MemoryResourceAgent] 🗑️ Histórico reduzido:', {
        before: beforeLength,
        after: this.conversationHistory.length,
        removed: beforeLength - this.conversationHistory.length
      })
    } else {
      console.log('[BMAD:MemoryResourceAgent] ✅ Histórico atualizado:', {
        before: beforeLength,
        after: this.conversationHistory.length,
        totalMessages: this.conversationHistory.length
      })
    }
    
    console.log('[BMAD:MemoryResourceAgent] 📚 Histórico completo (últimas 3):', 
      this.conversationHistory.slice(-3).map((e, i) => ({
        index: this.conversationHistory.length - 3 + i,
        command: e.command?.substring(0, 50),
        intent: e.intent?.intent
      }))
    )
  }

  async getConversationHistory() {
    console.log('[BMAD:MemoryResourceAgent] 📖 ========== OBTENDO HISTÓRICO ==========')
    console.log('[BMAD:MemoryResourceAgent] 📊 Estado:', {
      totalHistory: this.conversationHistory.length,
      requested: 10,
      willReturn: Math.min(10, this.conversationHistory.length)
    })
    
    const history = this.conversationHistory.slice(-10) // Últimas 10 mensagens
    
    console.log('[BMAD:MemoryResourceAgent] 📤 Retornando', history.length, 'entradas recentes do histórico')
    console.log('[BMAD:MemoryResourceAgent] 📋 Resumo do histórico:', history.map((h, i) => ({
      index: i,
      command: h.command?.substring(0, 50),
      intent: h.intent?.intent,
      timestamp: h.timestamp
    })))
    
    return history
  }

  estimateMemoryUsage() {
    // Estimativa simples baseada no tamanho do histórico
    const historySize = JSON.stringify(this.conversationHistory).length
    return Math.min(100, (historySize / 100000) * 100) // Assumindo 100KB como máximo
  }

  cleanupCache() {
    // Limpar cache se necessário
    this.conversationHistory = this.conversationHistory.slice(-20)
  }
}

