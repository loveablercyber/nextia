import { useState, useCallback } from 'react';
import { type QuoteFormData, initialFormData, calculateQuote } from '../data/quoteCalculator';

// State store for the wizard backed by the local PostgreSQL API.
export function useQuoteStore(prefill: Partial<QuoteFormData> = {}, initialStep = 1) {
  const [formData, setFormData] = useState<QuoteFormData>(() => ({ ...initialFormData, ...prefill }));
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 6;

  const updateField = useCallback(<K extends keyof QuoteFormData>(
    field: K,
    value: QuoteFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleFeature = useCallback((featureId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(featureId)
        ? prev.selectedFeatures.filter(f => f !== featureId)
        : [...prev.selectedFeatures, featureId],
    }));
  }, []);

  const goNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps + 1)); // +1 for summary
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const quoteResult = calculateQuote(formData);
      
      const response = await fetch('/api/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_type: formData.projectType,
          segment: formData.segment,
          pages: formData.pagesCount,
          features: formData.selectedFeatures,
          has_identity: formData.needsIdentity,
          urgency: formData.urgency,
          budget_range: formData.budgetRange,
          contact_name: formData.name,
          contact_email: formData.email,
          contact_phone: formData.whatsapp,
          contact_company: formData.company,
          estimated_min: quoteResult.activationMin,
          estimated_max: quoteResult.activationMax,
          recommended_plan: quoteResult.recommendedPlan,
          city: formData.city,
          notes: formData.notes,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar o orçamento.');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setSubmitted(false);
  }, []);

  const progress = currentStep <= totalSteps ? ((currentStep - 1) / totalSteps) * 100 : 100;

  const canProceed = useCallback((step: number): boolean => {
    switch (step) {
      case 1: return formData.projectType !== null;
      case 2: return formData.segment !== null;
      case 3: return true; // pages and features are optional
      case 4: return true; // all optional
      case 5: return formData.urgency !== null && formData.budgetRange !== null;
      case 6: return formData.name.trim() !== '' && formData.email.trim() !== '' && formData.whatsapp.trim() !== '';
      default: return true;
    }
  }, [formData]);

  return {
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
    goToStep,
    handleSubmit,
    reset,
    canProceed,
  };
}
