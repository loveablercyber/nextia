import clsx from 'clsx';
import { type SegmentType, segments } from '../../data/quoteConfig';

interface Step2Props {
  value: SegmentType | null;
  onChange: (v: SegmentType) => void;
}

export default function Step2_Segment({ value, onChange }: Step2Props) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
        Qual é o segmento do seu negócio?
      </h2>
      <p className="text-gray-500 mb-8">
        Isso nos ajuda a personalizar o melhor modelo e funcionalidades para você.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {segments.map((seg) => {
          const isSelected = value === seg.id;
          return (
            <button
              key={seg.id}
              onClick={() => onChange(seg.id)}
              className={clsx(
                'group relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left hover:shadow-md',
                isSelected
                  ? 'border-[#5B4FE9] bg-[#eef2ff] shadow-md shadow-[#5B4FE9]/10'
                  : 'border-gray-100 bg-white hover:border-[#c7d2fe]'
              )}
            >
              <span className="text-2xl flex-shrink-0">{seg.emoji}</span>
              <span
                className={clsx(
                  'font-semibold text-sm',
                  isSelected ? 'text-[#5B4FE9]' : 'text-gray-700'
                )}
              >
                {seg.label}
              </span>
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#5B4FE9] flex items-center justify-center">
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
  );
}
