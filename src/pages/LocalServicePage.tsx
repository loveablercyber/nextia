import { useParams } from 'react-router-dom';
import LocalServiceLandingPage from '../components/local/LocalServiceLandingPage';

export default function LocalServicePage() {
  const { citySlug = '', serviceSlug = '' } = useParams<{
    citySlug?: string;
    serviceSlug?: string;
  }>();

  return (
    <LocalServiceLandingPage
      citySlug={citySlug.toLowerCase().trim()}
      serviceSlug={serviceSlug.toLowerCase().trim()}
    />
  );
}
