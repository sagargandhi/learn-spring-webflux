import type { ReactNode } from 'react';
import PageNav from './PageNav';

interface PageLayoutProps {
  breadcrumb: string;
  title: string;
  description: string;
  badge?: { text: string; level: 'beginner' | 'intermediate' | 'advanced' };
  readTime?: string;
  currentPath: string;
  children: ReactNode;
}

export default function PageLayout({
  breadcrumb,
  title,
  description,
  badge,
  readTime,
  currentPath,
  children,
}: PageLayoutProps) {
  return (
    <main className="main-content">
      <div className="page-header">
        <div className="page-breadcrumb">
          <span>Learn Spring WebFlux</span>
          <span>›</span>
          <span>{breadcrumb}</span>
        </div>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
        {(badge || readTime) && (
          <div className="page-meta">
            {badge && (
              <span className={`badge badge-${badge.level}`}>{badge.text}</span>
            )}
            {readTime && (
              <span className="page-meta-item">⏱ {readTime}</span>
            )}
          </div>
        )}
      </div>

      {children}

      <PageNav currentPath={currentPath} />
    </main>
  );
}
