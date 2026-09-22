import { BrowserRouter, Routes, Route, useLocation, Link, Navigate, useParams } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { captureAttribution } from './lib/leadAttribution';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
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
// Route pages are loaded on demand so public visitors do not download private/admin code.
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const TemplateDetailPage = lazy(() => import('./pages/TemplateDetailPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const PortfolioDetailPage = lazy(() => import('./pages/PortfolioDetailPage'));
const CasesPage = lazy(() => import('./pages/CasesPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const CustomProjectPage = lazy(() => import('./pages/CustomProjectPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const QuotePage = lazy(() => import('./pages/QuotePage'));
const ContentHubPage = lazy(() => import('./pages/ContentHubPage'));
const ContentDetailPage = lazy(() => import('./pages/ContentDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LojaVirtualPage = lazy(() => import('./pages/LojaVirtualPage'));
const AutomacaoIAPage = lazy(() => import('./pages/AutomacaoIAPage'));
const TechCarePage = lazy(() => import('./pages/TechCarePage'));
const RedesWifiPage = lazy(() => import('./pages/RedesWifiPage'));
const CamerasSegurancaPage = lazy(() => import('./pages/CamerasSegurancaPage'));
const SolucoesPage = lazy(() => import('./pages/SolucoesPage'));
const SegmentPage = lazy(() => import('./pages/SegmentPage'));
const ServicePage = lazy(() => import('./pages/ServicePage'));
const ServiceRequestPage = lazy(() => import('./pages/ServiceRequestPage'));
const TermosPage = lazy(() => import('./pages/LegalPages').then((module) => ({ default: module.TermosPage })));
const PrivacidadePage = lazy(() => import('./pages/LegalPages').then((module) => ({ default: module.PrivacidadePage })));
const CookiesPage = lazy(() => import('./pages/LegalPages').then((module) => ({ default: module.CookiesPage })));
const CityPage = lazy(() => import('./pages/CityPage'));
const LocalServicePage = lazy(() => import('./pages/LocalServicePage'));
const LocalNicheServicePage = lazy(() => import('./pages/LocalNicheServicePage'));
const OverviewPage = lazy(() => import('./pages/dashboard/OverviewPage'));
const ProjectPage = lazy(() => import('./pages/dashboard/ProjectPage'));
const BriefingPage = lazy(() => import('./pages/dashboard/BriefingPage'));
const FilesPage = lazy(() => import('./pages/dashboard/FilesPage'));
const ChangeRequestsPage = lazy(() => import('./pages/dashboard/ChangeRequestsPage'));
const PaymentsPage = lazy(() => import('./pages/dashboard/PaymentsPage'));
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'));
const ServicesPage = lazy(() => import('./pages/dashboard/ServicesPage'));
const TechnicalOverviewPage = lazy(() => import('./pages/dashboard/TechnicalOverviewPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const CustomerSuccessPage = lazy(() => import('./pages/dashboard/CustomerSuccessPage'));
const EquipmentPage = lazy(() => import('./pages/dashboard/EquipmentPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminProjectDetailPage = lazy(() => import('./pages/admin/AdminProjectDetailPage'));
const AdminRequestsPage = lazy(() => import('./pages/admin/AdminRequestsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminQuotesPage = lazy(() => import('./pages/admin/AdminQuotesPage'));
const AdminClientsPage = lazy(() => import('./pages/admin/AdminClientsPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'));
const AdminBackupPage = lazy(() => import('./pages/admin/AdminBackupPage'));
const AdminPartnerMaterialsPage = lazy(() => import('./pages/admin/AdminPartnerMaterialsPage'));
const AdminEngagementsPage = lazy(() => import('./pages/admin/AdminEngagementsPage'));
const AdminDomainsPage = lazy(() => import('./pages/admin/AdminDomainsPage'));
const AdminMigrationIssuesPage = lazy(() => import('./pages/admin/AdminMigrationIssuesPage'));
const AdminTechnicalResourcesPage = lazy(() => import('./pages/admin/AdminTechnicalResourcesPage'));
const AdminCatalogPage = lazy(() => import('./pages/admin/AdminCatalogPage'));
const AdminModelsPage = lazy(() => import('./pages/admin/AdminModelsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminPlansPage = lazy(() => import('./pages/admin/AdminPlansPage'));
const AdminTechniciansPage = lazy(() => import('./pages/admin/AdminTechniciansPage'));
const AdminTechnicianDetailPage = lazy(() => import('./pages/admin/AdminTechnicianDetailPage'));
const AdminTechnicalAnalyticsPage = lazy(() => import('./pages/admin/AdminTechnicalAnalyticsPage'));
const AdminTechnicianGovernancePage = lazy(() => import('./pages/admin/AdminTechnicianGovernancePage'));
const AdminUserCreatePage = lazy(() => import('./pages/admin/AdminUserCreatePage'));
const AdminTechnicalServicesPage = lazy(() => import('./pages/admin/AdminTechnicalServicesPage'));
const AdminCustomerSuccessPage = lazy(() => import('./pages/admin/AdminCustomerSuccessPage'));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'));
const TechnicianDashboardPage = lazy(() => import('./pages/technician/TechnicianDashboardPage'));
const TechnicianResourcesPage = lazy(() => import('./pages/technician/TechnicianResourcesPage'));
const TechnicianAgendaPage = lazy(() => import('./pages/technician/TechnicianAgendaPage'));
const TechnicianServiceOrderPage = lazy(() => import('./pages/technician/TechnicianServiceOrderPage'));

// CRM Pages
const TemplateDemoPage = lazy(() => import('./pages/TemplateDemoPage'));
const AdminCrmDashboardPage = lazy(() => import('./pages/crm/AdminCrmDashboardPage'));
const AdminLeadsPage = lazy(() => import('./pages/crm/AdminLeadsPage'));
const AdminOpportunitiesPage = lazy(() => import('./pages/crm/AdminOpportunitiesPage'));
const AdminActivitiesPage = lazy(() => import('./pages/crm/AdminActivitiesPage'));
const AdminProposalsPage = lazy(() => import('./pages/crm/AdminProposalsPage'));
const AdminCrmSettingsPage = lazy(() => import('./pages/crm/AdminCrmSettingsPage'));
const AdminAutomationsPage = lazy(() => import('./pages/automation/AdminAutomationsPage'));
const AdminAutomationRunsPage = lazy(() => import('./pages/automation/AdminAutomationRunsPage'));
const AdminApprovalsPage = lazy(() => import('./pages/automation/AdminApprovalsPage'));
const AdminAiPage = lazy(() => import('./pages/automation/AdminAiPage'));
const AdminVisualAgentPage = lazy(() => import('./pages/automation/AdminVisualAgentPage'));
const VisualAgentWidget = lazy(() => import('./features/avatar/VisualAgentWidget'));

// Support & Tickets Pages
const TicketDetailPage = lazy(() => import('./pages/TicketDetailPage'));
const ClientSupportPage = lazy(() => import('./pages/dashboard/ClientSupportPage'));
const AdminSupportPage = lazy(() => import('./pages/admin/AdminSupportPage'));

// Partner Pages
const PartnerLandingPage = lazy(() => import('./pages/partner/PartnerLandingPage'));
const PartnerRegisterPage = lazy(() => import('./pages/partner/PartnerRegisterPage'));
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
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // Captura UTMs/referrer no primeiro load e a cada navegacao
    captureAttribution();
  }, [pathname, search]);
  return null;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <Seo title="Página não encontrada" description="A página solicitada não foi encontrada." path={window.location.pathname} noindex />
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

const staticSeo: Record<string, { title: string; description: string }> = {
  '/automacao-ia': { title: 'Automação e Inteligência Artificial', description: 'Automação responsável de processos e atendimento com inteligência artificial.' },
  '/techcare': { title: 'Nextia TechCare | Suporte de TI', description: 'Suporte técnico contínuo para computadores, sistemas e operação da empresa.' },
  '/redes-wifi': { title: 'Redes e Wi-Fi para Empresas', description: 'Projeto, instalação e melhoria de redes e Wi-Fi corporativo.' },
  '/cameras-seguranca': { title: 'Câmeras de Segurança', description: 'Instalação e suporte para sistemas de câmeras e monitoramento.' },
  '/planos': { title: 'Planos e Preços', description: 'Compare os planos digitais da Nextia e escolha a estrutura adequada ao seu negócio.' },
  '/como-funciona': { title: 'Como funciona a Nextia', description: 'Conheça o processo de diagnóstico, desenvolvimento, entrega e acompanhamento da Nextia.' },
  '/projeto-personalizado': { title: 'Projeto Personalizado', description: 'Solicite uma avaliação para um projeto digital alinhado às necessidades da sua empresa.' },
  '/contato': { title: 'Contato', description: 'Entre em contato com a Nextia para falar sobre tecnologia, suporte ou um novo projeto.' },
  '/orcamento': { title: 'Solicitar Orçamento', description: 'Informe as necessidades do projeto para receber uma avaliação comercial da Nextia.' },
  '/termos': { title: 'Termos de Uso', description: 'Termos de uso dos serviços e canais digitais da Nextia.' },
  '/privacidade': { title: 'Política de Privacidade', description: 'Política de privacidade e tratamento de dados pessoais da Nextia.' },
  '/cookies': { title: 'Política de Cookies', description: 'Informações sobre o uso de cookies nos canais digitais da Nextia.' },
};

function StaticRouteSeo() {
  const { pathname } = useLocation();
  const entry = staticSeo[pathname];
  return entry ? <Seo {...entry} path={pathname} /> : null;
}

function LegacyTemplateRedirect() {
  const { slug } = useParams();
  return <Navigate to={slug ? `/modelos/${slug}` : '/modelos'} replace />;
}

function LegacyCityRedirect() {
  const { pathname, search } = useLocation();
  return <Navigate to={`${pathname.replace(/^\/cidade/, '') || '/'}${search}`} replace />;
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
      <Route path="/sites-prontos" element={<Navigate to="/modelos" replace />} />
      <Route path="/modelos" element={<TemplatesPage />} />
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
      <Route path="/templates/:slug" element={<LegacyTemplateRedirect />} />
      <Route path="/modelos/:slug" element={<TemplateDetailPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
      <Route path="/cases" element={<CasesPage />} />
      <Route path="/demo/:slug" element={<TemplateDemoPage />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/como-funciona" element={<HowItWorksPage />} />
      <Route path="/projeto-personalizado" element={<CustomProjectPage />} />
      <Route path="/contato" element={<ContactPage />} />
      <Route path="/orcamento" element={<QuotePage />} />
      <Route path="/conteudos" element={<ContentHubPage />} />
      <Route path="/conteudos/:slug" element={<ContentDetailPage />} />
      <Route path="/bauru" element={<CityPage />} />
      <Route path="/bauru/:segmentSlug/:serviceSlug" element={<LocalNicheServicePage />} />
      <Route path="/bauru/:serviceSlug" element={<LocalServicePage />} />
      <Route path="/marilia" element={<CityPage />} />
      <Route path="/marilia/:segmentSlug/:serviceSlug" element={<LocalNicheServicePage />} />
      <Route path="/marilia/:serviceSlug" element={<LocalServicePage />} />
      <Route path="/cidade/:citySlug" element={<LegacyCityRedirect />} />
      <Route path="/cidade/:citySlug/:segmentSlug/:serviceSlug" element={<LegacyCityRedirect />} />
      <Route path="/cidade/:citySlug/:serviceSlug" element={<LegacyCityRedirect />} />
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
      <Route path="/painel/assinaturas" element={<DashboardContainer title="Assinaturas e pós-venda"><CustomerSuccessPage /></DashboardContainer>} />
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
      <Route path="/admin/automacoes" element={<AdminContainer title="Automações"><AdminAutomationsPage /></AdminContainer>}/>
      <Route path="/admin/automacoes/execucoes" element={<AdminContainer title="Execuções de automação"><AdminAutomationRunsPage /></AdminContainer>}/>
      <Route path="/admin/automacoes/aprovacoes" element={<AdminContainer title="Aprovações"><AdminApprovalsPage /></AdminContainer>}/>
      <Route path="/admin/ia" element={<AdminContainer title="Inteligência Artificial"><AdminAiPage /></AdminContainer>}/>
      <Route path="/admin/ia/assistente" element={<AdminContainer title="Assistente IA e Avatar Live2D"><AdminVisualAgentPage /></AdminContainer>}/>
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
      <Route path="/admin/customer-success" element={<AdminContainer title="Recorrência e Customer Success"><AdminCustomerSuccessPage /></AdminContainer>} />
      <Route path="/admin/conteudos" element={<AdminContainer title="Conteúdo e SEO"><AdminContentPage /></AdminContainer>} />
      <Route
        path="/admin/catalogo"
        element={
          <AdminContainer title="Catálogo Comercial">
            <AdminCatalogPage />
          </AdminContainer>
        }
      />
      <Route path="/admin/projetos/:projectId" element={<AdminContainer title="Detalhe do projeto"><AdminProjectDetailPage /></AdminContainer>} />
      <Route path="/admin/modelos" element={<AdminContainer title="Modelos de Sites"><AdminModelsPage /></AdminContainer>} />
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

      {/* ===== CRM Routes ===== */}
      <Route
        path="/admin/crm"
        element={
          <AdminContainer title="CRM — Nextia">
            <Suspense fallback={<div className="text-white text-center py-20">Carregando CRM...</div>}><AdminCrmDashboardPage /></Suspense>
          </AdminContainer>
        }
      />
      <Route
        path="/admin/crm/leads"
        element={
          <AdminContainer title="CRM — Leads">
            <Suspense fallback={<div className="text-white text-center py-20">Carregando...</div>}><AdminLeadsPage /></Suspense>
          </AdminContainer>
        }
      />
      <Route
        path="/admin/crm/leads/:id"
        element={
          <AdminContainer title="CRM — Detalhes do Lead">
            <Suspense fallback={<div className="text-white text-center py-20">Carregando...</div>}><AdminLeadsPage /></Suspense>
          </AdminContainer>
        }
      />
      <Route
        path="/admin/crm/opportunities"
        element={
          <AdminContainer title="CRM — Oportunidades">
            <Suspense fallback={<div className="text-white text-center py-20">Carregando...</div>}><AdminOpportunitiesPage /></Suspense>
          </AdminContainer>
        }
      />
      <Route
        path="/admin/crm/pipeline"
        element={
          <AdminContainer title="CRM — Funil Comercial">
            <Suspense fallback={<div className="text-white text-center py-20">Carregando...</div>}><AdminOpportunitiesPage /></Suspense>
          </AdminContainer>
        }
      />
      <Route
        path="/admin/crm/activities"
        element={
          <AdminContainer title="CRM — Atividades e Follow-ups">
            <Suspense fallback={<div className="text-white text-center py-20">Carregando...</div>}><AdminActivitiesPage /></Suspense>
          </AdminContainer>
        }
      />
      <Route
        path="/admin/crm/proposals"
        element={
          <AdminContainer title="CRM — Propostas">
            <Suspense fallback={<div className="text-white text-center py-20">Carregando...</div>}><AdminProposalsPage /></Suspense>
          </AdminContainer>
        }
      />
      <Route
        path="/admin/crm/settings"
        element={
          <AdminContainer title="CRM — Configurações">
            <Suspense fallback={<div className="text-white text-center py-20">Carregando...</div>}><AdminCrmSettingsPage /></Suspense>
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

  const securedContent = <>{isPrivate ? <Seo title="Área restrita" description="Área autenticada da plataforma Nextia." path={pathname} noindex /> : <StaticRouteSeo />}{content}</>;
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
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Carregando...</div>}>
                <AppRoutes />
              </Suspense>
              <Suspense fallback={null}><VisualAgentWidget /></Suspense>
            </ServiceEngagementProvider>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
