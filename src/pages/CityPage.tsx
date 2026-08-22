import { useParams, useLocation } from 'react-router-dom';
import CityLandingPage from '../components/local/CityLandingPage';

export default function CityPage() {
  const { citySlug } = useParams<{ citySlug?: string }>();
  const location = useLocation();

  const segments = location.pathname
    .split('/')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  let currentSlug = citySlug || '';

  if (!currentSlug) {
    if (segments[0] === 'cidade') {
      currentSlug = segments[1] || '';
    } else {
      currentSlug = segments[0] || '';
    }
  }

  return <CityLandingPage citySlug={currentSlug.toLowerCase().trim()} />;
}
