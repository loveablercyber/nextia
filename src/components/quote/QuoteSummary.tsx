import { Link } from 'react-router-dom';
import {
  CheckCircle, Clock, MessageCircle,
  Zap, BarChart3, Star, RefreshCw
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import type { QuoteFormData, QuoteResult } from '../../data/quoteCalculator';
import { projectTypes, segments, urgencyOptions } from '../../data/quoteConfig';

interface QuoteSummaryProps {
  formData: QuoteFormData;
  result: QuoteResult;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  submitted: boolean;
}

const planColors: Record<string, string> = {
  Start: '#64748b',
  Pro: '#5B4FE9',
  Business: '#7c3aed',
  Personalizado: '#059669',
};

export default function QuoteSummary({ formData, result, onSubmit, onReset, submitting, submitted }: QuoteSummaryProps) {
  const projectLabel = projectTypes.find(p => p.id === formData.projectType)?.label ?? '';
  const segmentLabel = segments.find(s => s.id === formData.segment)?.label ?? '';
  const urgencyLabel = urgencyOptions.find(u => u.id === formData.urgency)?.label ?? '';

  const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const waMessage = `🎯 *ORÇAMENTO NEXTIA*

👤 Nome: ${formData.name}
🏢 Empresa: ${formData.company || 'Não informada'}
📱 WhatsApp: ${formData.whatsapp}
📧 Email: ${formData.email}

📋 *DETALHES DO PROJETO*
Tipo: ${projectLabel}
Segmento: ${segmentLabel || 'Não informado'}
Páginas: ${formData.pagesCount}
Urgência: ${urgencyLabel || 'Não informada'}
Orçamento: ${formData.budgetRange || 'Não informado'}

✅ *FUNCIONALIDADES*
${result.selectedFeatureLabels.length > 0 ? result.selectedFeatureLabels.map(f => `• ${f}`).join('\n') : '• Padrão do plano'}

💰 *VALORES ESTIMADOS*
Ativação: ${formatMoney(result.activationMin)} - ${formatMoney(result.activationMax)}
Mensalidade: ${formatMoney(result.monthlyMin)} - ${formatMoney(result.monthlyMax)}
Plano Recomendado: ${result.recommendedPlan}
Prazo: ${result.daysMin} - ${result.daysMax} dias úteis`;

  const waUrl = `https://wa.me/5514996405496?text=${encodeURIComponent(waMessage)}`;

  if (submitted) {
    return (
      <div className="text-center py-12 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <Badge variant="success" size="md" className="mb-4">Orçamento enviado!</Badge>
        <h2 className="text-3xl font-black text-gray-900 mb-3">
          Recebemos sua solicitação! 🎉
        </h2>
        <p className="text-gray-500 mb-2">
          <strong>{formData.name}</strong>, em breve nossa equipe entrará em contato pelo{' '}
          <strong>WhatsApp ({formData.whatsapp})</strong> e pelo e-mail{' '}
          <strong>{formData.email}</strong>.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Tempo médio de resposta: até 2 horas úteis.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" size="lg">
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp agora
            </Button>
          </a>
          <Link to="/sites-prontos">
            <Button variant="outline" size="lg">Ver templates prontos</Button>
          </Link>
        </div>
        <button
          onClick={onReset}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Novo orçamento
        </button>
      </div>
    );
  }

  if (result.isCustom) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Projeto Personalizado</h2>
          <p className="text-gray-500">
            Sua solicitação é de um projeto exclusivo. Nossa equipe vai analisar suas respostas e preparar uma proposta detalhada.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] rounded-3xl p-8 text-center text-white mb-6">
          <div className="text-4xl font-black mb-2">Sob orçamento</div>
          <p className="text-white/80">Nossa equipe entrará em contato com uma proposta personalizada</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Resumo das suas escolhas</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Projeto</span><span className="font-medium">{projectLabel}</span></div>
            {segmentLabel && <div className="flex justify-between"><span>Segmento</span><span className="font-medium">{segmentLabel}</span></div>}
            {urgencyLabel && <div className="flex justify-between"><span>Urgência</span><span className="font-medium">{urgencyLabel}</span></div>}
            {formData.name && <div className="flex justify-between"><span>Contato</span><span className="font-medium">{formData.name}</span></div>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="gradient" size="lg" fullWidth onClick={onSubmit} loading={submitting}>
            Solicitar proposta
          </Button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="lg" fullWidth>
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const planColor = planColors[result.recommendedPlan] ?? '#5B4FE9';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Badge variant="success" size="md" className="mb-3">Estimativa calculada</Badge>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Sua estimativa de investimento
        </h2>
        <p className="text-gray-500 text-sm">
          Valores estimados com base nas suas respostas · Proposta detalhada será enviada por nossa equipe
        </p>
      </div>

      {/* Main estimate cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Activation */}
        <div className="bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] rounded-2xl p-5 text-white text-center">
          <div className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-2">Taxa de ativação</div>
          <div className="text-3xl font-black">
            R$ {result.activationMin.toLocaleString('pt-BR')}
          </div>
          <div className="text-white/70 text-xs mt-1">
            até R$ {result.activationMax.toLocaleString('pt-BR')}
          </div>
          <div className="text-white/60 text-xs mt-2">Pagamento único</div>
        </div>

        {/* Monthly */}
        <div className="bg-white rounded-2xl border-2 border-[#5B4FE9] p-5 text-center shadow-md shadow-[#5B4FE9]/10">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Mensalidade estimada</div>
          <div className="text-3xl font-black text-gray-900">
            R$ {result.monthlyMin.toLocaleString('pt-BR')}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            até R$ {result.monthlyMax.toLocaleString('pt-BR')}/mês
          </div>
          <div className="text-gray-400 text-xs mt-2">Recorrente</div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Prazo estimado</div>
          <div className="text-3xl font-black text-gray-900">
            {result.daysMin}–{result.daysMax}
          </div>
          <div className="text-gray-400 text-xs mt-1">dias úteis</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-gray-400 text-xs">
            <Clock className="w-3 h-3" />
            Após briefing
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Project summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#5B4FE9]" />
            Resumo do projeto
          </h3>
          <dl className="space-y-2.5">
            {[
              { label: 'Tipo', value: projectLabel },
              { label: 'Segmento', value: segmentLabel || '—' },
              { label: 'Páginas', value: `${formData.pagesCount <= 1 ? '1' : formData.pagesCount <= 5 ? '3 a 5' : formData.pagesCount <= 10 ? '6 a 10' : '10+'}` },
              { label: 'Urgência', value: urgencyLabel || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <dt className="text-gray-400">{label}</dt>
                <dd className="text-gray-900 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Recommended plan + features */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Plano recomendado
          </h3>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ backgroundColor: `${planColor}15`, color: planColor }}
          >
            <Zap className="w-3.5 h-3.5" />
            Nextia {result.recommendedPlan}
          </div>
          {result.selectedFeatureLabels.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Funcionalidades incluídas:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.selectedFeatureLabels.map(label => (
                  <span
                    key={label}
                    className="text-xs px-2.5 py-1 bg-[#eef2ff] text-[#5B4FE9] rounded-full font-medium"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {result.selectedFeatureLabels.length === 0 && (
            <p className="text-gray-400 text-xs">Funcionalidades padrão do plano</p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold">Esta é uma estimativa preliminar.</span> O valor final será definido após análise detalhada do briefing completo e reunião com nossa equipe. Pode haver variações de acordo com a complexidade real do projeto.
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="gradient" size="lg" fullWidth onClick={onSubmit} loading={submitting}>
          <CheckCircle className="w-4 h-4" />
          Solicitar proposta detalhada
        </Button>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="outline" size="lg" fullWidth>
            <MessageCircle className="w-4 h-4 text-green-500" />
            Falar no WhatsApp
          </Button>
        </a>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5 mx-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refazer orçamento
        </button>
      </div>
    </div>
  );
}
