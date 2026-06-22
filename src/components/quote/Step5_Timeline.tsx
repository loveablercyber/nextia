import clsx from 'clsx';
import { type UrgencyType, type BudgetRange, urgencyOptions, budgetRanges } from '../../data/quoteConfig';

interface Step5Props {
  urgency: UrgencyType | null;
  budgetRange: BudgetRange | null;
  onUrgencyChange: (v: UrgencyType) => void;
  onBudgetChange: (v: BudgetRange) => void;
}

export default function Step5_Timeline({ urgency, budgetRange, onUrgencyChange, onBudgetChange }: Step5Props) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
        Prazo e investimento
      </h2>
      <p className="text-gray-500 mb-8">
        Essas informações nos ajudam a montar a melhor proposta para você.
      </p>

      {/* Urgency */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          Qual é a urgência? <span className="text-red-400">*</span>
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {urgencyOptions.map((opt) => {
            const isSelected = urgency === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onUrgencyChange(opt.id)}
                className={clsx(
                  'relative p-5 rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-md',
                  isSelected
                    ? 'border-[#5B4FE9] bg-[#eef2ff] shadow-md shadow-[#5B4FE9]/10'
                    : 'border-gray-100 bg-white hover:border-[#c7d2fe]'
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#5B4FE9] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  </div>
                )}
                <div className="text-3xl mb-2">{opt.emoji}</div>
                <div className={clsx('font-bold text-sm mb-1', isSelected ? 'text-[#5B4FE9]' : 'text-gray-900')}>
                  {opt.label}
                </div>
                <div className="text-gray-400 text-xs leading-relaxed">{opt.description}</div>
                {opt.multiplier > 1 && (
                  <div className="mt-2 text-xs font-medium text-amber-500">
                    +{Math.round((opt.multiplier - 1) * 100)}% urgência
                  </div>
                )}
                {opt.multiplier < 1 && (
                  <div className="mt-2 text-xs font-medium text-green-500">
                    Desconto disponível
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget range */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          Faixa de investimento <span className="text-red-400">*</span>
        </h3>
        <p className="text-gray-400 text-xs mb-4">
          Isso nos ajuda a adaptar a proposta ao seu momento. Não se preocupe — é apenas uma referência.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {budgetRanges.map((opt) => {
            const isSelected = budgetRange === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onBudgetChange(opt.id)}
                className={clsx(
                  'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-sm',
                  isSelected
                    ? 'border-[#5B4FE9] bg-[#eef2ff]'
                    : 'border-gray-100 bg-white hover:border-[#c7d2fe]'
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className={clsx('font-semibold text-sm', isSelected ? 'text-[#5B4FE9]' : 'text-gray-700')}>
                  {opt.label}
                </span>
                {isSelected && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-[#5B4FE9] flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
