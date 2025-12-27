/**
 * Página simples para vetorizar dados
 * Acesse em /vectorization
 */
import React from 'react'
import Layout from '../components/layout/Layout'
import VectorizationPanel from '../components/admin/VectorizationPanel'

const VectorizationPage = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vetorização de Dados</h1>
          <p className="text-gray-600 mt-2">
            Gerencie a vetorização dos dados do banco para busca semântica
          </p>
        </div>
        <VectorizationPanel />
      </div>
    </Layout>
  )
}

export default VectorizationPage

