import clsx from 'clsx';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
}

const stepLabels = ['Tipo', 'Segmento', 'Estrutura', 'Identidade', 'Prazo', 'Contato'];

export default function StepIndicator({ currentStep, totalSteps, progress }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-600">
          Etapa {Math.min(currentStep, totalSteps)} de {totalSteps}
        </span>
        <span className="text-sm text-gray-400">{Math.round(progress)}% concluído</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step dots — desktop */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* connector line */}
        <div className="absolute inset-x-0 top-4 h-px bg-gray-100 z-0" />

        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isDone = currentStep > step;
          const isActive = currentStep === step;
          return (
            <div key={step} className="flex flex-col items-center z-10 gap-1.5">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  isDone
                    ? 'bg-[#5B4FE9] text-white shadow-md shadow-[#5B4FE9]/30'
                    : isActive
                    ? 'bg-white border-2 border-[#5B4FE9] text-[#5B4FE9] shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : step}
              </div>
              <span
                className={clsx(
                  'text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-[#5B4FE9]' : isDone ? 'text-gray-500' : 'text-gray-300'
                )}
              >
                {stepLabels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
