import { useParams, useLocation } from 'react-router-dom';
import CityLandingPage from '../components/local/CityLandingPage';

export default function CityPage() {
  const { citySlug } = useParams<{ citySlug?: string }>();
  const location = useLocation();

  // If matched via explicit route or dynamic route
  const currentSlug = (citySlug || location.pathname.replace(/^\//, '')).toLowerCase().trim();

  return <CityLandingPage citySlug={currentSlug} />;
}
