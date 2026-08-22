import { useParams, useLocation } from 'react-router-dom';
import LocalServiceLandingPage from '../components/local/LocalServiceLandingPage';

export default function LocalServicePage() {
  const params = useParams<{
    citySlug?: string;
    serviceSlug?: string;
  }>();
  const location = useLocation();

  // Parse path segments reliably: e.g. /bauru/criacao-de-sites -> ['bauru', 'criacao-de-sites']
  // or /cidade/bauru/criacao-de-sites -> ['cidade', 'bauru', 'criacao-de-sites']
  const segments = location.pathname
    .split('/')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  let resolvedCitySlug = params.citySlug || '';
  let resolvedServiceSlug = params.serviceSlug || '';

  if (!resolvedCitySlug) {
    if (segments[0] === 'cidade') {
      resolvedCitySlug = segments[1] || '';
      resolvedServiceSlug = resolvedServiceSlug || segments[2] || '';
    } else {
      resolvedCitySlug = segments[0] || '';
      resolvedServiceSlug = resolvedServiceSlug || segments[1] || '';
    }
  }

  if (!resolvedServiceSlug) {
    if (segments[0] === 'cidade') {
      resolvedServiceSlug = segments[2] || '';
    } else {
      resolvedServiceSlug = segments[1] || '';
    }
  }

  return (
    <LocalServiceLandingPage
      citySlug={resolvedCitySlug.toLowerCase().trim()}
      serviceSlug={resolvedServiceSlug.toLowerCase().trim()}
    />
  );
}
