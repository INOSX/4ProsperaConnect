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
    console.log('[BMAD:MemoryResourceAgent] 🧹 Optimizing memory before processing...')
    const beforeLength = this.conversationHistory.length
    
    // Limpar histórico antigo se necessário
    if (this.conversationHistory.length > this.maxHistoryMessages) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryMessages)
      console.log('[BMAD:MemoryResourceAgent] 🗑️ Cleaned history:', beforeLength, '->', this.conversationHistory.length, 'messages')
    } else {
      console.log('[BMAD:MemoryResourceAgent] ✅ History size OK:', this.conversationHistory.length, 'messages')
    }
  }

  async optimizeAfterProcessing(feedback) {
    console.log('[BMAD:MemoryResourceAgent] 📊 Updating memory metrics...')
    
    // Atualizar métricas de memória
    this.memoryUsage = this.estimateMemoryUsage()
    console.log('[BMAD:MemoryResourceAgent] 💾 Memory usage:', this.memoryUsage.toFixed(2) + '%')
    
    // Limpar cache se necessário
    if (this.memoryUsage > 80) {
      const beforeLength = this.conversationHistory.length
      this.cleanupCache()
      console.log('[BMAD:MemoryResourceAgent] 🧹 Cache cleanup triggered:', beforeLength, '->', this.conversationHistory.length, 'messages')
    }
  }

  async updateHistory(entry) {
    console.log('[BMAD:MemoryResourceAgent] 📝 Updating conversation history...')
    this.conversationHistory.push(entry)
    
    // Manter apenas últimas N mensagens
    if (this.conversationHistory.length > 100) {
      const beforeLength = this.conversationHistory.length
      this.conversationHistory = this.conversationHistory.slice(-50)
      console.log('[BMAD:MemoryResourceAgent] 🗑️ History trimmed:', beforeLength, '->', this.conversationHistory.length, 'messages')
    } else {
      console.log('[BMAD:MemoryResourceAgent] ✅ History updated:', this.conversationHistory.length, 'messages')
    }
  }

  async getConversationHistory() {
    const history = this.conversationHistory.slice(-10) // Últimas 10 mensagens
    console.log('[BMAD:MemoryResourceAgent] 📖 Returning', history.length, 'recent history entries')
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

