import { useState } from 'react';
import {
  ClipboardList, CheckCircle2, ArrowRight, ArrowLeft,
  Building2, Palette, Layers, Send, FileCheck, Edit3,
  Phone, Share2, MapPin, Clock, Sparkles
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import Button from '../../components/ui/Button';

const PAGE_OPTIONS = [
  { id: 'home', label: 'Página Inicial (Home)' },
  { id: 'sobre', label: 'Sobre Nós / A Empresa' },
  { id: 'servicos', label: 'Serviços / Produtos' },
  { id: 'galeria', label: 'Galeria de Fotos / Portfólio' },
  { id: 'depoimentos', label: 'Depoimentos de Clientes' },
  { id: 'faq', label: 'Perguntas Frequentes (FAQ)' },
  { id: 'contato', label: 'Formulário e Dados de Contato' },
  { id: 'blog', label: 'Blog / Notícias' },
];

const STYLE_OPTIONS = [
  { id: 'moderno', title: 'Moderno & Limpo', desc: 'Design clean com foco em usabilidade e fontes atuais.' },
  { id: 'elegante', title: 'Elegante & Sofisticado', desc: 'Tons refinados, tipografia de alto padrão e visual premium.' },
  { id: 'corporativo', title: 'Corporativo & Profissional', desc: 'Visual sóbrio que transmite segurança e autoridade no mercado.' },
  { id: 'criativo', title: 'Criativo & Colorido', desc: 'Cores vibrantes, elementos dinâmicos e layout expressivo.' },
];

export default function BriefingPage() {
  const { project, saveBriefing, loading } = useProject();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const existingBriefing = project?.briefing;

  const [formData, setFormData] = useState({
    businessName: existingBriefing?.businessName || project?.name || '',
    segment: existingBriefing?.segment || project?.segment || '',
    description: existingBriefing?.description || '',
    targetAudience: existingBriefing?.targetAudience || '',
    slogan: existingBriefing?.slogan || '',
    hasLogo: existingBriefing?.hasLogo || ('sim' as 'sim' | 'nao'),
    colorPreference: existingBriefing?.colorPreference || '',
    visualStyle: existingBriefing?.visualStyle || 'moderno',
    referenceUrls: existingBriefing?.referenceUrls || '',
    pages: existingBriefing?.pages || ['home', 'sobre', 'servicos', 'contato'],
    mainServices: existingBriefing?.mainServices || '',
    whatsapp: existingBriefing?.whatsapp || '',
    instagram: existingBriefing?.instagram || '',
    facebook: existingBriefing?.facebook || '',
    address: existingBriefing?.address || '',
    businessHours: existingBriefing?.businessHours || '',
    additionalNotes: existingBriefing?.additionalNotes || '',
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B4FE9]" />
      </div>
    );
  }

  const handlePageToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      pages: prev.pages.includes(id)
        ? prev.pages.filter((p) => p !== id)
        : [...prev.pages, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await saveBriefing(formData);

    setSubmitting(false);
    setIsEditing(false);
  };

  // Se briefing ja foi enviado e usuario nao esta editando
  if (existingBriefing?.submitted && !isEditing) {
    return (
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="bg-gradient-to-br from-[#5B4FE9] via-[#4F46E5] to-[#7C3AED] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Briefing Enviado
                  </span>
                  {existingBriefing.submittedAt && (
                    <span className="text-white/70 text-xs">
                      em {new Date(existingBriefing.submittedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold">Briefing do Projeto — {existingBriefing.businessName}</h1>
                <p className="text-white/80 text-xs sm:text-sm mt-1">
                  Sua estrutura já foi enviada para a nossa equipe e o site está em desenvolvimento.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm self-start sm:self-auto flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Atualizar Respostas
            </Button>
          </div>
        </div>

        {/* Responses Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Negocio */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#5B4FE9]" />
              Informações do Negócio
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 text-xs block">Nome da Empresa:</span>
                <p className="font-semibold text-gray-800">{existingBriefing.businessName}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Ramo de Atuação:</span>
                <p className="font-medium text-gray-700">{existingBriefing.segment}</p>
              </div>
              {existingBriefing.slogan && (
                <div>
                  <span className="text-gray-400 text-xs block">Slogan:</span>
                  <p className="italic text-gray-600">"{existingBriefing.slogan}"</p>
                </div>
              )}
              <div>
                <span className="text-gray-400 text-xs block">Descrição da Empresa:</span>
                <p className="text-gray-600 text-xs leading-relaxed">{existingBriefing.description || 'Não especificada'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Público-Alvo:</span>
                <p className="text-gray-600 text-xs">{existingBriefing.targetAudience || 'Não especificado'}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Visual */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#5B4FE9]" />
              Identidade Visual & Estilo
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 text-xs block">Possui Logotipo:</span>
                <p className="font-semibold text-gray-800">
                  {existingBriefing.hasLogo === 'sim' ? 'Sim (Anexado nos arquivos)' : 'Não (Precisa de ajuda)'}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Cores de Preferência:</span>
                <p className="font-medium text-gray-700">{existingBriefing.colorPreference || 'A critério da equipe de design'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Estilo Visual Escolhido:</span>
                <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 text-[#5B4FE9] font-medium text-xs rounded-full capitalize">
                  {existingBriefing.visualStyle}
                </span>
              </div>
              {existingBriefing.referenceUrls && (
                <div>
                  <span className="text-gray-400 text-xs block">Sites de Referência:</span>
                  <p className="text-xs text-[#5B4FE9] underline break-all">{existingBriefing.referenceUrls}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Estrutura & Paginas */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5B4FE9]" />
              Páginas & Conteúdo
            </h3>
            <div>
              <span className="text-gray-400 text-xs block mb-2">Páginas Solicitadas:</span>
              <div className="flex flex-wrap gap-2">
                {existingBriefing.pages.map((pId) => {
                  const opt = PAGE_OPTIONS.find((o) => o.id === pId);
                  return (
                    <span key={pId} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                      {opt?.label || pId}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">Principais Serviços / Produtos:</span>
              <p className="text-gray-600 text-xs leading-relaxed">{existingBriefing.mainServices || 'Não especificados'}</p>
            </div>
          </div>

          {/* Card 4: Contatos & Redes */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#5B4FE9]" />
              Contatos & Redes Sociais
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-3.5 h-3.5 text-green-600" />
                <span className="font-medium">WhatsApp:</span> {existingBriefing.whatsapp || 'Não informado'}
              </div>
              {existingBriefing.instagram && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Share2 className="w-3.5 h-3.5 text-pink-600" />
                  <span className="font-medium">Instagram:</span> {existingBriefing.instagram}
                </div>
              )}
              {existingBriefing.facebook && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium">Facebook:</span> {existingBriefing.facebook}
                </div>
              )}
              {existingBriefing.address && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-medium">Endereço:</span> {existingBriefing.address}
                </div>
              )}
              {existingBriefing.businessHours && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium">Horários:</span> {existingBriefing.businessHours}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Briefing Form Wizard
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5B4FE9] font-bold text-xs uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4" />
            Briefing Oficial do Projeto
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Elaboração do Seu Site</h1>
          <p className="text-gray-500 text-xs mt-1">
            Preencha as informações abaixo para alinharmos a criação do site ao seu negócio.
          </p>
        </div>

        {/* Step Numbers */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`w-8 h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                step === s
                  ? 'bg-[#5B4FE9] text-white shadow-md'
                  : step > s
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200/60 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Wizard Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8">
          {/* STEP 1: Negocio */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#5B4FE9]" />
                  Passo 1 de 4 — Dados do Seu Negócio
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Conte-nos sobre a sua empresa para definirmos a comunicação visual.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nome Fantasia / Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                    placeholder="Ex: Nextia Soluções"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ramo / Segmento de Atuação <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                    placeholder="Ex: Restaurante, Estética, Advocacia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Slogan ou Frase de Impacto
                </label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                  placeholder="Ex: Transformando ideias em resultados digitais"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descrição da Empresa & Diferenciais <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                  placeholder="Descreva o que a sua empresa faz, tempo de mercado e principais diferenciais..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Público-Alvo
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                  placeholder="Ex: Homens e mulheres de 25 a 45 anos, empresários B2B..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: Visual */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#5B4FE9]" />
                  Passo 2 de 4 — Identidade Visual & Design
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Escolha o estilo e as cores que melhor representam a sua marca.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Você já possui logotipo?
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasLogo: 'sim' })}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      formData.hasLogo === 'sim'
                        ? 'border-[#5B4FE9] bg-indigo-50/50 text-[#5B4FE9]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${formData.hasLogo === 'sim' ? 'text-[#5B4FE9]' : 'text-gray-300'}`} />
                    <div>
                      <div className="font-bold text-sm">Sim, já tenho logotipo</div>
                      <div className="text-xs text-gray-500">Vou enviar o arquivo na aba de arquivos ou finalização.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasLogo: 'nao' })}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      formData.hasLogo === 'nao'
                        ? 'border-[#5B4FE9] bg-indigo-50/50 text-[#5B4FE9]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${formData.hasLogo === 'nao' ? 'text-[#5B4FE9]' : 'text-gray-300'}`} />
                    <div>
                      <div className="font-bold text-sm">Não tenho logotipo</div>
                      <div className="text-xs text-gray-500">A equipe pode criar uma versão textual em alta definição.</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cores de Preferência
                </label>
                <input
                  type="text"
                  value={formData.colorPreference}
                  onChange={(e) => setFormData({ ...formData, colorPreference: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                  placeholder="Ex: Azul escuro e dourado, Tons pastéis de verde e bege..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Estilo Visual Desejado
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {STYLE_OPTIONS.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, visualStyle: st.id })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        formData.visualStyle === st.id
                          ? 'border-[#5B4FE9] bg-indigo-50/40 text-[#5B4FE9]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-sm text-gray-900 mb-1">{st.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Sites de Referência que Você Gosta (URLs)
                </label>
                <input
                  type="text"
                  value={formData.referenceUrls}
                  onChange={(e) => setFormData({ ...formData, referenceUrls: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                  placeholder="Ex: https://siteexemplo.com.br, https://outroexemplo.com"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Conteudo & Paginas */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#5B4FE9]" />
                  Passo 3 de 4 — Páginas & Conteúdo
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Selecione as seções do site e os dados de contato público.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Selecione as Páginas/Seções Desejadas
                </label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {PAGE_OPTIONS.map((pg) => {
                    const isSelected = formData.pages.includes(pg.id);
                    return (
                      <button
                        key={pg.id}
                        type="button"
                        onClick={() => handlePageToggle(pg.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'border-[#5B4FE9] bg-indigo-50/60 text-[#5B4FE9] font-semibold'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-[#5B4FE9] border-[#5B4FE9] text-white' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className="text-xs">{pg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Principais Serviços ou Produtos a Destacar <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.mainServices}
                  onChange={(e) => setFormData({ ...formData, mainServices: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                  placeholder="Liste os principais produtos ou serviços oferecidos para destaque na página principal..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-green-600" /> WhatsApp para Atendimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-pink-600" /> Instagram (@usuario)
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                    placeholder="@suaempresa"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Endereço Físico (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                    placeholder="Av. Paulista, 1000 — São Paulo, SP"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={formData.businessHours}
                    onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                    placeholder="Segunda a Sexta das 08h às 18h"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Finalizacao */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#5B4FE9]" />
                  Passo 4 de 4 — Revisão & Finalização
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Confira as informações e adicione notas finais antes de enviar.
                </p>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-2 text-xs text-indigo-900">
                <div className="font-bold flex items-center gap-1.5 text-sm text-[#5B4FE9]">
                  <Sparkles className="w-4 h-4" /> Resumo do Envio
                </div>
                <p>Empresa: <strong className="text-gray-900">{formData.businessName}</strong> ({formData.segment})</p>
                <p>Estilo: <strong className="text-gray-900 capitalize">{formData.visualStyle}</strong> | Logo: <strong>{formData.hasLogo === 'sim' ? 'Sim' : 'Não'}</strong></p>
                <p>Páginas selecionadas: <strong>{formData.pages.length} seções</strong></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Observações Finais ou Pedidos Especiais
                </label>
                <textarea
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                  placeholder="Escreva aqui qualquer detalhe adicional que nossa equipe deva saber..."
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500">
                💡 <strong>Dica:</strong> Você também pode enviar imagens, PDF de cardápio ou documentos na aba <strong>Arquivos</strong> do seu painel a qualquer momento.
              </div>
            </div>
          )}
        </div>

        {/* Buttons Footer */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          ) : <div />}

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5"
            >
              Avançar <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-[#5B4FE9] hover:bg-[#4F46E5] flex items-center gap-2 shadow-md"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Finalizar e Enviar Briefing
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
