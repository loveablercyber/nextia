import clsx from 'clsx';
import { type ProjectType, projectTypes } from '../../data/quoteConfig';

interface Step1Props {
  value: ProjectType | null;
  onChange: (v: ProjectType) => void;
}

export default function Step1_ProjectType({ value, onChange }: Step1Props) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
        Que tipo de projeto você precisa?
      </h2>
      <p className="text-gray-500 mb-8">
        Selecione a opção que melhor representa o que você quer criar.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {projectTypes.map((pt) => {
          const isSelected = value === pt.id;
          return (
            <button
              key={pt.id}
              onClick={() => onChange(pt.id)}
              className={clsx(
                'group relative text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md',
                isSelected
                  ? 'border-[#5B4FE9] bg-[#eef2ff] shadow-md shadow-[#5B4FE9]/10'
                  : 'border-gray-100 bg-white hover:border-[#c7d2fe]'
              )}
            >
              {/* Selection indicator */}
              <div
                className={clsx(
                  'absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                  isSelected
                    ? 'border-[#5B4FE9] bg-[#5B4FE9]'
                    : 'border-gray-200 group-hover:border-[#5B4FE9]'
                )}
              >
                {isSelected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                  </svg>
                )}
              </div>

              <div className="text-3xl mb-3">{pt.emoji}</div>
              <div className="font-bold text-gray-900 text-sm mb-1">{pt.label}</div>
              <div className="text-gray-400 text-xs leading-relaxed mb-3">{pt.description}</div>

              {pt.baseActivation > 0 && (
                <div className={clsx('text-xs font-semibold', isSelected ? 'text-[#5B4FE9]' : 'text-gray-400')}>
                  A partir de R$ {pt.baseMonthly}/mês
                </div>
              )}
              {pt.baseActivation === 0 && (
                <div className={clsx('text-xs font-semibold', isSelected ? 'text-[#5B4FE9]' : 'text-gray-400')}>
                  Sob orçamento
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
