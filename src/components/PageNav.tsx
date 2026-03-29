import { Link } from 'react-router-dom';
import { allPages } from '../data/navigation';

interface PageNavProps {
  currentPath: string;
}

export default function PageNav({ currentPath }: PageNavProps) {
  const idx = allPages.findIndex((p) => p.path === currentPath);
  const prev = idx > 0 ? allPages[idx - 1] : null;
  const next = idx < allPages.length - 1 ? allPages[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="progress-nav" aria-label="Previous and next pages">
      {prev && (
        <Link to={prev.path} className="progress-nav-link">
          <span className="progress-nav-label">← Previous</span>
          <span className="progress-nav-title">{prev.label}</span>
        </Link>
      )}
      {next && (
        <Link to={next.path} className="progress-nav-link next">
          <span className="progress-nav-label">Next →</span>
          <span className="progress-nav-title">{next.label}</span>
        </Link>
      )}
    </nav>
  );
}
