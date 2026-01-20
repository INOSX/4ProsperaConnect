import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon,
  Database,
  Shield,
  Bell,
  Palette,
  Code,
  Save,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Lock,
  Users,
  Clock,
  Mail,
  Eye,
  FileText,
  Server,
  Zap
} from 'lucide-react'
import Card from '../ui/Card'
import { supabase } from '../../services/supabase'

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
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      console.log('🔍 [Settings] Carregando configurações...')
      
      // Por enquanto, usar configurações locais
      // No futuro, buscar do banco de dados
      const savedSettings = localStorage.getItem('superadmin_settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        setOriginalSettings(parsed)
        console.log('✅ [Settings] Configurações carregadas do localStorage')
      } else {
        setOriginalSettings(settings)
        console.log('ℹ️ [Settings] Usando configurações padrão')
      }
    } catch (error) {
      console.error('❌ [Settings] Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings))
      return newSettings
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('💾 [Settings] Salvando configurações...', settings)
      
      // Salvar no localStorage (no futuro, salvar no banco)
      localStorage.setItem('superadmin_settings', JSON.stringify(settings))
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOriginalSettings(settings)
      setHasChanges(false)
      setSuccessMessage('Configurações salvas com sucesso!')
      console.log('✅ [Settings] Configurações salvas!')
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('❌ [Settings] Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja descartar as alterações?')) {
      setSettings(originalSettings)
      setHasChanges(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center">
          <Loader2 className="h-20 w-20 text-gray-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-xl font-medium">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Moderno com Gradiente */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-400 via-gray-600 to-gray-700 bg-clip-text text-transparent flex items-center gap-3">
            <SettingsIcon className="h-10 w-10 text-gray-500 drop-shadow-glow animate-spin-slow" />
            Configurações do Sistema
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">
            Configure o comportamento global da plataforma 4Prospera
          </p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl flex items-center gap-2 transition-all hover:scale-105 font-semibold"
            >
              <X className="h-5 w-5" />
              Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/50 hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-800/20 border-2 border-green-500/30 rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-green-400" />
            <p className="text-white font-semibold text-lg">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 border-2 border-red-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600/20 rounded-xl">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-2">⚠️ Zona de Alto Impacto</h3>
            <p className="text-gray-300">
              As configurações abaixo afetam <span className="font-bold text-white">TODA A PLATAFORMA</span>. 
              Mudanças podem impactar todos os usuários e sistemas conectados. 
              <span className="text-red-400 font-semibold"> Proceda com extremo cuidado.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Segurança e Acesso */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600/10 to-blue-800/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Segurança e Acesso</h2>
              <p className="text-gray-400 text-sm">Controle de autenticação e permissões</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-4">
              <Server className="h-6 w-6 text-red-400" />
              <div>
                <p className="text-white font-bold text-lg">Modo Manutenção</p>
                <p className="text-sm text-gray-400">
                  Bloqueia acesso de todos os usuários (exceto super admins)
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Allow Registration */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-4">
              <Users className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-white font-bold text-lg">Permitir Registro</p>
                <p className="text-sm text-gray-400">
                  Usuários podem criar novas contas na plataforma
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Email Verification */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-purple-400" />
              <div>
                <p className="text-white font-bold text-lg">Verificação de Email</p>
                <p className="text-sm text-gray-400">
                  Exigir verificação de email para novos usuários
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Max Login Attempts */}
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-4 mb-3">
              <Lock className="h-6 w-6 text-orange-400" />
              <label className="text-white font-bold text-lg">
                Tentativas Máximas de Login
              </label>
            </div>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
              className="w-40 px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-orange-500 transition-all"
            />
            <p className="text-sm text-gray-400 mt-2">
              Número de tentativas antes de bloquear temporariamente a conta
            </p>
          </div>

          {/* Session Timeout */}
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-4 mb-3">
              <Clock className="h-6 w-6 text-blue-400" />
              <label className="text-white font-bold text-lg">
                Timeout de Sessão (minutos)
              </label>
            </div>
            <input
              type="number"
              min="15"
              max="1440"
              step="15"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              className="w-40 px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-blue-500 transition-all"
            />
            <p className="text-sm text-gray-400 mt-2">
              Tempo de inatividade antes de fazer logout automático
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-indigo-600/10 to-purple-800/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 rounded-xl">
              <FileText className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Audit Log</h2>
              <p className="text-gray-400 text-sm">Registro e retenção de ações do sistema</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable Audit Log */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all">
            <div className="flex items-center gap-4">
              <Eye className="h-6 w-6 text-indigo-400" />
              <div>
                <p className="text-white font-bold text-lg">Habilitar Audit Log</p>
                <p className="text-sm text-gray-400">
                  Registrar todas as ações realizadas no sistema
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAuditLog}
                onChange={(e) => handleChange('enableAuditLog', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Log Retention */}
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-4 mb-3">
              <Database className="h-6 w-6 text-purple-400" />
              <label className="text-white font-bold text-lg">
                Retenção de Logs (dias)
              </label>
            </div>
            <input
              type="number"
              min="7"
              max="365"
              step="7"
              value={settings.logRetentionDays}
              onChange={(e) => handleChange('logRetentionDays', parseInt(e.target.value))}
              className="w-40 px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-purple-500 transition-all"
            />
            <p className="text-sm text-gray-400 mt-2">
              Logs mais antigos serão automaticamente removidos
            </p>
          </div>
        </div>
      </div>

      {/* Banco de Dados e APIs */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-cyan-600/10 to-cyan-800/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-600/20 rounded-xl">
              <Zap className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Banco de Dados e APIs</h2>
              <p className="text-gray-400 text-sm">Configuração de acessos e integrações externas</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Database Access */}
          <div className="p-6 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl border-2 border-cyan-700/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-600/20 rounded-xl">
                <Database className="h-8 w-8 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Acesso ao Banco de Dados</h3>
                <p className="text-gray-300 mb-4">
                  Gerencie credenciais e permissões de acesso ao Supabase
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Supabase URL</label>
                    <input
                      type="text"
                      value="https://dytuwutsjjxxmyefrfed.supabase.co"
                      disabled
                      className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Project ID</label>
                    <input
                      type="text"
                      value="dytuwutsjjxxmyefrfed"
                      disabled
                      className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open('https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed', '_blank')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 transition-all hover:scale-105 font-medium text-sm"
                  >
                    <Database className="h-4 w-4" />
                    Abrir Dashboard Supabase
                  </button>
                  <button
                    onClick={() => window.open('https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed/settings/api', '_blank')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-all hover:scale-105 font-medium text-sm"
                  >
                    <Lock className="h-4 w-4" />
                    Ver Credenciais
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* API Integrations */}
          <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border-2 border-purple-700/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <Code className="h-8 w-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">APIs Externas</h3>
                <p className="text-gray-300 mb-4">
                  Configure integrações com serviços externos (CNPJ, Geolocalização, etc.)
                </p>
                
                <div className="space-y-3">
                  {/* OpenCNPJ API */}
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-white font-semibold">OpenCNPJ API</p>
                      <p className="text-xs text-gray-400">Consulta CNPJ gratuita (sem autenticação)</p>
                    </div>
                    <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                      ATIVA
                    </span>
                  </div>

                  {/* CNPJ.ws API */}
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-white font-semibold">CNPJ.ws API</p>
                      <p className="text-xs text-gray-400">API freemium com mais dados (requer token)</p>
                    </div>
                    <button
                      onClick={() => alert('Configuração de API será implementada')}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30 hover:bg-blue-600/30 transition-all"
                    >
                      Configurar
                    </button>
                  </div>

                  {/* Google Places API */}
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-white font-semibold">Google Places API</p>
                      <p className="text-xs text-gray-400">Geolocalização e dados de empresas</p>
                    </div>
                    <button
                      onClick={() => alert('Configuração de API será implementada')}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30 hover:bg-blue-600/30 transition-all"
                    >
                      Configurar
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/integrations'}
                  className="mt-4 w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 font-semibold"
                >
                  <Zap className="h-5 w-5" />
                  Gerenciar Todas as Integrações
                </button>
              </div>
            </div>
          </div>

          {/* Service Role Key Warning */}
          <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 border-2 border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-bold mb-1">⚠️ Aviso de Segurança</h4>
                <p className="text-sm text-gray-300">
                  As <span className="font-bold text-white">Service Role Keys</span> do Supabase possuem 
                  <span className="text-red-400 font-semibold"> acesso total ao banco de dados</span> e 
                  <span className="font-bold text-white"> ignoram todas as políticas RLS</span>. 
                  Nunca exponha essas credenciais no frontend ou em repositórios públicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-orange-600/10 to-orange-800/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-600/20 rounded-xl">
              <Bell className="h-8 w-8 text-orange-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Notificações</h2>
              <p className="text-gray-400 text-sm">Alertas e comunicações automáticas</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Notify on New User */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all">
            <div className="flex items-center gap-4">
              <Users className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-white font-bold text-lg">Notificar Novo Usuário</p>
                <p className="text-sm text-gray-400">
                  Enviar notificação quando um novo usuário se registrar
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnNewUser}
                onChange={(e) => handleChange('notifyOnNewUser', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Notify on Role Change */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all">
            <div className="flex items-center gap-4">
              <Shield className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-white font-bold text-lg">Notificar Mudança de Role</p>
                <p className="text-sm text-gray-400">
                  Enviar notificação quando um role de usuário for alterado
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnRoleChange}
                onChange={(e) => handleChange('notifyOnRoleChange', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-pink-600/10 to-pink-800/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-600/20 rounded-xl">
              <Palette className="h-8 w-8 text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tema</h2>
              <p className="text-gray-400 text-sm">Aparência visual do sistema</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="text-white font-bold text-lg mb-3 block">
            Tema Padrão do Sistema
          </label>
          <select
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white text-lg font-medium focus:outline-none focus:border-pink-500 transition-all cursor-pointer"
          >
            <option value="light">☀️ Claro</option>
            <option value="dark">🌙 Escuro</option>
            <option value="auto">🔄 Automático (sistema)</option>
          </select>
          <p className="text-sm text-gray-400 mt-2">
            Define a aparência padrão para todos os usuários
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}

export default SuperAdminSettings
