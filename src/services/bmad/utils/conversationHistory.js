/**
 * Gerenciador de histórico de conversas
 */
export class ConversationHistory {
  constructor(maxSize = 50) {
    this.history = []
    this.maxSize = maxSize
  }

  add(entry) {
    this.history.push({
      ...entry,
      timestamp: entry.timestamp || new Date()
    })

    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(-this.maxSize)
    }
  }

  getRecent(count = 10) {
    return this.history.slice(-count)
  }

  getAll() {
    return this.history
  }

  clear() {
    this.history = []
  }

  getByIntent(intent) {
    return this.history.filter(entry => entry.intent === intent)
  }
}

export default ConversationHistory

