import { useState } from 'react';
import {
  CreditCard, CheckCircle2, AlertTriangle, Download, ArrowUpRight, DollarSign, ExternalLink
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import Button from '../../components/ui/Button';

export default function PaymentsPage() {
  const { project, simulatePayment } = useProject();
  const [payingId, setPayingId] = useState<string | null>(null);

  if (!project) return null;

  const handlePay = async (id: string) => {
    setPayingId(id);
    await simulatePayment(id);
    setPayingId(null);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return (
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
            <CheckCircle2 className="w-3 h-3" /> Pago
          </span>
        );
      case 'atrasado':
        return (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
            <AlertTriangle className="w-3 h-3" /> Atrasado
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
            <CreditCard className="w-3 h-3 animate-pulse" /> Pendente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards stats */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-xs block mb-0.5">Mensalidade</span>
            <span className="text-lg font-black text-gray-950">
              R$ {project.monthlyFee.toLocaleString('pt-BR')} /mês
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eef2ff] text-[#5B4FE9] flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-xs block mb-0.5">Método cadastrado</span>
            <span className="text-sm font-bold text-gray-800">Boleto Bancário / Pix</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 sm:col-span-2 md:col-span-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-xs block mb-0.5">Plano atual</span>
            <span className="text-sm font-bold text-gray-800">Nextia {project.plan}</span>
          </div>
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-950 text-sm mb-4">Faturas e mensalidades</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 uppercase font-semibold text-[10px]">
                <th className="pb-3 w-[250px]">Descrição</th>
                <th className="pb-3 w-[100px]">Vencimento</th>
                <th className="pb-3 w-[100px]">Valor</th>
                <th className="pb-3 w-[120px]">Status</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {project.payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/20 transition-all">
                  <td className="py-4 font-bold text-gray-900">{p.description}</td>
                  <td className="py-4">{formatDate(p.dueDate)}</td>
                  <td className="py-4 font-semibold text-gray-900">
                    R$ {p.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4">{getStatusBadge(p.status)}</td>
                  <td className="py-4 text-right">
                    {p.status === 'pago' ? (
                      <a
                        href={p.invoiceUrl}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 font-semibold px-2 py-1 rounded-lg hover:bg-gray-50 transition-all"
                        title="Baixar comprovante"
                      >
                        <Download className="w-3.5 h-3.5" /> Comprovante
                      </a>
                    ) : (
                      <Button
                        variant="gradient"
                        size="xs"
                        loading={payingId === p.id}
                        onClick={() => handlePay(p.id)}
                      >
                        Pagar com Pix / Boleto
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
