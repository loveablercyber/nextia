import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
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
import CheckoutPage from './pages/CheckoutPage';
import TemplateDemoPage from './pages/TemplateDemoPage';
import LojaVirtualPage from './pages/LojaVirtualPage';

import AutomacaoIAPage from './pages/AutomacaoIAPage';
import TechCarePage from './pages/TechCarePage';
import RedesWifiPage from './pages/RedesWifiPage';
import CamerasSegurancaPage from './pages/CamerasSegurancaPage';
import SolucoesPage from './pages/SolucoesPage';
import SegmentPage from './pages/SegmentPage';
import ServicePage from './pages/ServicePage';
import ServiceRequestPage from './pages/ServiceRequestPage';
import { TermosPage, PrivacidadePage, CookiesPage } from './pages/LegalPages';
import CityPage from './pages/CityPage';
import LocalServicePage from './pages/LocalServicePage';
import LocalNicheServicePage from './pages/LocalNicheServicePage';
import Seo from './components/seo/Seo';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

// Auth, Project, and Admin Imports
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ServiceEngagementProvider } from './context/ServiceEngagementContext';
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
import OrdersPage from './pages/dashboard/OrdersPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import TechnicalOverviewPage from './pages/dashboard/TechnicalOverviewPage';
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
import AdminBackupPage from './pages/admin/AdminBackupPage';
import AdminPartnerMaterialsPage from './pages/admin/AdminPartnerMaterialsPage';
import AdminEngagementsPage from './pages/admin/AdminEngagementsPage';
import AdminDomainsPage from './pages/admin/AdminDomainsPage';
import AdminMigrationIssuesPage from './pages/admin/AdminMigrationIssuesPage';
import TechnicianDashboardPage from './pages/technician/TechnicianDashboardPage';
import TechnicianResourcesPage from './pages/technician/TechnicianResourcesPage';
import TechnicianAgendaPage from './pages/technician/TechnicianAgendaPage';
import TechnicianServiceOrderPage from './pages/technician/TechnicianServiceOrderPage';
import EquipmentPage from './pages/dashboard/EquipmentPage';
import AdminTechnicalResourcesPage from './pages/admin/AdminTechnicalResourcesPage';
import AdminCatalogPage from './pages/admin/AdminCatalogPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';
import AdminTechniciansPage from './pages/admin/AdminTechniciansPage';
import AdminTechnicianDetailPage from './pages/admin/AdminTechnicianDetailPage';
import AdminTechnicalAnalyticsPage from './pages/admin/AdminTechnicalAnalyticsPage';
import AdminTechnicianGovernancePage from './pages/admin/AdminTechnicianGovernancePage';
import AdminUserCreatePage from './pages/admin/AdminUserCreatePage';
import AdminTechnicalServicesPage from './pages/admin/AdminTechnicalServicesPage';

// Support & Tickets Pages
import TicketDetailPage from './pages/TicketDetailPage';
import ClientSupportPage from './pages/dashboard/ClientSupportPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';

// Partner Pages
import PartnerLandingPage from './pages/partner/PartnerLandingPage';
import PartnerRegisterPage from './pages/partner/PartnerRegisterPage';
import { PartnerLayout } from './components/partner/PartnerLayout';
import { PartnerProvider } from './context/PartnerContext';

const PartnerDashboardPage = lazy(() => import('./pages/partner/PartnerDashboardPage'));
const PartnerReferralsPage = lazy(() => import('./pages/partner/PartnerReferralsPage'));
const PartnerCommissionsPage = lazy(() => import('./pages/partner/PartnerCommissionsPage'));
const PartnerFinancialPage = lazy(() => import('./pages/partner/PartnerFinancialPage'));
const PartnerRankingPage = lazy(() => import('./pages/partner/PartnerRankingPage'));
const PartnerMaterialsPage = lazy(() => import('./pages/partner/PartnerMaterialsPage'));
const PartnerAchievementsPage = lazy(() => import('./pages/partner/PartnerAchievementsPage'));
const PartnerProfilePage = lazy(() => import('./pages/partner/PartnerProfilePage'));
const AdminPartnersPage = lazy(() => import('./pages/admin/AdminPartnersPage'));
const AdminPartnerCommissionsPage = lazy(() => import('./pages/admin/AdminPartnerCommissionsPage'));

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
        <a href="/" className="inline-flex items-center gap-2 bg-[#2086FF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1a6ecc] transition-colors">
          Voltar ao início
        </a>
      </div>
    </div>
  );
}

