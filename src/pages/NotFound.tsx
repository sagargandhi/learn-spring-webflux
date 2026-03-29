import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist."
      />
      <main className="main-content">
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Page Not Found</h1>
          <p style={{ color: 'var(--text2)', marginBottom: '1.75rem' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary">← Back to Home</Link>
        </div>
      </main>
    </>
  );
}
