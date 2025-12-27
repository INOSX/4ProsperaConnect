/**
 * Funções de busca vetorial
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function rankResults(results, queryEmbedding) {
  return results
    .map(result => ({
      ...result,
      similarity: cosineSimilarity(queryEmbedding, result.embedding)
    }))
    .sort((a, b) => b.similarity - a.similarity)
}

export function filterByThreshold(results, threshold = 0.7) {
  return results.filter(result => result.similarity >= threshold)
}

