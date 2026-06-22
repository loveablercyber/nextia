import {
  projectTypes,
  segments,
  structureFeatures,
  urgencyOptions,
  type ProjectType,
  type SegmentType,
  type BudgetRange,
  type UrgencyType,
} from './quoteConfig';

export interface QuoteFormData {
  // Step 1
  projectType: ProjectType | null;
  // Step 2
  segment: SegmentType | null;
  // Step 3
  pagesCount: number;
  selectedFeatures: string[];
  // Step 4
  hasLogo: boolean | null;
  hasPhotos: boolean | null;
  hasTexts: boolean | null;
  needsIdentity: boolean | null;
  hasSiteReferences: boolean | null;
  // Step 5
  urgency: UrgencyType | null;
  budgetRange: BudgetRange | null;
  // Step 6
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  city: string;
  notes: string;
}

export interface QuoteResult {
  activationMin: number;
  activationMax: number;
  monthlyMin: number;
  monthlyMax: number;
  daysMin: number;
  daysMax: number;
  selectedFeatureLabels: string[];
  recommendedPlan: string;
  isCustom: boolean;
}

export function calculateQuote(data: QuoteFormData): QuoteResult {
  if (!data.projectType || data.projectType === 'personalizado') {
    return {
      activationMin: 0,
      activationMax: 0,
      monthlyMin: 0,
      monthlyMax: 0,
      daysMin: 0,
      daysMax: 0,
      selectedFeatureLabels: [],
      recommendedPlan: 'Personalizado',
      isCustom: true,
    };
  }

  const projectConfig = projectTypes.find(p => p.id === data.projectType)!;
  const segmentConfig = segments.find(s => s.id === data.segment);
  const urgencyConfig = urgencyOptions.find(u => u.id === data.urgency);

  const segmentMultiplier = segmentConfig?.multiplier ?? 1.0;
  const urgencyMultiplier = urgencyConfig?.multiplier ?? 1.0;

  // Page count adds cost
  const pageMultiplier = data.pagesCount <= 1 ? 0.8
    : data.pagesCount <= 5 ? 1.0
    : data.pagesCount <= 10 ? 1.2
    : 1.5;

  // Identity complexity
  const identityMultiplier = data.hasLogo === false || data.hasPhotos === false ? 1.1 : 1.0;

  // Feature additions
  const featureConfigs = structureFeatures.filter(f => data.selectedFeatures.includes(f.id));
  const featuresAddActivation = featureConfigs.reduce((sum, f) => sum + f.addActivation, 0);
  const featuresAddMonthly = featureConfigs.reduce((sum, f) => sum + f.addMonthly, 0);
  const featuresAddDays = featureConfigs.reduce((sum, f) => sum + f.addDays, 0);

  const baseActivation = projectConfig.baseActivation;
  const baseMonthly = projectConfig.baseMonthly;

  const activation = Math.round(
    (baseActivation * segmentMultiplier * pageMultiplier * identityMultiplier * urgencyMultiplier + featuresAddActivation)
  );

  const monthly = Math.round(
    (baseMonthly * segmentMultiplier * pageMultiplier + featuresAddMonthly)
  );

  const [daysMin, daysMax] = projectConfig.estimatedDays;
  const totalDaysMin = daysMin + Math.round(featuresAddDays * 0.7);
  const totalDaysMax = daysMax + featuresAddDays;

  // Recommend plan based on features
  const hasAdvancedFeatures = data.selectedFeatures.some(f => ['agendamento', 'pagamento', 'area-cliente'].includes(f));
  const hasProFeatures = data.selectedFeatures.some(f => ['seo', 'blog', 'integracoes'].includes(f));
  const recommendedPlan = hasAdvancedFeatures ? 'Business' : hasProFeatures ? 'Pro' : 'Start';

  // Add ±15% margin for estimate range
  const margin = 0.15;

  return {
    activationMin: Math.round(activation * (1 - margin)),
    activationMax: Math.round(activation * (1 + margin)),
    monthlyMin: Math.round(monthly * (1 - margin)),
    monthlyMax: Math.round(monthly * (1 + margin)),
    daysMin: Math.max(3, totalDaysMin),
    daysMax: Math.max(5, totalDaysMax),
    selectedFeatureLabels: featureConfigs.map(f => f.label),
    recommendedPlan,
    isCustom: false,
  };
}

export const initialFormData: QuoteFormData = {
  projectType: null,
  segment: null,
  pagesCount: 3,
  selectedFeatures: [],
  hasLogo: null,
  hasPhotos: null,
  hasTexts: null,
  needsIdentity: null,
  hasSiteReferences: null,
  urgency: null,
  budgetRange: null,
  name: '',
  company: '',
  whatsapp: '',
  email: '',
  city: '',
  notes: '',
};
