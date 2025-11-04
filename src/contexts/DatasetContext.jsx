import React, { createContext, useContext, useState } from 'react'

const DatasetContext = createContext({})

export const useDataset = () => {
  const context = useContext(DatasetContext)
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider')
  }
  return context
}

export const DatasetProvider = ({ children }) => {
  const [selectedDataset, setSelectedDataset] = useState(null)

  const value = {
    selectedDataset,
    setSelectedDataset,
    // Helper para obter o nome do arquivo
    getSelectedFileName: () => {
      return selectedDataset?.name || selectedDataset?.id || null
    }
  }

  return (
    <DatasetContext.Provider value={value}>
      {children}
    </DatasetContext.Provider>
  )
}

