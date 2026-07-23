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
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import QuotePage from './pages/QuotePage';
import TemplateDemoPage from './pages/TemplateDemoPage';

// Auth, Project, and Admin Imports
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { AdminProvider } from './context/AdminContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import ProjectPage from './pages/dashboard/ProjectPage';
import BriefingPage from './pages/dashboard/BriefingPage';
import FilesPage from './pages/dashboard/FilesPage';
import ChangeRequestsPage from './pages/dashboard/ChangeRequestsPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import SettingsPage from './pages/dashboard/SettingsPage';

import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminQuotesPage from './pages/admin/AdminQuotesPage';
import AdminClientsPage from './pages/admin/AdminClientsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// Support & Tickets Pages
import TicketDetailPage from './pages/TicketDetailPage';
import ClientSupportPage from './pages/dashboard/ClientSupportPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';

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
const noLayoutPages = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'];

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
  const hasLayout = !noLayoutPages.includes(pathname) && !pathname.startsWith('/painel') && !pathname.startsWith('/admin') && !pathname.startsWith('/demo');

  const content = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sites-prontos" element={<TemplatesPage />} />
      <Route path="/templates/:slug" element={<TemplateDetailPage />} />
      <Route path="/demo/:slug" element={<TemplateDemoPage />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/como-funciona" element={<HowItWorksPage />} />
      <Route path="/projeto-personalizado" element={<CustomProjectPage />} />
      <Route path="/contato" element={<ContactPage />} />
      <Route path="/orcamento" element={<QuotePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/suporte/ticket/:id" element={<TicketDetailPage />} />

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
        path="/painel/briefing"
        element={
          <DashboardContainer title="Briefing do site">
            <BriefingPage />
          </DashboardContainer>
        }
      />
      <Route
        path="/painel/arquivos"
        element={
          <DashboardContainer title="Arquivos do projeto">
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
      <Route
        path="/painel/suporte"
        element={
          <DashboardContainer title="Suporte / Tickets">
            <ClientSupportPage />
          </DashboardContainer>
        }
      />
      <Route
        path="/painel/perfil"
        element={
          <DashboardContainer title="Meu perfil">
            <ProfilePage />
          </DashboardContainer>
        }
      />
      <Route
        path="/perfil"
        element={
          <DashboardContainer title="Meu perfil">
            <ProfilePage />
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
        path="/admin/clientes"
        element={
          <AdminContainer title="Gestão de clientes">
            <AdminClientsPage />
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
        path="/admin/suporte"
        element={
          <AdminContainer title="Chamados Suporte">
            <AdminSupportPage />
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
      <Route
        path="/admin/perfil"
        element={
          <AdminContainer title="Perfil do administrador">
            <AdminProfilePage />
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
      <NotificationProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
