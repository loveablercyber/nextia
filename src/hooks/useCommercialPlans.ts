import { useEffect, useState } from 'react';
import { plans as localPlans, type Plan } from '../data/plans';

interface ApiPlan { id: string; monthly_amount_cents: number; activation_amount_cents: number; }

export function useCommercialPlans() {
  const [plans, setPlans] = useState<Plan[]>(localPlans);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/catalog/plans', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Planos indisponíveis')))
      .then((data: { plans?: ApiPlan[] }) => {
        if (!Array.isArray(data.plans)) return;
        const remoteIds = new Set(data.plans.map((item) => item.id));
        const merged = localPlans.filter((plan) => plan.id === 'custom' || remoteIds.has(plan.id)).map((plan) => {
          const remote = data.plans!.find((item) => item.id === plan.id);
          return remote ? { ...plan, price: remote.monthly_amount_cents / 100, activationFee: remote.activation_amount_cents / 100 } : plan;
        });
        setPlans(merged);
      }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return plans;
}
