import { useEffect } from 'react';
import QuoteWizard from '../components/quote/QuoteWizard';

export default function QuotePage() {
  useEffect(() => {
    document.title = 'Orçamento Automático — Nextia';
  }, []);

  return <QuoteWizard />;
}
