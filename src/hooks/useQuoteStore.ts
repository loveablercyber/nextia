import { useState, useCallback } from 'react';
import { type QuoteFormData, initialFormData, calculateQuote } from '../data/quoteCalculator';
import { supabase } from '../lib/supabase';

const isSupabaseEnabled = false;

// State store for the wizard — integrates with Supabase when configured
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
    try {
      const quoteResult = calculateQuote(formData);
      
      if (isSupabaseEnabled) {
        // ── Supabase: Save quote to database ──
        const { error } = await supabase.from('quotes').insert([{
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
          status: 'novo',
        }]);
        if (error) {
          console.error('Error saving quote to Supabase:', error);
        }
      } else {
        // ── Mock: localStorage ──
        await new Promise(resolve => setTimeout(resolve, 1800));
        const savedQuotes = JSON.parse(localStorage.getItem('nextia_quotes') ?? '[]');
        savedQuotes.push({
          id: `q-${Date.now()}`,
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
          status: 'novo',
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('nextia_quotes', JSON.stringify(savedQuotes));
      }
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
