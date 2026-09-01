import { Helmet } from 'react-helmet-async';

interface SeoProps { title: string; description: string; path?: string; noindex?: boolean; image?: string; type?: 'website' | 'article'; }

export default function Seo({ title, description, path = '/', noindex = false, image, type = 'website' }: SeoProps) {
  const baseUrl = (import.meta.env.VITE_PUBLIC_URL || 'https://nextia.dev.br').replace(/\/$/, '');
  const canonical = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = title.includes('Nextia') ? title : `${title} | Nextia`;
  return <Helmet>
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content={type} />
    {image && <meta property="og:image" content={image.startsWith('http') ? image : `${baseUrl}${image}`} />}
    <meta name="twitter:card" content="summary_large_image" />
  </Helmet>;
}
