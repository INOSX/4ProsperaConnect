import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DatasetProvider } from './contexts/DatasetContext'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import AuthCallback from './components/auth/AuthCallback'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Dashboard from './components/dashboard/Dashboard'
import Settings from './components/settings/Settings'
import Datasets from './components/datasets/Datasets'
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <AuthProvider>
      <DatasetProvider>
        <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
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
          </Routes>
          <Analytics />
        </div>
      </BrowserRouter>
      </DatasetProvider>
    </AuthProvider>
  )
}

export default App
