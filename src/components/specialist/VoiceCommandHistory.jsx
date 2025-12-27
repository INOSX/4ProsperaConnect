import React from 'react'
import Card from '../ui/Card'
import { Mic, MessageSquare, Clock } from 'lucide-react'

const VoiceCommandHistory = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-2">Histórico de Comandos</h3>
        <p className="text-sm text-gray-500">Nenhum comando ainda. Comece a conversar com o especialista!</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="text-md font-semibold text-gray-900 mb-4">Histórico de Comandos</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className={`flex items-start space-x-3 p-3 rounded-lg ${
              item.type === 'command' ? 'bg-blue-50' : 'bg-green-50'
            }`}
          >
            <div className={`flex-shrink-0 ${
              item.type === 'command' ? 'text-blue-600' : 'text-green-600'
            }`}>
              {item.type === 'command' ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MessageSquare className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs font-medium ${
                  item.type === 'command' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {item.type === 'command' ? 'Você' : 'Especialista'}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.timestamp?.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-900">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default VoiceCommandHistory

