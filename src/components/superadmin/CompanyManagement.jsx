import React, { useEffect, useState } from 'react'
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  MapPin,
  Phone,
  Mail,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Building,
  X,
  Check,
  Loader2,
  RefreshCw,
  Calendar,
  Award,
  Briefcase
} from 'lucide-react'
import Card from '../ui/Card'
import Loading from '../ui/Loading'
import superAdminService from '../../services/superAdminService'

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const pageSize = 15

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    loadCompanies()
  }, [currentPage, searchTerm, statusFilter])

  useEffect(() => {
    loadStats()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      console.log('🔍 Carregando empresas...', {
        page: currentPage,
        pageSize,
        search: searchTerm,
        status: statusFilter
      })
      
      const result = await superAdminService.getAllCompanies({
        page: currentPage,
        pageSize,
        search: searchTerm
      })
      
      console.log('✅ Empresas carregadas:', result)
      
      // Aplicar filtro de status no frontend
      let filteredCompanies = result.companies
      if (statusFilter === 'active') {
        filteredCompanies = result.companies.filter(c => c.is_active !== false)
      } else if (statusFilter === 'inactive') {
        filteredCompanies = result.companies.filter(c => c.is_active === false)
      }
      
      setCompanies(filteredCompanies)
      setTotalPages(Math.ceil(filteredCompanies.length / pageSize))
      setTotalCompanies(filteredCompanies.length)
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await superAdminService.getAllCompanies({ page: 1, pageSize: 1000 })
      const active = result.companies.filter(c => c.is_active !== false).length
      const inactive = result.companies.filter(c => c.is_active === false).length
      setStats({
        total: result.total,
        active,
        inactive
      })
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '-'
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Moderno com Gradiente */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 bg-clip-text text-transparent flex items-center gap-3">
            <Building2 className="h-10 w-10 text-green-500 drop-shadow-glow" />
            Gerenciamento de Empresas
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">
            {totalCompanies} {totalCompanies === 1 ? 'empresa cadastrada' : 'empresas cadastradas'}
            {searchTerm && <span className="text-green-400 ml-2">• Buscando: "{searchTerm}"</span>}
          </p>
        </div>
        <button
          onClick={loadCompanies}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/50 hover:scale-105 font-semibold"
        >
          <RefreshCw className="h-5 w-5" />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium mb-1">Total</p>
              <p className="text-6xl font-black text-white drop-shadow-glow">{stats.total}</p>
            </div>
            <Building2 className="h-16 w-16 text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:border-green-400/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium mb-1">Ativas</p>
              <p className="text-6xl font-black text-white drop-shadow-glow">{stats.active}</p>
            </div>
            <Check className="h-16 w-16 text-green-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 hover:border-red-400/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium mb-1">Inativas</p>
              <p className="text-6xl font-black text-white drop-shadow-glow">{stats.inactive}</p>
            </div>
            <X className="h-16 w-16 text-red-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filtros Modernos */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-20 py-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all text-lg font-medium"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-300" />
            </button>
          )}
        </div>

        {/* Filtro de Status */}
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="flex-1 px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all font-medium"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
        </div>
      </div>

      {/* Lista de Empresas */}
      {loading ? (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-16 border border-gray-700 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 text-green-500 animate-spin mb-4" />
          <p className="text-gray-300 text-lg font-medium">Carregando empresas...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-16 border border-gray-700">
          <div className="text-center">
            <AlertCircle className="h-20 w-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-400 text-lg">Tente ajustar os filtros de busca</p>
          </div>
        </div>
      ) : (
        <>
          {/* Cards de Empresas */}
          <div className="space-y-4">
            {companies.map((company, index) => (
              <div
                key={company.id}
                className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/10 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Avatar e Info Principal */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Building className="h-8 w-8 text-white" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-gray-800 ${
                        company.is_active !== false ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{company.company_name}</h3>
                      <p className="text-gray-400 mb-3">{company.trade_name || 'Sem nome fantasia'}</p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {formatCNPJ(company.cnpj)}
                        </span>
                        {company.company_type && (
                          <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-lg text-sm font-medium">
                            {company.company_type}
                          </span>
                        )}
                        {company.industry && (
                          <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-medium">
                            {company.industry}
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          company.is_active !== false
                            ? 'bg-green-600/20 text-green-300'
                            : 'bg-red-600/20 text-red-300'
                        }`}>
                          {company.is_active !== false ? '✓ Ativa' : '✕ Inativa'}
                        </span>
                      </div>

                      {/* Grid de Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium">Funcionários</p>
                          <p className="text-white font-bold flex items-center gap-1">
                            <Users className="h-4 w-4 text-blue-400" />
                            {company.employee_count || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium">Receita Anual</p>
                          <p className="text-white font-bold flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            {formatCurrency(company.annual_revenue)}
                          </p>
                        </div>
                        {company.email && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">Email</p>
                            <p className="text-white font-medium flex items-center gap-1 text-sm truncate">
                              <Mail className="h-4 w-4 text-purple-400" />
                              {company.email}
                            </p>
                          </div>
                        )}
                        {company.phone && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">Telefone</p>
                            <p className="text-white font-medium flex items-center gap-1">
                              <Phone className="h-4 w-4 text-orange-400" />
                              {company.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <button
                    onClick={() => setSelectedCompany(company)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl transition-all shadow-lg hover:shadow-green-500/50 hover:scale-105 font-semibold flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-gray-300 font-medium">
                  Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 font-semibold flex items-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 font-semibold flex items-center gap-2"
                  >
                    Próxima
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes - MODERNIZADO */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* Header do Modal */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Building className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2">{selectedCompany.company_name}</h2>
                    <p className="text-gray-400 text-lg">{selectedCompany.trade_name || 'Sem nome fantasia'}</p>
                    <div className="flex gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        selectedCompany.is_active !== false
                          ? 'bg-green-600/30 text-green-300'
                          : 'bg-red-600/30 text-red-300'
                      }`}>
                        {selectedCompany.is_active !== false ? '✓ Ativa' : '✕ Inativa'}
                      </span>
                      <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Desde {new Date(selectedCompany.registration_date || selectedCompany.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Grid de Detalhes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-400" />
                    Informações Básicas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">CNPJ</p>
                      <p className="text-white font-bold font-mono text-lg">{formatCNPJ(selectedCompany.cnpj)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Tipo</p>
                      <p className="text-white font-bold">{selectedCompany.company_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Setor</p>
                      <p className="text-white font-bold">{selectedCompany.industry || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Métricas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Funcionários</p>
                      <p className="text-white font-bold flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-blue-400" />
                        {selectedCompany.employee_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Receita Anual</p>
                      <p className="text-white font-bold flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        {formatCurrency(selectedCompany.annual_revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Status Bancário</p>
                      <p className="text-white font-bold">{selectedCompany.banking_status || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="md:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-purple-400" />
                    Contato
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white p-3 bg-gray-900/50 rounded-xl">
                      <Mail className="h-5 w-5 text-purple-400" />
                      <span className="font-medium">{selectedCompany.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white p-3 bg-gray-900/50 rounded-xl">
                      <Phone className="h-5 w-5 text-orange-400" />
                      <span className="font-medium">{selectedCompany.phone || '-'}</span>
                    </div>
                    {selectedCompany.address && (
                      <div className="flex items-start gap-3 text-white p-3 bg-gray-900/50 rounded-xl">
                        <MapPin className="h-5 w-5 text-red-400 mt-1" />
                        <div>
                          <p className="font-medium">{selectedCompany.address.street}, {selectedCompany.address.number}</p>
                          {selectedCompany.address.complement && <p className="text-gray-400 text-sm">{selectedCompany.address.complement}</p>}
                          <p className="text-gray-400 text-sm">{selectedCompany.address.neighborhood}</p>
                          <p className="text-gray-400 text-sm">{selectedCompany.address.city} - {selectedCompany.address.state}</p>
                          <p className="text-gray-400 text-sm">CEP: {selectedCompany.address.zip_code}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gestor Responsável */}
                {selectedCompany.owner && (
                  <div className="md:col-span-2 bg-gradient-to-r from-green-600/20 to-emerald-800/20 border border-green-500/30 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-400" />
                      Gestor Responsável
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">
                          {selectedCompany.owner.name?.charAt(0)?.toUpperCase() || 'G'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">{selectedCompany.owner.name}</p>
                        <p className="text-gray-400">{selectedCompany.owner.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}

export default CompanyManagement
