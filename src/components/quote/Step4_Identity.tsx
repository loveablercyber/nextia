import clsx from 'clsx';
import type { QuoteFormData } from '../../data/quoteCalculator';

interface Step4Props {
  formData: QuoteFormData;
  updateField: <K extends keyof QuoteFormData>(field: K, value: QuoteFormData[K]) => void;
}

interface ToggleCardProps {
  label: string;
  description: string;
  value: boolean | null;
  onYes: () => void;
  onNo: () => void;
}

function ToggleCard({ label, description, value, onYes, onNo }: ToggleCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-3">
        <div className="font-semibold text-gray-900 text-sm mb-0.5">{label}</div>
        <div className="text-gray-400 text-xs leading-relaxed">{description}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onYes}
          className={clsx(
            'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2',
            value === true
              ? 'border-[#5B4FE9] bg-[#5B4FE9] text-white'
              : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-[#5B4FE9] hover:text-[#5B4FE9]'
          )}
        >
          ✅ Sim, tenho
        </button>
        <button
          onClick={onNo}
          className={clsx(
            'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2',
            value === false
              ? 'border-red-400 bg-red-50 text-red-600'
              : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-red-200 hover:text-red-500'
          )}
        >
          ❌ Ainda não
        </button>
      </div>
    </div>
  );
}

export default function Step4_Identity({ formData, updateField }: Step4Props) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
        E a identidade visual?
      </h2>
      <p className="text-gray-500 mb-8">
        Informe o que você já tem para estimarmos o trabalho de forma mais precisa.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <ToggleCard
          label="Logotipo"
          description="Arquivo em boa qualidade (PNG, SVG, AI etc.)"
          value={formData.hasLogo}
          onYes={() => updateField('hasLogo', true)}
          onNo={() => updateField('hasLogo', false)}
        />
        <ToggleCard
          label="Fotos profissionais"
          description="Fotos do negócio, produtos ou ambiente"
          value={formData.hasPhotos}
          onYes={() => updateField('hasPhotos', true)}
          onNo={() => updateField('hasPhotos', false)}
        />
        <ToggleCard
          label="Textos prontos"
          description="Descrição de serviços, sobre a empresa etc."
          value={formData.hasTexts}
          onYes={() => updateField('hasTexts', true)}
          onNo={() => updateField('hasTexts', false)}
        />
        <ToggleCard
          label="Precisa de identidade visual"
          description="Criação de logo, paleta de cores e tipografia"
          value={formData.needsIdentity}
          onYes={() => updateField('needsIdentity', true)}
          onNo={() => updateField('needsIdentity', false)}
        />
      </div>

      {/* References field */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <label className="block font-semibold text-gray-900 text-sm mb-1">
          Tem referências de sites que gosta?
        </label>
        <p className="text-gray-400 text-xs mb-3">
          Cole os links abaixo (opcional) — isso ajuda muito nossa equipe de design.
        </p>
        <textarea
          rows={3}
          placeholder="Ex: https://restaurante.com.br, https://salao.com.br ..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm resize-none"
        />
      </div>

      {/* Tip box */}
      <div className="mt-4 flex items-start gap-3 bg-[#eef2ff] rounded-xl p-4 border border-[#c7d2fe]">
        <span className="text-xl">💡</span>
        <div>
          <div className="text-[#5B4FE9] font-semibold text-sm mb-0.5">Não tem logo ou fotos?</div>
          <div className="text-gray-600 text-xs leading-relaxed">
            Sem problema! Podemos indicar designers e fotógrafos parceiros. Incluiremos isso na sua proposta.
          </div>
        </div>
      </div>
    </div>
  );
}
