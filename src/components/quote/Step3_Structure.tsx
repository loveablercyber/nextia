import clsx from 'clsx';
import { structureFeatures, pageOptions } from '../../data/quoteConfig';

interface Step3Props {
  pagesCount: number;
  selectedFeatures: string[];
  onPagesChange: (v: number) => void;
  onToggleFeature: (id: string) => void;
}

export default function Step3_Structure({ pagesCount, selectedFeatures, onPagesChange, onToggleFeature }: Step3Props) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
        Qual estrutura você precisa?
      </h2>
      <p className="text-gray-500 mb-8">
        Selecione quantas páginas e quais funcionalidades seu site terá. Você pode escolher mais de uma.
      </p>

      {/* Pages count */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Quantidade de páginas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pageOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPagesChange(opt.value)}
              className={clsx(
                'p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-center',
                pagesCount === opt.value
                  ? 'border-[#5B4FE9] bg-[#eef2ff] text-[#5B4FE9]'
                  : 'border-gray-100 bg-white text-gray-600 hover:border-[#c7d2fe]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          Funcionalidades desejadas
          <span className="text-gray-400 font-normal normal-case ml-2">(selecione quantas quiser)</span>
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {structureFeatures.map((feat) => {
            const isSelected = selectedFeatures.includes(feat.id);
            return (
              <button
                key={feat.id}
                onClick={() => onToggleFeature(feat.id)}
                className={clsx(
                  'flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-sm',
                  isSelected
                    ? 'border-[#5B4FE9] bg-[#eef2ff]'
                    : 'border-gray-100 bg-white hover:border-[#c7d2fe]'
                )}
              >
                {/* Checkbox visual */}
                <div
                  className={clsx(
                    'mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200',
                    isSelected ? 'bg-[#5B4FE9] border-[#5B4FE9]' : 'border-gray-300'
                  )}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{feat.emoji}</span>
                    <span className={clsx('font-semibold text-sm', isSelected ? 'text-[#5B4FE9]' : 'text-gray-800')}>
                      {feat.label}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">{feat.description}</div>
                  {feat.addActivation > 0 && (
                    <div className={clsx('text-xs font-medium mt-1.5', isSelected ? 'text-[#5B4FE9]' : 'text-gray-400')}>
                      + R$ {feat.addActivation} ativação
                      {feat.addMonthly > 0 && ` · + R$ ${feat.addMonthly}/mês`}
                    </div>
                  )}
                  {feat.addActivation === 0 && (
                    <div className={clsx('text-xs font-medium mt-1.5', isSelected ? 'text-green-600' : 'text-gray-400')}>
                      Incluído
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
