import { useEffect, useState } from 'react';
import { serviceCatalog, type ServiceOffer } from '../data/serviceCatalog';

interface ApiService {
  slug: string;
  price_cents: number | null;
  price_label: string;
  recurring: boolean;
  active: boolean;
  sort_order: number;
}

export function useServiceCatalog() {
  const [services, setServices] = useState<ServiceOffer[]>(serviceCatalog);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/catalog/services', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Catálogo indisponível')))
      .then((data: { services?: ApiService[] }) => {
        if (!Array.isArray(data.services)) return;
        const values = data.services.reduce<ServiceOffer[]>((catalog, remote) => {
            const local = serviceCatalog.find((item) => item.slug === remote.slug);
            if (local) catalog.push({ ...local, price: remote.price_cents === null ? undefined : remote.price_cents / 100, priceLabel: remote.price_label, recurring: remote.recurring });
            return catalog;
          }, []);
        if (values.length) setServices(values);
      })
      .catch((error) => { if (error.name !== 'AbortError') console.warn('Usando catálogo local:', error.message); });
    return () => controller.abort();
  }, []);

  return services;
}
