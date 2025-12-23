import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DatasetProvider } from './contexts/DatasetContext'
import { ModuleProvider } from './contexts/ModuleContext'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import AuthCallback from './components/auth/AuthCallback'
import ProtectedRoute from './components/auth/ProtectedRoute'
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
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <AuthProvider>
      <DatasetProvider>
        <BrowserRouter>
          <ModuleProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/modules" element={
                <ProtectedRoute>
                  <ModuleSelector />
                </ProtectedRoute>
              } />
              <Route path="/" element={
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
              <ProtectedRoute>
                <Layout>
                  <ProspectingDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/prospecting/list" element={
              <ProtectedRoute>
                <Layout>
                  <ProspectList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/prospecting/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ProspectDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/prospecting/cpf/:id" element={
              <ProtectedRoute>
                <Layout>
                  <CPFClientDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/prospecting/unbanked/:id" element={
              <ProtectedRoute>
                <Layout>
                  <UnbankedCompanyDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/prospecting/enrich" element={
              <ProtectedRoute>
                <Layout>
                  <EnrichmentWizard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/companies" element={
              <ProtectedRoute>
                <Layout>
                  <CompanyDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeePortal />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/people/employees" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/people/employees/new" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/people/employees/:id" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/people/employees/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeForm />
                </Layout>
              </ProtectedRoute>
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
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/integrations/new" element={
              <ProtectedRoute>
                <Layout>
                  <NewIntegration />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/integrations/edit/:id" element={
              <ProtectedRoute>
                <Layout>
                  <NewIntegration />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <Layout>
                  <CampaignManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateCampaign />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns/:id" element={
              <ProtectedRoute>
                <Layout>
                  <CampaignDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns/edit/:id" element={
              <ProtectedRoute>
                <Layout>
                  <EditCampaign />
                </Layout>
              </ProtectedRoute>
            } />
              </Routes>
              <Analytics />
            </div>
          </ModuleProvider>
        </BrowserRouter>
      </DatasetProvider>
    </AuthProvider>
  )
}

export default App
