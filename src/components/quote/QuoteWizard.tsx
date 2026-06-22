import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import StepIndicator from './StepIndicator';
import Step1_ProjectType from './Step1_ProjectType';
import Step2_Segment from './Step2_Segment';
import Step3_Structure from './Step3_Structure';
import Step4_Identity from './Step4_Identity';
import Step5_Timeline from './Step5_Timeline';
import Step6_Contact from './Step6_Contact';
import QuoteSummary from './QuoteSummary';
import { useQuoteStore } from '../../hooks/useQuoteStore';
import { calculateQuote } from '../../data/quoteCalculator';
import type { ProjectType, SegmentType, UrgencyType, BudgetRange } from '../../data/quoteConfig';

export default function QuoteWizard() {
  const {
    formData,
    currentStep,
    totalSteps,
    submitted,
    submitting,
    progress,
    updateField,
    toggleFeature,
    goNext,
    goPrev,
    handleSubmit,
    reset,
    canProceed,
  } = useQuoteStore();

  const isSummary = currentStep > totalSteps;
  const result = calculateQuote(formData);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        {!isSummary && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#eef2ff] border border-[#c7d2fe] rounded-full px-4 py-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#5B4FE9] animate-pulse" />
              <span className="text-[#5B4FE9] text-xs font-semibold">Orçamento automático gratuito</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
              Monte seu orçamento em minutos
            </h1>
            <p className="text-gray-500 mt-2">Responda algumas perguntas e receba uma estimativa personalizada</p>
          </div>
        )}

        {isSummary && !submitted && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-600 text-xs font-semibold">Estimativa gerada com sucesso</span>
            </div>
          </div>
        )}

        {/* Wizard card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step indicator area */}
          {!isSummary && (
            <div className="px-6 sm:px-10 pt-8 border-b border-gray-50">
              <StepIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
                progress={progress}
              />
            </div>
          )}

          {/* Step content */}
          <div className="px-6 sm:px-10 py-8">
            {!isSummary && (
              <div className="animate-fade-in">
                {currentStep === 1 && (
                  <Step1_ProjectType
                    value={formData.projectType}
                    onChange={(v: ProjectType) => updateField('projectType', v)}
                  />
                )}
                {currentStep === 2 && (
                  <Step2_Segment
                    value={formData.segment}
                    onChange={(v: SegmentType) => updateField('segment', v)}
                  />
                )}
                {currentStep === 3 && (
                  <Step3_Structure
                    pagesCount={formData.pagesCount}
                    selectedFeatures={formData.selectedFeatures}
                    onPagesChange={(v: number) => updateField('pagesCount', v)}
                    onToggleFeature={toggleFeature}
                  />
                )}
                {currentStep === 4 && (
                  <Step4_Identity
                    formData={formData}
                    updateField={updateField}
                  />
                )}
                {currentStep === 5 && (
                  <Step5_Timeline
                    urgency={formData.urgency}
                    budgetRange={formData.budgetRange}
                    onUrgencyChange={(v: UrgencyType) => updateField('urgency', v)}
                    onBudgetChange={(v: BudgetRange) => updateField('budgetRange', v)}
                  />
                )}
                {currentStep === 6 && (
                  <Step6_Contact
                    formData={formData}
                    updateField={updateField}
                  />
                )}
              </div>
            )}

            {isSummary && (
              <QuoteSummary
                formData={formData}
                result={result}
                onSubmit={handleSubmit}
                onReset={reset}
                submitting={submitting}
                submitted={submitted}
              />
            )}
          </div>

          {/* Navigation footer */}
          {!isSummary && (
            <div className="px-6 sm:px-10 py-5 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between gap-4">
              <button
                onClick={goPrev}
                disabled={currentStep === 1}
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              {/* Step mini counter mobile */}
              <span className="text-xs text-gray-300 sm:hidden">
                {currentStep}/{totalSteps}
              </span>

              <div className="flex items-center gap-3">
                {/* Skip for optional steps */}
                {[3, 4].includes(currentStep) && (
                  <button
                    onClick={goNext}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2"
                  >
                    Pular etapa
                  </button>
                )}

                <Button
                  variant="gradient"
                  size="md"
                  onClick={goNext}
                  disabled={!canProceed(currentStep)}
                  className="min-w-[140px]"
                >
                  {currentStep === totalSteps ? (
                    <>Ver estimativa ✨</>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Trust indicators below wizard */}
        {!isSummary && (
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px]">✓</span>
              Gratuito e sem compromisso
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px]">✓</span>
              Resposta em até 2h úteis
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px]">✓</span>
              Dados protegidos
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
