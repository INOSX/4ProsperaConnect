import React, { useState } from 'react'
import { 
  Settings as SettingsIcon,
  Database,
  Shield,
  Bell,
  Palette,
  Code,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import Card from '../ui/Card'

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistration: false,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    enableAuditLog: true,
    logRetentionDays: 90,
    notifyOnNewUser: true,
    notifyOnRoleChange: true,
    theme: 'dark'
  })

  const [saving, setSaving] = useState(false)

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Configurações salvas com sucesso!')
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-gray-500" />
            Configurações do Sistema
          </h1>
          <p className="text-gray-400 mt-1">
            Configure o comportamento global da plataforma
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      {/* Warning */}
      <Card className="bg-red-900/20 border-red-800 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-2">Atenção!</h3>
            <p className="text-gray-300 text-sm">
              As configurações abaixo afetam toda a plataforma. Mudanças podem impactar
              todos os usuários. Proceda com cuidado.
            </p>
          </div>
        </div>
      </Card>

      {/* Segurança */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Segurança e Acesso</h2>
        </div>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Modo Manutenção</p>
              <p className="text-sm text-gray-400">
                Bloqueia acesso de todos os usuários (exceto super admins)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Allow Registration */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Permitir Registro</p>
              <p className="text-sm text-gray-400">
                Usuários podem criar novas contas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email Verification */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Verificação de Email</p>
              <p className="text-sm text-gray-400">
                Exigir verificação de email para novos usuários
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Max Login Attempts */}
          <div>
            <label className="block text-white font-medium mb-2">
              Tentativas Máximas de Login
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
              className="w-32 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-sm text-gray-400 mt-1">
              Número de tentativas antes de bloquear temporariamente
            </p>
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block text-white font-medium mb-2">
              Timeout de Sessão (minutos)
            </label>
            <input
              type="number"
              min="15"
              max="1440"
              step="15"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              className="w-32 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-sm text-gray-400 mt-1">
              Tempo de inatividade antes de fazer logout automático
            </p>
          </div>
        </div>
      </Card>

      {/* Audit Log */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-bold text-white">Audit Log</h2>
        </div>

        <div className="space-y-6">
          {/* Enable Audit Log */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Habilitar Audit Log</p>
              <p className="text-sm text-gray-400">
                Registrar todas as ações realizadas no sistema
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAuditLog}
                onChange={(e) => handleChange('enableAuditLog', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Log Retention */}
          <div>
            <label className="block text-white font-medium mb-2">
              Retenção de Logs (dias)
            </label>
            <input
              type="number"
              min="7"
              max="365"
              step="7"
              value={settings.logRetentionDays}
              onChange={(e) => handleChange('logRetentionDays', parseInt(e.target.value))}
              className="w-32 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-sm text-gray-400 mt-1">
              Logs mais antigos serão automaticamente removidos
            </p>
          </div>
        </div>
      </Card>

      {/* Notificações */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-white">Notificações</h2>
        </div>

        <div className="space-y-6">
          {/* Notify on New User */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Notificar Novo Usuário</p>
              <p className="text-sm text-gray-400">
                Enviar notificação quando um novo usuário se registrar
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnNewUser}
                onChange={(e) => handleChange('notifyOnNewUser', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* Notify on Role Change */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Notificar Mudança de Role</p>
              <p className="text-sm text-gray-400">
                Enviar notificação quando um role de usuário for alterado
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnRoleChange}
                onChange={(e) => handleChange('notifyOnRoleChange', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-6 w-6 text-pink-500" />
          <h2 className="text-xl font-bold text-white">Tema</h2>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Tema Padrão do Sistema
          </label>
          <select
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
          >
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="auto">Automático (sistema)</option>
          </select>
        </div>
      </Card>
    </div>
  )
}

export default SuperAdminSettings
