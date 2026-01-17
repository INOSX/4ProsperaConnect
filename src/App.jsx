import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DatasetProvider } from './contexts/DatasetContext'
import { ModuleProvider } from './contexts/ModuleContext'
import { TourProvider } from './contexts/TourContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import TourProviderComponent from './components/tour/TourProvider'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import ForgotPasswordForm from './components/auth/ForgotPasswordForm'
import ResetPasswordForm from './components/auth/ResetPasswordForm'
import AuthCallback from './components/auth/AuthCallback'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import BankAdminRoute from './components/auth/BankAdminRoute'
import CompanyAdminRoute from './components/auth/CompanyAdminRoute'
import SuperAdminRoute from './components/auth/SuperAdminRoute'
import Layout from './components/layout/Layout'
import ModuleSelector from './components/modules/ModuleSelector'
import Dashboard from './components/dashboard/Dashboard'
import Settings from './components/settings/Settings'
import Datasets from './components/datasets/Datasets'
import UploadPage from './components/dashboard/UploadPage'
import ProspectingDashboard from './components/prospecting/ProspectingDashboard'
import ProspectList from './components/prospecting/ProspectList'
import ProspectDetail from './components/prospecting/ProspectDetail'
import CPFClientDetail from './components/prospecting/CPFClientDetail'
import UnbankedCompanyDetail from './components/prospecting/UnbankedCompanyDetail'
import EnrichmentWizard from './components/prospecting/EnrichmentWizard'
import CompanyDashboard from './components/companies/CompanyDashboard'
import CompanyDashboardSimplified from './components/companies/CompanyDashboardSimplified'
import CompanyList from './components/companies/CompanyList'
import CompanyForm from './components/companies/CompanyForm'
import UserProfile from './components/profile/UserProfile'
import EmployeePortal from './components/employees/EmployeePortal'
import EmployeeList from './components/people/EmployeeList'
import EmployeeDetail from './components/people/EmployeeDetail'
import EmployeeForm from './components/people/EmployeeForm'
import BenefitsManagement from './components/people/BenefitsManagement'
import BenefitForm from './components/people/BenefitForm'
import ProductsManagement from './components/people/ProductsManagement'
import ProductCatalog from './components/people/ProductCatalog'
import ProductForm from './components/people/ProductForm'
import DataConnections from './components/integrations/DataConnections'
import NewIntegration from './components/integrations/NewIntegration'
import CampaignManagement from './components/campaigns/CampaignManagement'
import CreateCampaign from './components/campaigns/CreateCampaign'
import CampaignDetail from './components/campaigns/CampaignDetail'
import EditCampaign from './components/campaigns/EditCampaign'
import SpecialistModule from './components/specialist/SpecialistModule'
import VectorizationPage from './pages/VectorizationPage'
// Super Admin Components
import SuperAdminGuard from './components/superadmin/SuperAdminGuard'
import SuperAdminLayout from './components/superadmin/SuperAdminLayout'
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard'
import UserManagement from './components/superadmin/UserManagement'
import CompanyManagement from './components/superadmin/CompanyManagement'
import SQLConsole from './components/superadmin/SQLConsole'
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <DatasetProvider>
            <BrowserRouter>
              <TourProvider>
                <TourProviderComponent>
                  <ModuleProvider>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={
                <SuperAdminRoute>
                  <RegisterForm />
                </SuperAdminRoute>
              } />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <ModuleSelector />
                </ProtectedRoute>
              } />
              <Route path="/modules" element={
                <ProtectedRoute>
                  <ModuleSelector />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/datasets" element={
              <ProtectedRoute>
                <Layout>
                  <Datasets />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Layout>
                  <UploadPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/prospecting" element={
              <BankAdminRoute>
                <Layout>
                  <ProspectingDashboard />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/prospecting/list" element={
              <BankAdminRoute>
                <Layout>
                  <ProspectList />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/prospecting/:id" element={
              <BankAdminRoute>
                <Layout>
                  <ProspectDetail />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/prospecting/cpf/:id" element={
              <BankAdminRoute>
                <Layout>
                  <CPFClientDetail />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/prospecting/unbanked/:id" element={
              <BankAdminRoute>
                <Layout>
                  <UnbankedCompanyDetail />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/prospecting/enrich" element={
              <BankAdminRoute>
                <Layout>
                  <EnrichmentWizard />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/companies" element={
              <ProtectedRoute>
                <Layout>
                  <CompanyList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/companies/new" element={
              <AdminRoute>
                <Layout>
                  <CompanyForm />
                </Layout>
              </AdminRoute>
            } />
            <Route path="/companies/:id" element={
              <ProtectedRoute>
                <Layout>
                  <CompanyDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/companies/:id/dashboard" element={
              <ProtectedRoute>
                <CompanyDashboardSimplified />
              </ProtectedRoute>
            } />
            <Route path="/companies/:id/edit" element={
              <AdminRoute>
                <Layout>
                  <CompanyForm />
                </Layout>
              </AdminRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeePortal />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/people/employees" element={
              <CompanyAdminRoute>
                <Layout>
                  <EmployeeList />
                </Layout>
              </CompanyAdminRoute>
            } />
            <Route path="/people/employees/new" element={
              <CompanyAdminRoute>
                <Layout>
                  <EmployeeForm />
                </Layout>
              </CompanyAdminRoute>
            } />
            <Route path="/people/employees/:id" element={
              <CompanyAdminRoute>
                <Layout>
                  <EmployeeDetail />
                </Layout>
              </CompanyAdminRoute>
            } />
            <Route path="/people/employees/:id/edit" element={
              <CompanyAdminRoute>
                <Layout>
                  <EmployeeForm />
                </Layout>
              </CompanyAdminRoute>
            } />
            <Route path="/people/benefits" element={
              <ProtectedRoute>
                <Layout>
                  <BenefitsManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/people/benefits/new" element={
              <ProtectedRoute>
                <Layout>
                  <BenefitForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/people/benefits/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <BenefitForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/people/products" element={
              <ProtectedRoute>
                <Layout>
                  <ProductsManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/companies/products" element={
              <ProtectedRoute>
                <Layout>
                  <ProductsManagement />
                </Layout>
              </ProtectedRoute>
            } />
                <Route path="/people/products/catalog" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProductCatalog />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/people/products/new" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProductForm />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/people/products/:id/edit" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProductForm />
                    </Layout>
                  </ProtectedRoute>
                } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <Settings initialTab="integrations" />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/integrations/new" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <NewIntegration />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/integrations/edit/:id" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <NewIntegration />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <BankAdminRoute>
                <Layout>
                  <CampaignManagement />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/campaigns/create" element={
              <BankAdminRoute>
                <Layout>
                  <CreateCampaign />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/campaigns/:id" element={
              <BankAdminRoute>
                <Layout>
                  <CampaignDetail />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/campaigns/edit/:id" element={
              <BankAdminRoute>
                <Layout>
                  <EditCampaign />
                </Layout>
              </BankAdminRoute>
            } />
            <Route path="/specialist" element={
              <ProtectedRoute>
                <Layout>
                  <SpecialistModule />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vectorization" element={
              <ProtectedRoute>
                <AdminRoute>
                  <VectorizationPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            {/* Super Admin Routes */}
            <Route path="/superadmin/*" element={
              <SuperAdminGuard>
                <SuperAdminLayout />
              </SuperAdminGuard>
            }>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="companies" element={<CompanyManagement />} />
              <Route path="sql" element={<SQLConsole />} />
              <Route path="monitor" element={
                <div className="text-white">Monitor em desenvolvimento (Fase 3)</div>
              } />
              <Route path="audit" element={
                <div className="text-white">Audit Log em desenvolvimento (Fase 2)</div>
              } />
              <Route path="settings" element={
                <div className="text-white">Settings em desenvolvimento (Fase 2)</div>
              } />
            </Route>
              </Routes>
              <Analytics />
                </div>
                  </ModuleProvider>
                </TourProviderComponent>
              </TourProvider>
            </BrowserRouter>
          </DatasetProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
