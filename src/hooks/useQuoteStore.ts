import { useState, useCallback } from 'react';
import { type QuoteFormData, initialFormData } from '../data/quoteCalculator';

// Local state store for the wizard — will be replaced by Supabase integration in Phase 3
export function useQuoteStore() {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
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
    // Simulated save — Fase 3 enviará para Supabase
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      // Save to localStorage as mock
      const savedQuotes = JSON.parse(localStorage.getItem('nextia_quotes') ?? '[]');
      savedQuotes.push({
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'novo',
      });
      localStorage.setItem('nextia_quotes', JSON.stringify(savedQuotes));
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
