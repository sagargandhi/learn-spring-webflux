import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  keywords?: string;
}

const BASE_URL = 'https://learnspringwebflux.com';
const SITE_NAME = 'Learn Spring WebFlux';

export default function SEO({ title, description, path = '', keywords }: SEOProps) {
  const fullTitle = path === '/' ? `${SITE_NAME} - Reactive Programming Guide` : `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;
  const defaultKeywords = 'Spring WebFlux, Reactive Programming, Project Reactor, R2DBC, Spring Boot, Java, Mono, Flux';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:card" content="summary" />

      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
