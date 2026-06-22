import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import PlansPage from './pages/PlansPage';
import HowItWorksPage from './pages/HowItWorksPage';
import CustomProjectPage from './pages/CustomProjectPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuotePage from './pages/QuotePage';

// Auth, Project, and Admin Imports
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { AdminProvider } from './context/AdminContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import ProjectPage from './pages/dashboard/ProjectPage';
import FilesPage from './pages/dashboard/FilesPage';
import ChangeRequestsPage from './pages/dashboard/ChangeRequestsPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import SettingsPage from './pages/dashboard/SettingsPage';

// Admin Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminQuotesPage from './pages/admin/AdminQuotesPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="text-8xl font-black text-gray-100 mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h2>
        <p className="text-gray-500 mb-6">A página que você procura não existe ou foi movida.</p>
        <a href="/" className="inline-flex items-center gap-2 bg-[#5B4FE9] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4338CA] transition-colors">
          Voltar ao início
        </a>
      </div>
    </div>
  );
}

// Pages that DON'T use the Layout (Header/Footer)
const noLayoutPages = ['/login', '/cadastro'];

function DashboardContainer({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <ProtectedRoute>
      <ProjectProvider>
        <DashboardLayout title={title}>
          {children}
        </DashboardLayout>
      </ProjectProvider>
    </ProtectedRoute>
  );
}

function AdminContainer({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminProvider>
        <AdminLayout title={title}>
          {children}
        </AdminLayout>
      </AdminProvider>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  const hasLayout = !noLayoutPages.includes(pathname) && !pathname.startsWith('/painel') && !pathname.startsWith('/admin');

  const content = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sites-prontos" element={<TemplatesPage />} />
      <Route path="/templates/:slug" element={<TemplateDetailPage />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/como-funciona" element={<HowItWorksPage />} />
      <Route path="/projeto-personalizado" element={<CustomProjectPage />} />
      <Route path="/contato" element={<ContactPage />} />
      <Route path="/orcamento" element={<QuotePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />

      {/* Dashboard Subroutes */}
      <Route
        path="/painel"
        element={
          <DashboardContainer title="Visão geral do projeto">
            <OverviewPage />
          </DashboardContainer>
        }
      />
      <Route
        path="/painel/projeto"
        element={
          <DashboardContainer title="Meu projeto">
            <ProjectPage />
          </DashboardContainer>
        }
      />
      <Route
        path="/painel/arquivos"
        element={
          <DashboardContainer title="Arquivos e Briefing">
            <FilesPage />
          </DashboardContainer>
        }
      />
      <Route
        path="/painel/alteracoes"
        element={
          <DashboardContainer title="Solicitações de alteração">
            <ChangeRequestsPage />
          </DashboardContainer>
        }
      />
      <Route
        path="/painel/pagamentos"
        element={
          <DashboardContainer title="Histórico financeiro">
            <PaymentsPage />
          </DashboardContainer>
        }
      />
      <Route
        path="/painel/configuracoes"
        element={
          <DashboardContainer title="Configurações de conta">
            <SettingsPage />
          </DashboardContainer>
        }
      />

      {/* Admin Subroutes */}
      <Route
        path="/admin"
        element={
          <AdminContainer title="Painel de controle geral">
            <AdminOverviewPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/orcamentos"
        element={
          <AdminContainer title="Orçamentos recebidos">
            <AdminQuotesPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/projetos"
        element={
          <AdminContainer title="Gestão de projetos">
            <AdminProjectsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/chamados"
        element={
          <AdminContainer title="Gestão de solicitações">
            <AdminRequestsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/cobrancas"
        element={
          <AdminContainer title="Gestão financeira">
            <AdminPaymentsPage />
          </AdminContainer>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return hasLayout ? <Layout>{content}</Layout> : content;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
