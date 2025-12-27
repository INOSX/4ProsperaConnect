/**
 * Gerenciador de memória e recursos
 */
export class MemoryManager {
  constructor() {
    this.memoryUsage = 0
    this.cache = new Map()
    this.cacheTTL = 5 * 60 * 1000 // 5 minutos
  }

  estimateMemoryUsage(data) {
    const size = JSON.stringify(data).length
    return size / 1024 / 1024 // MB
  }

  getCache(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  clearCache() {
    this.cache.clear()
  }

  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheTTL) {
        this.cache.delete(key)
      }
    }
  }
}

export default MemoryManager

