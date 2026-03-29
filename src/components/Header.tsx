import { Link, NavLink } from 'react-router-dom';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="header">
      <button
        className="hamburger"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <Link to="/" className="header-logo" aria-label="Learn Spring WebFlux Home">
        <img src="/favicon.svg" alt="Spring WebFlux logo" className="header-logo-icon" />
        <div className="header-logo-text">
          Learn Spring WebFlux
          <span>Reactive Programming Guide</span>
        </div>
      </Link>

      <div className="header-spacer" />

      <nav className="header-nav" aria-label="Main navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/introduction-to-reactive-programming-and-spring-webflux">Guide</NavLink>
        <NavLink to="/setting-up-your-first-spring-webflux-project-with-spring-initializr">Tutorial</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </header>
  );
}
