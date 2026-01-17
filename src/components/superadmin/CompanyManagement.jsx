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
  Building
} from 'lucide-react'
import Card from '../ui/Card'
import Loading from '../ui/Loading'
import superAdminService from '../../services/superAdminService'

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const pageSize = 20

  useEffect(() => {
    loadCompanies()
  }, [currentPage, searchTerm])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const result = await superAdminService.getAllCompanies({
        page: currentPage,
        pageSize,
        search: searchTerm
      })
      setCompanies(result.companies)
      setTotalPages(result.pages)
      setTotalCompanies(result.total)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-green-500" />
            Gerenciamento de Empresas
          </h1>
          <p className="text-gray-400 mt-1">
            Total: {totalCompanies} empresas cadastradas
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>
      </Card>

      {/* Companies Grid */}
      {loading ? (
        <Card className="bg-gray-800 border-gray-700 p-12">
          <div className="flex justify-center">
            <Loading />
          </div>
        </Card>
      ) : companies.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="bg-gray-800 border-gray-700 hover:border-green-500 transition-all">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <Building className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{company.company_name}</h3>
                          <p className="text-sm text-gray-400">{company.trade_name}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCompany(company)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">CNPJ</p>
                      <p className="text-sm text-white font-mono">{formatCNPJ(company.cnpj)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tipo</p>
                      <p className="text-sm text-white">{company.company_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Funcionários</p>
                      <p className="text-sm text-white flex items-center gap-1">
                        <Users className="h-3 w-3" /> {company.employee_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Receita Anual</p>
                      <p className="text-sm text-white flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> {formatCurrency(company.annual_revenue)}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 border-t border-gray-700 pt-4">
                    {company.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="h-4 w-4" />
                        <span>{company.email}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      company.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {company.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Desde {new Date(company.registration_date || company.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-gray-900 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-gray-900 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedCompany.company_name}</h2>
                  <p className="text-gray-400">{selectedCompany.trade_name}</p>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Informações Básicas</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">CNPJ</p>
                      <p className="text-white font-mono">{formatCNPJ(selectedCompany.cnpj)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tipo</p>
                      <p className="text-white">{selectedCompany.company_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Setor</p>
                      <p className="text-white">{selectedCompany.industry || '-'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Métricas</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Funcionários</p>
                      <p className="text-white flex items-center gap-2">
                        <Users className="h-4 w-4" /> {selectedCompany.employee_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Receita Anual</p>
                      <p className="text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> {formatCurrency(selectedCompany.annual_revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status Bancário</p>
                      <p className="text-white">{selectedCompany.banking_status || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Contato</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedCompany.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedCompany.phone || '-'}</span>
                    </div>
                    {selectedCompany.address && (
                      <div className="flex items-start gap-2 text-white">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p>{selectedCompany.address.street}, {selectedCompany.address.number}</p>
                          {selectedCompany.address.complement && <p>{selectedCompany.address.complement}</p>}
                          <p>{selectedCompany.address.neighborhood}</p>
                          <p>{selectedCompany.address.city} - {selectedCompany.address.state}</p>
                          <p>CEP: {selectedCompany.address.zip_code}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedCompany.owner && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Gestor Responsável</h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {selectedCompany.owner.name?.charAt(0)?.toUpperCase() || 'G'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedCompany.owner.name}</p>
                        <p className="text-sm text-gray-400">{selectedCompany.owner.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CompanyManagement