// Pages that DON'T use the Layout (Header/Footer)
const noLayoutPages = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha', '/parceiros', '/parceiros/cadastro'];

function DashboardContainer({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <ProtectedRoute requireRole="client">
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
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Carregando...</div>}>
            {children}
          </Suspense>
        </AdminLayout>
      </AdminProvider>
    </ProtectedRoute>
  );
}

function PartnerContainer() {
  return (
    <ProtectedRoute requireRole="partner">
      <PartnerProvider>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]"><div className="text-[#D4A853]">Carregando...</div></div>}>
          <PartnerLayout />
        </Suspense>
      </PartnerProvider>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isPrivate = ['/admin', '/painel', '/parceiro', '/tecnico', '/checkout', '/perfil', '/login', '/cadastro', '/recuperar-senha', '/redefinir-senha', '/suporte/ticket'].some((prefix) => pathname.startsWith(prefix));
  const hasLayout = !noLayoutPages.includes(pathname) && !pathname.startsWith('/painel') && !pathname.startsWith('/admin') && !pathname.startsWith('/demo') && !pathname.startsWith('/parceiro') && !pathname.startsWith('/tecnico');

  const content = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sites-prontos" element={<TemplatesPage />} />
      <Route path="/sites" element={<ServicePage />} />
      <Route path="/landing-pages" element={<ServicePage />} />
      <Route path="/lojas-virtuais" element={<LojaVirtualPage />} />
      <Route path="/sistemas" element={<ServicePage />} />
      <Route path="/automacao-ia" element={<AutomacaoIAPage />} />
      <Route path="/chatbot" element={<ServicePage />} />
      <Route path="/automacao-whatsapp" element={<ServicePage />} />
      <Route path="/techcare" element={<TechCarePage />} />
      <Route path="/suporte-ti" element={<ServicePage />} />
      <Route path="/suporte-remoto" element={<ServicePage />} />
      <Route path="/manutencao-computadores" element={<ServicePage />} />
      <Route path="/manutencao-notebooks" element={<ServicePage />} />
      <Route path="/redes-wifi" element={<RedesWifiPage />} />
      <Route path="/cabeamento" element={<ServicePage />} />
      <Route path="/cameras-seguranca" element={<CamerasSegurancaPage />} />
      <Route path="/backup" element={<ServicePage />} />
      <Route path="/solucoes" element={<SolucoesPage />} />
      <Route path="/solucoes/:segmentSlug" element={<SegmentPage />} />
      <Route path="/solicitar-servico" element={<ServiceRequestPage />} />
      <Route path="/termos" element={<TermosPage />} />
      <Route path="/privacidade" element={<PrivacidadePage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/templates/:slug" element={<TemplateDetailPage />} />
      <Route path="/demo/:slug" element={<TemplateDemoPage />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/como-funciona" element={<HowItWorksPage />} />
      <Route path="/projeto-personalizado" element={<CustomProjectPage />} />
      <Route path="/contato" element={<ContactPage />} />
      <Route path="/orcamento" element={<QuotePage />} />
      <Route path="/bauru" element={<CityPage />} />
      <Route path="/bauru/:segmentSlug/:serviceSlug" element={<LocalNicheServicePage />} />
      <Route path="/bauru/:serviceSlug" element={<LocalServicePage />} />
      <Route path="/marilia" element={<CityPage />} />
      <Route path="/marilia/:segmentSlug/:serviceSlug" element={<LocalNicheServicePage />} />
      <Route path="/marilia/:serviceSlug" element={<LocalServicePage />} />
      <Route path="/cidade/:citySlug" element={<CityPage />} />
      <Route path="/cidade/:citySlug/:segmentSlug/:serviceSlug" element={<LocalNicheServicePage />} />
      <Route path="/cidade/:citySlug/:serviceSlug" element={<LocalServicePage />} />
      <Route path="/:citySlug/:segmentSlug/:serviceSlug" element={<LocalNicheServicePage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/parceiros" element={<PartnerLandingPage />} />
      <Route path="/parceiros/cadastro" element={<PartnerRegisterPage />} />
      <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/suporte/ticket/:id" element={<TicketDetailPage />} />
      <Route path="/tecnico" element={<ProtectedRoute requireRole="technician"><Link to="/tecnico/recursos" className="fixed right-24 top-2.5 z-[70] inline-flex min-h-11 items-center px-4 text-base font-bold text-[#1677FF]">Recursos técnicos</Link><TechnicianDashboardPage /></ProtectedRoute>} />
      <Route path="/tecnico/recursos" element={<ProtectedRoute requireRole="technician"><TechnicianResourcesPage /></ProtectedRoute>} />
      <Route path="/tecnico/agenda" element={<ProtectedRoute requireRole="technician"><TechnicianAgendaPage /></ProtectedRoute>} />
      <Route path="/tecnico/os/:ticketId" element={<ProtectedRoute requireRole="technician"><TechnicianServiceOrderPage /></ProtectedRoute>} />

      {/* Dashboard Subroutes */}
      <Route
        path="/painel/servicos"
        element={<DashboardContainer title="Serviços contratados"><ServicesPage /></DashboardContainer>}
      />
      <Route
        path="/painel/servicos/:engagementId"
        element={<DashboardContainer title="Visão geral do serviço"><OverviewPage /></DashboardContainer>}
      />
      <Route
        path="/painel/servicos/:engagementId/projeto"
        element={<DashboardContainer title="Projeto"><ProjectPage /></DashboardContainer>}
      />
      <Route
        path="/painel/servicos/:engagementId/briefing"
        element={<DashboardContainer title="Briefing"><BriefingPage /></DashboardContainer>}
      />
      <Route
        path="/painel/servicos/:engagementId/arquivos"
        element={<DashboardContainer title="Arquivos"><FilesPage /></DashboardContainer>}
      />
      <Route
        path="/painel/servicos/:engagementId/solicitacoes"
        element={<DashboardContainer title="Solicitações"><ChangeRequestsPage /></DashboardContainer>}
      />
      <Route
        path="/painel/servicos/:engagementId/faturas"
        element={<DashboardContainer title="Faturas"><PaymentsPage /></DashboardContainer>}
      />
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
        path="/painel/equipamentos"
        element={
          <DashboardContainer title="Meus equipamentos">
            <EquipmentPage />
          </DashboardContainer>
        }
      />
      <Route
        path="/painel/tecnologia"
        element={<DashboardContainer title="Tecnologia e Atendimentos"><TechnicalOverviewPage /></DashboardContainer>}
      />
      <Route
        path="/painel/pedidos"
        element={
          <DashboardContainer title="Meus pedidos">
            <OrdersPage />
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
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Subroutes */}
      <Route
        path="/admin"
        element={
          <AdminContainer title="Visão Geral do Sistema">
            <AdminOverviewPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/projetos"
        element={
          <AdminContainer title="Gerenciar Projetos">
            <AdminProjectsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/solicitacoes"
        element={
          <AdminContainer title="Solicitações de Alteração">
            <AdminRequestsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/pagamentos"
        element={
          <AdminContainer title="Controle de Pagamentos">
            <AdminPaymentsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/orcamentos"
        element={
          <AdminContainer title="Solicitações de Orçamento">
            <AdminQuotesPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/clientes"
        element={
          <AdminContainer title="Gerenciar Clientes">
            <AdminClientsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/tecnicos/:userId"
        element={<AdminContainer title="Detalhe do Técnico"><AdminTechnicianDetailPage /></AdminContainer>}
      />
      <Route path="/admin/tecnicos/:userId/governanca" element={<AdminContainer title="Governança"><AdminTechnicianGovernancePage /></AdminContainer>}/>
      <Route path="/admin/indicadores-tecnicos" element={<AdminContainer title="Indicadores Técnicos"><AdminTechnicalAnalyticsPage /></AdminContainer>}/>
      <Route path="/admin/usuarios/novo" element={<AdminContainer title="Cadastrar Usuário"><AdminUserCreatePage /></AdminContainer>}/>
      <Route path="/admin/servicos-tecnicos" element={<AdminContainer title="Serviços Técnicos"><AdminTechnicalServicesPage /></AdminContainer>}/>
      <Route
        path="/admin/tecnicos"
        element={<AdminContainer title="Gestão de Técnicos"><AdminTechniciansPage /></AdminContainer>}
      />
      <Route
        path="/admin/recursos-tecnicos"
        element={
          <AdminContainer title="Recursos Técnicos">
            <AdminTechnicalResourcesPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/planos"
        element={
          <AdminContainer title="Planos Digitais">
            <AdminPlansPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/pedidos"
        element={
          <AdminContainer title="Pedidos e Assinaturas">
            <AdminOrdersPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/catalogo"
        element={
          <AdminContainer title="Catálogo Comercial">
            <AdminCatalogPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/backup"
        element={
          <AdminContainer title="Central de Backup">
            <AdminBackupPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/perfil"
        element={
          <AdminContainer title="Perfil do Administrador">
            <AdminProfilePage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/suporte"
        element={
          <AdminContainer title="Gestão de Suporte / Tickets">
            <AdminSupportPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/parceiros"
        element={
          <AdminContainer title="Gestão de Parceiros">
            <AdminPartnersPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/parceiros/comissoes"
        element={
          <AdminContainer title="Comissões de Parceiros">
            <AdminPartnerCommissionsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/parceiros/materiais"
        element={
          <AdminContainer title="Materiais de Parceiros">
            <AdminPartnerMaterialsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/servicos-contratados"
        element={
          <AdminContainer title="Central de Serviços Contratados">
            <AdminEngagementsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/dominios"
        element={
          <AdminContainer title="Gestor Unificado de Domínio">
            <AdminDomainsPage />
          </AdminContainer>
        }
      />
      <Route
        path="/admin/integridade-dados"
        element={
          <AdminContainer title="Fila de Integridade de Dados">
            <AdminMigrationIssuesPage />
          </AdminContainer>
        }
      />

      {/* Partner Subroutes */}
      <Route path="/parceiro" element={<PartnerContainer />}>
        <Route index element={<PartnerDashboardPage />} />
        <Route path="indicacoes" element={<PartnerReferralsPage />} />
        <Route path="comissoes" element={<PartnerCommissionsPage />} />
        <Route path="financeiro" element={<PartnerFinancialPage />} />
        <Route path="ranking" element={<PartnerRankingPage />} />
        <Route path="materiais" element={<PartnerMaterialsPage />} />
        <Route path="conquistas" element={<PartnerAchievementsPage />} />
        <Route path="perfil" element={<PartnerProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  const securedContent = <>{isPrivate && <Seo title="Área restrita" description="Área autenticada da plataforma Nextia." path={pathname} noindex />}{content}</>;
  return hasLayout ? <Layout>{securedContent}</Layout> : securedContent;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <ServiceEngagementProvider>
              <ScrollToTop />
              <AppRoutes />
            </ServiceEngagementProvider>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
