import React, { useState } from 'react'
import { 
  BookOpen, 
  X, 
  ChevronRight, 
  Home, 
  Users, 
  User,
  Building2, 
  TrendingUp, 
  Megaphone,
  Database,
  Settings,
  Shield,
  Code,
  FileText,
  HelpCircle,
  Zap,
  Lock,
  Globe,
  BarChart3,
  Upload,
  FileText as FileTextIcon,
  Search,
  Target,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Menu
} from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

const Documentation = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('overview')
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const sections = {
    overview: {
      title: 'Visão Geral',
      icon: Home,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4Prospera Connect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O <strong>4Prospera Connect</strong> é uma plataforma completa de gestão empresarial desenvolvida para 
              bancos e instituições financeiras gerenciarem relacionamentos com empresas (PMEs/MEIs) e seus colaboradores.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              A plataforma oferece funcionalidades avançadas de gestão de pessoas, prospecção de clientes, 
              campanhas de marketing e análise de dados, tudo integrado em uma interface moderna e intuitiva.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Objetivo Principal</h3>
                <p className="text-blue-800 text-sm">
                  Facilitar o relacionamento entre bancos e empresas, permitindo gestão completa de colaboradores, 
                  prospecção inteligente de clientes e execução de campanhas de marketing direcionadas.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Principais Funcionalidades</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="h-6 w-6 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Gestão de Pessoas</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Gerencie empresas, colaboradores, benefícios e produtos financeiros de forma centralizada.
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Prospecção de Clientes</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Identifique e qualifique prospects, converta CPF em CNPJ e encontre empresas não bancarizadas.
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Megaphone className="h-6 w-6 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Campanhas de Marketing</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Crie e gerencie campanhas direcionadas para diferentes segmentos de clientes.
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Database className="h-6 w-6 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Integrações</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Conecte-se com bancos de dados externos e APIs para sincronização automática de dados.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    architecture: {
      title: 'Arquitetura',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Arquitetura do Sistema</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O 4Prospera Connect é construído com uma arquitetura moderna baseada em React e Next.js, 
              utilizando Supabase como backend e banco de dados.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Stack Tecnológico</h3>
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li><strong>React</strong> - Biblioteca JavaScript para construção de interfaces</li>
                  <li><strong>Next.js</strong> - Framework React com SSR e roteamento</li>
                  <li><strong>React Router DOM</strong> - Roteamento client-side</li>
                  <li><strong>Tailwind CSS</strong> - Framework CSS utilitário</li>
                  <li><strong>Lucide React</strong> - Biblioteca de ícones</li>
                  <li><strong>React Joyride</strong> - Biblioteca para tours guiados</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li><strong>Supabase</strong> - Backend-as-a-Service (BaaS)</li>
                  <li><strong>PostgreSQL</strong> - Banco de dados relacional (via Supabase)</li>
                  <li><strong>Row Level Security (RLS)</strong> - Segurança em nível de linha</li>
                  <li><strong>Supabase Auth</strong> - Sistema de autenticação</li>
                  <li><strong>Supabase Storage</strong> - Armazenamento de arquivos</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">APIs e Integrações</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li><strong>Next.js API Routes</strong> - Endpoints de API serverless</li>
                  <li><strong>OpenAI API</strong> - IA para recomendações e assistente virtual</li>
                  <li><strong>HeyGen API</strong> - Geração de avatares e vídeos</li>
                  <li><strong>Vercel Analytics</strong> - Análise de uso</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Estrutura de Pastas</h3>
            <Card className="p-4">
              <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded overflow-x-auto">
{`src/
├── components/          # Componentes React
│   ├── auth/           # Autenticação
│   ├── companies/      # Gestão de empresas
│   ├── campaigns/      # Campanhas de marketing
│   ├── prospecting/    # Prospecção de clientes
│   ├── people/         # Gestão de pessoas
│   ├── integrations/   # Integrações
│   ├── layout/         # Layout e navegação
│   ├── tour/           # Sistema de tours
│   └── ui/             # Componentes UI reutilizáveis
├── contexts/           # Context API (estado global)
├── services/           # Serviços e APIs
├── config/              # Configurações
├── utils/              # Funções utilitárias
└── App.jsx             # Componente principal

api/                    # API Routes (Next.js)
├── companies/         # Endpoints de empresas
├── employees/         # Endpoints de colaboradores
├── campaigns/         # Endpoints de campanhas
├── prospects/         # Endpoints de prospecção
└── integrations/      # Endpoints de integrações`}
              </pre>
            </Card>
          </div>
        </div>
      )
    },
    permissions: {
      title: 'Sistema de Permissões',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sistema de Permissões e Roles</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O 4Prospera Connect implementa um sistema robusto de permissões com três níveis de acesso distintos.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6 border-l-4 border-blue-500">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin do Banco</h3>
                  <p className="text-gray-700 mb-3">
                    Funcionários do banco com acesso total à plataforma. Podem gerenciar todas as empresas, 
                    criar conexões de banco de dados, executar sincronizações e acessar todas as funcionalidades.
                  </p>
                  <div className="bg-blue-50 p-3 rounded">
                    <h4 className="font-semibold text-blue-900 mb-2">Permissões:</h4>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      <li>Criar, editar e deletar empresas</li>
                      <li>Gerenciar todas as empresas e colaboradores</li>
                      <li>Acessar Prospecção de Clientes</li>
                      <li>Acessar Campanhas de Marketing</li>
                      <li>Criar e gerenciar conexões de banco de dados</li>
                      <li>Executar sincronizações de dados</li>
                      <li>Acessar página de Configurações/Admin</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-green-500">
              <div className="flex items-start space-x-4">
                <Users className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin do Cliente</h3>
                  <p className="text-gray-700 mb-3">
                    Colaborador responsável pela manutenção da área da empresa na plataforma. 
                    Sempre associado a uma ou mais empresas através da tabela de employees.
                  </p>
                  <div className="bg-green-50 p-3 rounded">
                    <h4 className="font-semibold text-green-900 mb-2">Permissões:</h4>
                    <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                      <li>Gerenciar colaboradores da(s) empresa(s) que administra</li>
                      <li>Ver empresas onde é admin</li>
                      <li>Ver colaboradores das empresas onde é admin</li>
                      <li className="text-red-600">NÃO pode criar empresas</li>
                      <li className="text-red-600">NÃO pode acessar Prospecção de Clientes</li>
                      <li className="text-red-600">NÃO pode acessar Campanhas de Marketing</li>
                      <li className="text-red-600">NÃO pode criar conexões de banco</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-gray-400">
              <div className="flex items-start space-x-4">
                <User className="h-8 w-8 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Colaborador/Usuário Normal</h3>
                  <p className="text-gray-700 mb-3">
                    Usuário com acesso limitado aos módulos básicos. Pode visualizar dados das empresas 
                    onde trabalha, mas não pode gerenciar colaboradores ou acessar funcionalidades avançadas.
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-900 mb-2">Permissões:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Ver empresas onde é colaborador</li>
                      <li>Ver seus próprios dados de colaborador</li>
                      <li className="text-red-600">NÃO pode criar empresas</li>
                      <li className="text-red-600">NÃO pode gerenciar colaboradores</li>
                      <li className="text-red-600">NÃO pode acessar Prospecção de Clientes</li>
                      <li className="text-red-600">NÃO pode acessar Campanhas de Marketing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Implementação Técnica</h3>
            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Banco de Dados</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li><strong>Tabela clients:</strong> Campo <code className="bg-gray-100 px-1 rounded">role</code> com valores 'admin' ou 'user'</li>
                <li><strong>Tabela employees:</strong> Campo <code className="bg-gray-100 px-1 rounded">is_company_admin</code> (boolean) para identificar Admin do Cliente</li>
                <li><strong>RLS Policies:</strong> Políticas de Row Level Security controlam acesso aos dados</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li><strong>AdminRoute:</strong> Protege rotas que requerem ser Admin do Banco</li>
                <li><strong>CompanyAdminRoute:</strong> Protege rotas que requerem Admin do Banco OU Admin do Cliente</li>
                <li><strong>BankAdminRoute:</strong> Protege rotas exclusivas para Admin do Banco</li>
                <li><strong>src/utils/permissions.js:</strong> Funções helper para verificar permissões</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mb-2">APIs</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Todas as APIs verificam permissões antes de processar requisições</li>
                <li>Retornam 403 (Forbidden) se o usuário não tiver permissão</li>
                <li>Usam <code className="bg-gray-100 px-1 rounded">getAuthUserRole()</code> para verificar role</li>
              </ul>
            </Card>
          </div>
        </div>
      )
    },
    modules: {
      title: 'Módulos e Funcionalidades',
      icon: Menu,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulos da Plataforma</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A plataforma é organizada em módulos principais, cada um com funcionalidades específicas.
            </p>
          </div>

          <div className="space-y-6">
            {/* Gestão de Pessoas */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-8 w-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Gestão de Pessoas</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Módulo completo para gerenciar empresas, colaboradores, benefícios e produtos financeiros.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Gestão de Empresas
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li><strong>Listar empresas:</strong> Visualize todas as empresas (admins) ou apenas suas empresas</li>
                    <li><strong>Criar empresa:</strong> Apenas admins podem criar novas empresas</li>
                    <li><strong>Editar empresa:</strong> Admins podem editar qualquer empresa, Admin do Cliente apenas suas empresas</li>
                    <li><strong>Deletar empresa:</strong> Apenas admins podem deletar empresas</li>
                    <li><strong>Dashboard da empresa:</strong> Visualize estatísticas, colaboradores e benefícios</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Gestão de Colaboradores
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li><strong>Listar colaboradores:</strong> Veja todos os colaboradores da empresa</li>
                    <li><strong>Adicionar colaborador:</strong> Admins e Admin do Cliente podem adicionar</li>
                    <li><strong>Editar colaborador:</strong> Admins, Admin do Cliente ou o próprio colaborador</li>
                    <li><strong>Deletar colaborador:</strong> Admins ou Admin do Cliente (exceto outros admins)</li>
                    <li><strong>Marcar como Admin do Cliente:</strong> Defina colaboradores como administradores da empresa</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Gestão de Benefícios
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li>Crie e gerencie benefícios oferecidos pela empresa</li>
                    <li>Atribua benefícios a colaboradores específicos</li>
                    <li>Acompanhe status e elegibilidade de benefícios</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Produtos Financeiros
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li>Visualize produtos financeiros contratados pelos colaboradores</li>
                    <li>Gerencie catálogo de produtos disponíveis</li>
                    <li>Acompanhe histórico de contratações</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Prospecção */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-8 w-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Prospecção de Clientes</h3>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                  Apenas Admin do Banco
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Identifique e qualifique prospects, converta CPF em CNPJ e encontre empresas não bancarizadas.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Funcionalidades:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li><strong>Dashboard de Prospecção:</strong> Visão geral de todos os prospects</li>
                    <li><strong>CPF para CNPJ:</strong> Converta clientes CPF em empresas CNPJ</li>
                    <li><strong>Empresas Não Bancarizadas:</strong> Identifique empresas que ainda não são clientes</li>
                    <li><strong>Enriquecimento de Dados:</strong> Complete informações de prospects usando IA</li>
                    <li><strong>Qualificação:</strong> Avalie e priorize prospects baseado em score</li>
                    <li><strong>Recomendações:</strong> Receba recomendações inteligentes de produtos</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Campanhas */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Megaphone className="h-8 w-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Campanhas de Marketing</h3>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                  Apenas Admin do Banco
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Crie e gerencie campanhas de marketing direcionadas para diferentes segmentos de clientes.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Funcionalidades:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li><strong>Criar campanha:</strong> Defina nome, descrição, tipo e segmento alvo</li>
                    <li><strong>Produtos recomendados:</strong> Associe produtos financeiros à campanha</li>
                    <li><strong>Datas:</strong> Configure período de início e fim</li>
                    <li><strong>Status:</strong> Rascunho, Ativa, Pausada, Concluída, Cancelada</li>
                    <li><strong>Métricas:</strong> Acompanhe performance da campanha</li>
                    <li><strong>Editar/Deletar:</strong> Gerencie campanhas existentes</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Integrações */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-8 w-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Integrações</h3>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                  Apenas Admin do Banco
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Conecte-se com bancos de dados externos e APIs para sincronização automática de dados.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tipos de Conexão:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li><strong>PostgreSQL:</strong> Conexão direta com banco PostgreSQL</li>
                    <li><strong>MySQL:</strong> Conexão com banco MySQL</li>
                    <li><strong>SQL Server:</strong> Conexão com Microsoft SQL Server</li>
                    <li><strong>Oracle:</strong> Conexão com Oracle Database</li>
                    <li><strong>MongoDB:</strong> Conexão com banco NoSQL MongoDB</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Funcionalidades:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li>Criar, editar e deletar conexões</li>
                    <li>Testar conexão antes de salvar</li>
                    <li>Executar sincronização manual ou automática</li>
                    <li>Configurar frequência de sincronização</li>
                    <li>Visualizar histórico de sincronizações</li>
                    <li>Credenciais criptografadas (Base64)</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Upload e Datasets */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="h-8 w-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Upload de Dados e Datasets</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Faça upload de arquivos CSV ou Excel para importar dados de empresas e colaboradores.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Formatos Suportados:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li>CSV (.csv)</li>
                    <li>Excel (.xlsx, .xls)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Funcionalidades:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                    <li>Upload de arquivos para Supabase Storage</li>
                    <li>Visualização de datasets enviados</li>
                    <li>Download de arquivos</li>
                    <li>Exclusão de arquivos</li>
                    <li>Uso de datasets no Dashboard</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    apis: {
      title: 'APIs e Endpoints',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documentação da API</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Todas as APIs são acessadas através de rotas Next.js e requerem autenticação via token.
            </p>
          </div>

          <div className="space-y-6">
            {/* Companies API */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">/api/companies</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">GET /api/companies</h4>
                  <p className="text-sm text-gray-600 mb-2">Listar empresas</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Query params:</strong> id, cnpj, ownerUserId<br/>
                      <strong>Retorna:</strong> Lista de empresas ou empresa específica
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">POST /api/companies</h4>
                  <p className="text-sm text-gray-600 mb-2">Criar empresa <span className="text-red-600">(Apenas Admin)</span></p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Body:</strong> cnpj, company_name, trade_name, company_type, email, phone, address, industry, annual_revenue<br/>
                      <strong>Retorna:</strong> Empresa criada (owner_user_id = NULL para admins)
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">PUT /api/companies</h4>
                  <p className="text-sm text-gray-600 mb-2">Atualizar empresa</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Body:</strong> id, ...updates<br/>
                      <strong>Retorna:</strong> Empresa atualizada
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">DELETE /api/companies?id=:id</h4>
                  <p className="text-sm text-gray-600 mb-2">Deletar empresa (soft delete)</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Retorna:</strong> Empresa deletada
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Employees API */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">/api/employees</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">GET /api/employees</h4>
                  <p className="text-sm text-gray-600 mb-2">Listar colaboradores</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Query params:</strong> id, companyId, cpf, userId<br/>
                      <strong>Retorna:</strong> Lista de colaboradores ou colaborador específico<br/>
                      <strong>Nota:</strong> userId pode retornar múltiplos registros (um por empresa)
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">POST /api/employees</h4>
                  <p className="text-sm text-gray-600 mb-2">Criar colaborador</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Body:</strong> company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_company_admin, userId<br/>
                      <strong>Permissões:</strong> Admin do Banco OU Admin do Cliente da empresa
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">PUT /api/employees</h4>
                  <p className="text-sm text-gray-600 mb-2">Atualizar colaborador</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Body:</strong> id, userId, ...updates<br/>
                      <strong>Permissões:</strong> Admin do Banco OU Admin do Cliente OU próprio colaborador
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">DELETE /api/employees?id=:id&userId=:userId</h4>
                  <p className="text-sm text-gray-600 mb-2">Deletar colaborador (soft delete)</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Permissões:</strong> Admin do Banco OU Admin do Cliente (não pode deletar outros admins)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Prospects API */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">/api/prospects</h3>
              <p className="text-sm text-red-600 mb-4">⚠️ Apenas Admin do Banco</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">GET /api/prospects</h4>
                  <p className="text-sm text-gray-600 mb-2">Listar prospects</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">POST /api/prospects</h4>
                  <p className="text-sm text-gray-600 mb-2">Criar prospect</p>
                </div>
              </div>
            </Card>

            {/* Campaigns API */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">/api/campaigns</h3>
              <p className="text-sm text-red-600 mb-4">⚠️ Apenas Admin do Banco</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">GET /api/campaigns</h4>
                  <p className="text-sm text-gray-600 mb-2">Listar campanhas</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">POST /api/campaigns</h4>
                  <p className="text-sm text-gray-600 mb-2">Criar campanha</p>
                </div>
              </div>
            </Card>

            {/* Integrations API */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">/api/integrations</h3>
              <p className="text-sm text-red-600 mb-4">⚠️ Apenas Admin do Banco</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">/api/integrations/connections</h4>
                  <p className="text-sm text-gray-600 mb-2">Gerenciar conexões de banco de dados</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">/api/integrations/sync</h4>
                  <p className="text-sm text-gray-600 mb-2">Executar sincronização de dados</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    database: {
      title: 'Banco de Dados',
      icon: Database,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estrutura do Banco de Dados</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O banco de dados utiliza PostgreSQL através do Supabase, com Row Level Security (RLS) 
              para controle de acesso granular.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tabelas Principais</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">clients</h4>
                  <p className="text-sm text-gray-600 mb-2">Usuários da plataforma</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Campos principais:</strong> id, user_id, email, role (admin/user), created_at
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">companies</h4>
                  <p className="text-sm text-gray-600 mb-2">Empresas cadastradas</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Campos principais:</strong> id, cnpj, company_name, trade_name, company_type, 
                      email, phone, address, industry, annual_revenue, owner_user_id (NULL para admins), 
                      banking_status, is_active
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">employees</h4>
                  <p className="text-sm text-gray-600 mb-2">Colaboradores das empresas</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Campos principais:</strong> id, company_id, cpf, name, email, phone, position, 
                      department, hire_date, salary, has_platform_access, platform_user_id, 
                      is_company_admin (boolean), is_active
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">prospects</h4>
                  <p className="text-sm text-gray-600 mb-2">Prospects de clientes</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Campos principais:</strong> id, cpf, cnpj, name, email, phone, score, 
                      qualification_status, priority, created_by
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">campaigns</h4>
                  <p className="text-sm text-gray-600 mb-2">Campanhas de marketing</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Campos principais:</strong> id, name, description, campaign_type, 
                      target_segment, products_recommended, status, start_date, end_date, metrics, created_by
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">data_connections</h4>
                  <p className="text-sm text-gray-600 mb-2">Conexões de banco de dados</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-mono text-gray-700">
                      <strong>Campos principais:</strong> id, name, connection_type, connection_config, 
                      credentials (criptografado), sync_frequency, created_by
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Row Level Security (RLS)</h3>
              <p className="text-gray-700 mb-4">
                Todas as tabelas principais possuem políticas RLS que controlam acesso baseado em roles e permissões.
              </p>
              
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">Políticas de SELECT:</h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    <li><strong>Admin do Banco:</strong> Vê todos os registros</li>
                    <li><strong>Admin do Cliente:</strong> Vê apenas dados das empresas que administra</li>
                    <li><strong>Colaborador:</strong> Vê apenas seus próprios dados</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-semibold text-green-900 mb-2">Políticas de INSERT:</h4>
                  <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                    <li><strong>Companies:</strong> Apenas Admin do Banco</li>
                    <li><strong>Employees:</strong> Admin do Banco OU Admin do Cliente</li>
                    <li><strong>Data Connections:</strong> Apenas Admin do Banco</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-semibold text-yellow-900 mb-2">Políticas de UPDATE/DELETE:</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                    <li>Baseadas em ownership e permissões específicas</li>
                    <li>Admin do Cliente não pode deletar outros admins</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Funções Helper</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-mono text-gray-700">
                    <strong>is_admin(user_id):</strong> Verifica se usuário é Admin do Banco
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-mono text-gray-700">
                    <strong>is_company_admin(user_id, company_id):</strong> Verifica se usuário é Admin do Cliente de uma empresa
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-mono text-gray-700">
                    <strong>is_company_admin_any(user_id):</strong> Verifica se usuário é Admin do Cliente de qualquer empresa
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    guides: {
      title: 'Guias de Uso',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Guias de Uso</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Guias passo a passo para usar as principais funcionalidades da plataforma.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Como Criar uma Empresa (Admin)</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Acesse a página "Gestão de Pessoas"</li>
                <li>Clique no botão "Nova Empresa" (visível apenas para admins)</li>
                <li>Preencha os campos obrigatórios:
                  <ul className="list-disc list-inside ml-6 mt-1 text-sm text-gray-600">
                    <li>CNPJ (14 dígitos, será formatado automaticamente)</li>
                    <li>Razão Social</li>
                    <li>Tipo de Empresa (MEI, PME, EIRELI, LTDA, SA)</li>
                  </ul>
                </li>
                <li>Preencha campos opcionais (Nome Fantasia, Email, Telefone, Endereço, etc.)</li>
                <li>Clique em "Criar Empresa"</li>
                <li>A empresa será criada com <code className="bg-gray-100 px-1 rounded">owner_user_id = NULL</code>, pertencendo a todos os admins</li>
              </ol>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Como Adicionar um Colaborador</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Acesse a página "Gestão de Pessoas"</li>
                <li>Selecione uma empresa</li>
                <li>Clique em "Gerenciar Colaboradores"</li>
                <li>Clique no botão "Novo Colaborador"</li>
                <li>Preencha os dados do colaborador:
                  <ul className="list-disc list-inside ml-6 mt-1 text-sm text-gray-600">
                    <li>CPF</li>
                    <li>Nome completo</li>
                    <li>Email e telefone (opcionais)</li>
                    <li>Cargo e departamento</li>
                    <li>Data de admissão e salário (opcionais)</li>
                  </ul>
                </li>
                <li>Se desejar tornar o colaborador um Admin do Cliente, marque a opção correspondente</li>
                <li>Clique em "Salvar"</li>
              </ol>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Como Criar uma Campanha (Admin)</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Acesse "Campanhas de Marketing" (apenas Admin do Banco)</li>
                <li>Clique em "Nova Campanha"</li>
                <li>Preencha os dados:
                  <ul className="list-disc list-inside ml-6 mt-1 text-sm text-gray-600">
                    <li>Nome da campanha</li>
                    <li>Descrição</li>
                    <li>Tipo de campanha</li>
                    <li>Segmento alvo</li>
                    <li>Produtos recomendados</li>
                    <li>Datas de início e fim</li>
                  </ul>
                </li>
                <li>Clique em "Criar Campanha"</li>
              </ol>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Como Criar uma Conexão de Banco (Admin)</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Acesse "Configurações" → "Integrações" (apenas Admin do Banco)</li>
                <li>Clique em "Nova Conexão"</li>
                <li>Selecione o tipo de banco (PostgreSQL, MySQL, SQL Server, Oracle, MongoDB)</li>
                <li>Preencha os dados de conexão:
                  <ul className="list-disc list-inside ml-6 mt-1 text-sm text-gray-600">
                    <li>Host e porta</li>
                    <li>Nome do banco</li>
                    <li>Usuário e senha (serão criptografados)</li>
                  </ul>
                </li>
                <li>Clique em "Testar Conexão" para verificar</li>
                <li>Configure a frequência de sincronização</li>
                <li>Clique em "Salvar"</li>
              </ol>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Como Usar o Tour Guiado</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Procure pelo ícone de ajuda (HelpCircle) no topo da página, ao lado da engrenagem</li>
                <li>Clique no ícone para iniciar o tour</li>
                <li>O tour mostrará os principais elementos da página atual</li>
                <li>Use "Próximo" para avançar ou "Pular" para cancelar</li>
                <li>O tour pode ser desativado nas configurações</li>
              </ol>
            </Card>
          </div>
        </div>
      )
    },
    troubleshooting: {
      title: 'Troubleshooting',
      icon: AlertCircle,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Solução de Problemas</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Problemas comuns e suas soluções.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro: "Apenas administradores podem criar empresas"</h3>
              <p className="text-gray-700 mb-2">
                <strong>Causa:</strong> Você não tem permissão de Admin do Banco.
              </p>
              <p className="text-gray-700">
                <strong>Solução:</strong> Entre em contato com um administrador do sistema para solicitar acesso de admin.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro: "CNPJ já cadastrado"</h3>
              <p className="text-gray-700 mb-2">
                <strong>Causa:</strong> Uma empresa com este CNPJ já existe no sistema.
              </p>
              <p className="text-gray-700">
                <strong>Solução:</strong> Verifique se a empresa já está cadastrada. Se necessário, edite a empresa existente.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro: "JSON object requested, multiple (or no) rows returned"</h3>
              <p className="text-gray-700 mb-2">
                <strong>Causa:</strong> Um usuário pode ter múltiplos registros de employee (um por empresa).
              </p>
              <p className="text-gray-700">
                <strong>Solução:</strong> Este erro foi corrigido. A API agora retorna uma lista quando há múltiplos registros.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Não consigo ver empresas ou colaboradores</h3>
              <p className="text-gray-700 mb-2">
                <strong>Causa:</strong> Permissões insuficientes ou dados não associados ao seu usuário.
              </p>
              <p className="text-gray-700">
                <strong>Solução:</strong> 
                <ul className="list-disc list-inside ml-6 mt-2 text-sm">
                  <li>Verifique se você é Admin do Banco (verá todas as empresas)</li>
                  <li>Verifique se você é Admin do Cliente (verá empresas que administra)</li>
                  <li>Verifique se você está associado como colaborador da empresa</li>
                </ul>
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tour não aparece ou não funciona</h3>
              <p className="text-gray-700 mb-2">
                <strong>Causa:</strong> Elementos não encontrados ou tour desativado.
              </p>
              <p className="text-gray-700">
                <strong>Solução:</strong> 
                <ul className="list-disc list-inside ml-6 mt-2 text-sm">
                  <li>Verifique se o tour está habilitado nas configurações</li>
                  <li>Recarregue a página</li>
                  <li>Verifique o console do navegador para erros</li>
                </ul>
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao conectar banco de dados</h3>
              <p className="text-gray-700 mb-2">
                <strong>Causa:</strong> Credenciais incorretas, firewall ou banco inacessível.
              </p>
              <p className="text-gray-700">
                <strong>Solução:</strong> 
                <ul className="list-disc list-inside ml-6 mt-2 text-sm">
                  <li>Verifique se as credenciais estão corretas</li>
                  <li>Verifique se o banco permite conexões externas</li>
                  <li>Verifique firewall e regras de segurança</li>
                  <li>Use "Testar Conexão" antes de salvar</li>
                </ul>
              </p>
            </Card>
          </div>
        </div>
      )
    },
    components: {
      title: 'Componentes',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Componentes React</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A aplicação é construída com componentes React reutilizáveis e organizados por funcionalidade.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Componentes de Layout</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Layout.jsx:</strong> Componente principal que envolve todas as páginas, incluindo Header, Sidebar e conteúdo</p>
                <p><strong>Header.jsx:</strong> Cabeçalho com navegação, notificações, tour, configurações e menu do usuário</p>
                <p><strong>Sidebar.jsx:</strong> Menu lateral com links de navegação e acesso a datasets</p>
                <p><strong>ModuleTopMenu.jsx:</strong> Menu superior com módulos principais (Gestão de Pessoas, Prospecção, Campanhas)</p>
                <p><strong>FloatingSpecialist.jsx:</strong> Widget flutuante do assistente virtual com IA</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Componentes de Autenticação</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>ProtectedRoute.jsx:</strong> Protege rotas que requerem autenticação</p>
                <p><strong>AdminRoute.jsx:</strong> Protege rotas que requerem ser Admin do Banco</p>
                <p><strong>BankAdminRoute.jsx:</strong> Protege rotas exclusivas para Admin do Banco</p>
                <p><strong>CompanyAdminRoute.jsx:</strong> Protege rotas que requerem Admin do Banco OU Admin do Cliente</p>
                <p><strong>LoginForm.jsx:</strong> Formulário de login com Supabase Auth</p>
                <p><strong>RegisterForm.jsx:</strong> Formulário de registro de novos usuários</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Componentes de Gestão</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>CompanyList.jsx:</strong> Lista de empresas com busca e filtros</p>
                <p><strong>CompanyForm.jsx:</strong> Formulário para criar/editar empresas (apenas admins)</p>
                <p><strong>CompanyDashboard.jsx:</strong> Dashboard com estatísticas da empresa</p>
                <p><strong>EmployeeList.jsx:</strong> Lista de colaboradores com permissões</p>
                <p><strong>EmployeeForm.jsx:</strong> Formulário para criar/editar colaboradores</p>
                <p><strong>EmployeeDetail.jsx:</strong> Detalhes completos de um colaborador</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Componentes UI Reutilizáveis</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Button.jsx:</strong> Botão com variantes (primary, secondary, ghost, destructive)</p>
                <p><strong>Card.jsx:</strong> Container com sombra e bordas arredondadas</p>
                <p><strong>Input.jsx:</strong> Campo de entrada com validação e mensagens de erro</p>
                <p><strong>Loading.jsx:</strong> Indicador de carregamento</p>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    services: {
      title: 'Serviços',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Serviços e APIs</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Serviços frontend que encapsulam chamadas de API e lógica de negócio.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">CompanyService</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>getCompany(id):</strong> Buscar empresa por ID</p>
                <p><strong>getCompanyByCNPJ(cnpj):</strong> Buscar empresa por CNPJ</p>
                <p><strong>getUserCompanies(userId, isAdmin):</strong> Listar empresas (todas se admin)</p>
                <p><strong>createCompany(data, userId):</strong> Criar empresa (apenas admin)</p>
                <p><strong>updateCompany(id, updates):</strong> Atualizar empresa</p>
                <p><strong>deleteCompany(id):</strong> Deletar empresa (soft delete)</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">EmployeeService</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>getEmployee(id):</strong> Buscar colaborador por ID</p>
                <p><strong>getEmployeeByUserId(userId):</strong> Buscar colaborador por userId (pode retornar múltiplos)</p>
                <p><strong>getCompanyEmployees(companyId):</strong> Listar colaboradores de uma empresa</p>
                <p><strong>createEmployee(data, userId):</strong> Criar colaborador</p>
                <p><strong>updateEmployee(id, updates, userId):</strong> Atualizar colaborador</p>
                <p><strong>deleteEmployee(id, userId):</strong> Deletar colaborador</p>
                <p><strong>getEmployeeBenefits(id):</strong> Buscar benefícios do colaborador</p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Funções Helper:</strong> isCompanyAdmin(), isCompanyAdminAny(), getCompanyAdminCompanies()
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">DataIntegrationService</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>getConnections(userId):</strong> Listar conexões (apenas admin)</p>
                <p><strong>createConnection(data, userId):</strong> Criar conexão (apenas admin)</p>
                <p><strong>updateConnection(id, updates, userId):</strong> Atualizar conexão (apenas admin)</p>
                <p><strong>deleteConnection(id, userId):</strong> Deletar conexão (apenas admin)</p>
                <p><strong>testConnection(config, userId):</strong> Testar conexão</p>
                <p><strong>syncConnection(id, force, userId):</strong> Executar sincronização (apenas admin)</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">ClientService</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>getClientByUserId(userId):</strong> Buscar dados do cliente</p>
                <p><strong>updateClient(userId, updates):</strong> Atualizar dados do cliente</p>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    contexts: {
      title: 'Contextos',
      icon: Globe,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Context API</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A aplicação utiliza React Context API para gerenciar estado global.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AuthContext</h3>
              <p className="text-sm text-gray-700 mb-3">
                Gerencia autenticação e estado do usuário logado.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>user:</strong> Objeto do usuário autenticado</p>
                <p><strong>loading:</strong> Estado de carregamento</p>
                <p><strong>signIn(email, password):</strong> Fazer login</p>
                <p><strong>signOut():</strong> Fazer logout</p>
                <p><strong>signUp(email, password, metadata):</strong> Registrar novo usuário</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">TourContext</h3>
              <p className="text-sm text-gray-700 mb-3">
                Gerencia estado do tour guiado (react-joyride).
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>run:</strong> Se o tour está rodando</p>
                <p><strong>stepIndex:</strong> Índice do step atual</p>
                <p><strong>steps:</strong> Array de steps do tour</p>
                <p><strong>startTour(steps):</strong> Iniciar tour</p>
                <p><strong>stopTour():</strong> Parar tour</p>
                <p><strong>tourDisabled:</strong> Se o tour está desabilitado</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">ModuleContext</h3>
              <p className="text-sm text-gray-700 mb-3">
                Gerencia módulo ativo e navegação entre módulos.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>currentModule:</strong> Módulo atualmente selecionado</p>
                <p><strong>setCurrentModule(module):</strong> Definir módulo ativo</p>
                <p><strong>getCurrentModule():</strong> Obter módulo atual</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">DatasetContext</h3>
              <p className="text-sm text-gray-700 mb-3">
                Gerencia datasets carregados para uso no Dashboard.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>datasets:</strong> Array de datasets disponíveis</p>
                <p><strong>selectedDataset:</strong> Dataset selecionado</p>
                <p><strong>loadDatasets():</strong> Carregar lista de datasets</p>
                <p><strong>selectDataset(id):</strong> Selecionar dataset</p>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    deployment: {
      title: 'Deploy e Configuração',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deploy e Configuração</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Guia para fazer deploy da aplicação e configurar variáveis de ambiente.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Variáveis de Ambiente</h3>
              <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                <p className="text-gray-700 mb-2"><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> URL do projeto Supabase</p>
                <p className="text-gray-700 mb-2"><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> Chave pública do Supabase</p>
                <p className="text-gray-700 mb-2"><strong>SUPABASE_SERVICE_ROLE_KEY:</strong> Chave de serviço (server-side apenas)</p>
                <p className="text-gray-700 mb-2"><strong>OPENAI_API_KEY:</strong> Chave da API OpenAI (para recomendações)</p>
                <p className="text-gray-700"><strong>HEYGEN_API_KEY:</strong> Chave da API HeyGen (para avatares)</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Deploy no Vercel</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Conecte seu repositório GitHub ao Vercel</li>
                <li>Configure as variáveis de ambiente no painel do Vercel</li>
                <li>O Vercel detectará automaticamente Next.js e fará o build</li>
                <li>Após o deploy, execute os scripts SQL no Supabase:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>create_user_roles_system.sql</li>
                    <li>create_company_admin_system.sql</li>
                    <li>create_admin_full_access_rls_v2.sql</li>
                    <li>create_admin_constraints.sql</li>
                  </ul>
                </li>
              </ol>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Scripts SQL Necessários</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-semibold text-blue-900 mb-1">1. create_user_roles_system.sql</p>
                  <p className="text-sm text-blue-800">Cria campo role na tabela clients e políticas RLS básicas</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-semibold text-green-900 mb-1">2. create_company_admin_system.sql</p>
                  <p className="text-sm text-green-800">Adiciona campo is_company_admin em employees e funções helper</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <p className="font-semibold text-yellow-900 mb-1">3. create_admin_full_access_rls_v2.sql</p>
                  <p className="text-sm text-yellow-800">Atualiza todas as políticas RLS com suporte a Admin do Cliente</p>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <p className="font-semibold text-red-900 mb-1">4. create_admin_constraints.sql</p>
                  <p className="text-sm text-red-800">Cria triggers para validações de permissões</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    }
  }

  const sidebarItems = [
    { id: 'overview', ...sections.overview },
    { id: 'architecture', ...sections.architecture },
    { id: 'permissions', ...sections.permissions },
    { id: 'modules', ...sections.modules },
    { id: 'components', ...sections.components },
    { id: 'services', ...sections.services },
    { id: 'contexts', ...sections.contexts },
    { id: 'apis', ...sections.apis },
    { id: 'database', ...sections.database },
    { id: 'guides', ...sections.guides },
    { id: 'troubleshooting', ...sections.troubleshooting },
    { id: 'deployment', ...sections.deployment }
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documentação</h1>
              <p className="text-sm text-gray-600">4Prospera Connect - Guia Completo</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <nav className="p-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {sections[activeSection]?.content || (
              <div className="text-center py-12">
                <p className="text-gray-500">Selecione uma seção na barra lateral</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Documentation

