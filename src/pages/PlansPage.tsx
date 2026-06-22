import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, MessageCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { plans, planComparison } from '../data/plans';

export default function PlansPage() {

  useEffect(() => {
    document.title = 'Planos e Preços — Nextia';
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f0c29] to-[#1E1B4B] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="primary" size="md" className="mb-4">Planos e preços</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Escolha o plano ideal para o seu negócio
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Sem surpresas. Tudo incluído. Suporte contínuo para fazer seu negócio crescer.
          </p>
          <p className="text-xs text-gray-500">*Contrato mínimo de 12 meses. Valores promocionais podem alterar-se sem aviso prévio.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        {/* Plans Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-xl flex flex-col ${
                plan.highlight
                  ? 'border-[#5B4FE9] shadow-xl shadow-[#5B4FE9]/15 scale-[1.02]'
                  : 'border-gray-100 shadow-md hover:border-gray-200'
              }`}
            >
              {/* Highlight bar */}
              {plan.highlight && (
                <div className="h-1.5 bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed]" />
              )}

              <div className="p-6 flex flex-col flex-1">
                {plan.badge && (
                  <div className="mb-3">
                    <Badge variant="gradient">{plan.badge}</Badge>
                  </div>
                )}

                <h2 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-gray-500 text-xs mb-5 leading-relaxed">{plan.subtitle}</p>

                {/* Price */}
                {plan.price > 0 ? (
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900">R$ {plan.price}</span>
                      <span className="text-gray-400 text-sm">/mês</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      + R$ {plan.activationFee} taxa de ativação
                    </div>
                  </div>
                ) : (
                  <div className="mb-5">
                    <div className="text-2xl font-black text-gray-900">Sob consulta</div>
                    <div className="text-xs text-gray-400 mt-1">Orçamento personalizado</div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-50 my-5" />

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 opacity-40">
                      <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-400 text-sm line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.id === 'custom' ? (
                  <div className="space-y-2">
                    <Link to="/projeto-personalizado">
                      <Button variant="gradient" size="md" fullWidth>{plan.ctaLabel}</Button>
                    </Link>
                    <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" fullWidth>
                        <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                        Falar no WhatsApp
                      </Button>
                    </a>
                  </div>
                ) : (
                  <Link to={`/cadastro?plano=${plan.id}`}>
                    <Button
                      variant={plan.highlight ? 'gradient' : 'outline'}
                      size="md"
                      fullWidth
                    >
                      {plan.ctaLabel}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-2xl font-black text-gray-900">Comparativo de planos</h2>
            <p className="text-gray-500 text-sm mt-1">Veja o que cada plano oferece em detalhes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left p-4 text-sm font-semibold text-gray-500 w-1/2">Recurso</th>
                  <th className="text-center p-4 text-sm font-bold text-gray-700 w-1/6">Start</th>
                  <th className="text-center p-4 text-sm font-bold text-[#5B4FE9] w-1/6 bg-[#eef2ff]">Pro</th>
                  <th className="text-center p-4 text-sm font-bold text-[#7c3aed] w-1/6">Business</th>
                </tr>
              </thead>
              <tbody>
                {planComparison.map((row, index) => (
                  <tr key={row.feature} className={index % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="p-4 text-sm text-gray-700">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.start === 'boolean' ? (
                        row.start
                          ? <Check className="w-4 h-4 text-green-500 mx-auto" />
                          : <X className="w-4 h-4 text-gray-200 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600">{row.start}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-[#eef2ff]/30">
                      {typeof row.pro === 'boolean' ? (
                        row.pro
                          ? <Check className="w-4 h-4 text-[#5B4FE9] mx-auto" />
                          : <X className="w-4 h-4 text-gray-200 mx-auto" />
                      ) : (
                        <span className="text-sm text-[#5B4FE9] font-medium">{row.pro}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.business === 'boolean' ? (
                        row.business
                          ? <Check className="w-4 h-4 text-[#7c3aed] mx-auto" />
                          : <X className="w-4 h-4 text-gray-200 mx-auto" />
                      ) : (
                        <span className="text-sm text-[#7c3aed] font-medium">{row.business}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Perguntas frequentes sobre os planos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: 'Há contrato de fidelidade?', a: 'Sim, o contrato mínimo é de 12 meses. Isso garante que tenhamos tempo hábil para entregar os melhores resultados.' },
              { q: 'Posso mudar de plano?', a: 'Sim! Você pode fazer upgrade a qualquer momento. O downgrade é avaliado ao final do período contratado.' },
              { q: 'O que é uma "solicitação"?', a: 'Solicitação é qualquer alteração simples no site: troca de texto, imagem, banner, horário etc.' },
              { q: 'Hospedagem e domínio estão incluídos?', a: 'Hospedagem sempre inclusa. O domínio é gratuito no primeiro ano nos planos Pro e Business, depois há renovação anual.' },
              { q: 'E se eu precisar cancelar?', a: 'Entendemos que situações mudam. Solicite o cancelamento com 30 dias de antecedência ao fim do período mínimo.' },
              { q: 'Quais formas de pagamento?', a: 'Aceitamos cartão de crédito, PIX e boleto bancário. Futuramente via Mercado Pago e Asaas.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] rounded-3xl p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ainda com dúvidas? Fale com a gente.
          </h2>
          <p className="text-white/80 mb-6">Nossa equipe está pronta para ajudar você a escolher o melhor plano.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              <Button variant="white" size="lg">
                <MessageCircle className="w-4 h-4 text-green-500" />
                WhatsApp
              </Button>
            </a>
            <Link to="/contato">
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                Enviar mensagem
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
