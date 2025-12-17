import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUpload from './FileUpload'
import { useDataset } from '../../contexts/DatasetContext'

const UploadPage = () => {
  const navigate = useNavigate()
  const { setSelectedDataset } = useDataset()
  const [showFileUpload, setShowFileUpload] = useState(true)

  const handleDataLoaded = (newDataset) => {
    // Atualizar o contexto compartilhado
    setSelectedDataset(newDataset)
    // Redirecionar para o dashboard após upload bem-sucedido
    navigate('/', { replace: true })
  }

  const handleClose = () => {
    // Se fechar sem fazer upload, voltar para o dashboard
    navigate('/', { replace: true })
  }

  return (
    <>
      {showFileUpload && (
        <FileUpload
          onDataLoaded={handleDataLoaded}
          onClose={handleClose}
          asPage={true}
        />
      )}
    </>
  )
}

export default UploadPage

