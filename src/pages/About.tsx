import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/about';

export default function About() {
  return (
    <>
      <SEO
        title="About This Guide"
        description="About Learn Spring WebFlux — a free, open learning guide written by Sagar Gandhi. Contact, feedback, and contribution information."
        path={PATH}
        keywords="about Learn Spring WebFlux, Sagar Gandhi, Spring WebFlux guide author"
      />
      <PageLayout
        breadcrumb="About"
        title="About This Guide"
        description="Learn who built this site, what motivated it, and how to get in touch with feedback, corrections, or suggestions."
        currentPath={PATH}
      >
        {/* Author Card */}
        <div className="author-card">
          <div className="author-avatar">SG</div>
          <div className="author-info">
            <h2>Sagar Gandhi</h2>
            <div className="author-role">Software Engineer · Spring &amp; Reactive Systems</div>
            <p className="author-bio">
              I'm a backend engineer who has spent years building distributed, high-throughput systems on the JVM.
              After learning Spring WebFlux the hard way — through documentation, Stack Overflow rabbit holes, and
              plenty of bugs — I wanted to create the resource I wish I'd had when starting out.
            </p>
            <p className="author-bio" style={{ marginTop: '0.5rem' }}>
              This guide is written from a practitioner's perspective. Every topic is explained in the context of
              real-world problems, and every code sample is something I've actually used (or seen in production).
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="section">
          <h2 className="section-title">Feedback &amp; Contact</h2>
          <div className="step-content">
            <p>
              Have a correction, a suggestion for a new topic, or just want to say hello? I'd genuinely love to hear
              from you. Good feedback makes this guide better for everyone.
            </p>
            <p style={{ marginTop: '0.6rem' }}>
              The best way to reach me is by email:
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <a href="mailto:gandhi.sagar@protonmail.com" className="contact-link">
              ✉ gandhi.sagar@protonmail.com
            </a>
          </div>
          <div className="info-box tip" style={{ marginTop: '1.25rem' }}>
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">What makes a great bug report</div>
              When reporting an error, please include the page URL, the incorrect code or explanation, and
              (if you know it) the correct information. This helps me fix it quickly.
            </div>
          </div>
        </div>

        {/* About the Guide */}
        <div className="section">
          <h2 className="section-title">About This Guide</h2>
          <div className="step-content">
            <p>
              <strong>Learn Spring WebFlux</strong> is a free, self-contained tutorial series covering the complete
              lifecycle of building reactive web applications with Spring WebFlux and Project Reactor. It is not a
              reference manual — it's a structured, progressive curriculum designed to take you from zero to
              production-ready.
            </p>
            <p>Key characteristics of this guide:</p>
            <ul>
              <li>
                <strong>Opinionated and practical</strong> — decisions (which database driver, which security pattern)
                are made for you so you can focus on learning concepts, not bikeshedding.
              </li>
              <li>
                <strong>Sequential by design</strong> — chapters build on each other. The recommended order matters,
                especially in the early chapters.
              </li>
              <li>
                <strong>Up to date</strong> — all examples target Spring Boot 3.3.x, Java 21, and Spring WebFlux 6.x.
              </li>
              <li>
                <strong>No filler</strong> — every section has a clear learning objective. If something is here, it's
                because you'll need it.
              </li>
            </ul>
          </div>
        </div>

        {/* Topics Covered */}
        <div className="section">
          <h2 className="section-title">Topics Covered</h2>
          <div className="cards-grid">
            {[
              { icon: '🎯', title: 'Getting Started', desc: 'Reactive fundamentals, project setup, project structure' },
              { icon: '⚙️', title: 'Core Reactor', desc: 'Mono, Flux, operators, schedulers, error handling, backpressure' },
              { icon: '📡', title: 'REST APIs', desc: 'Annotated controllers, functional routing, validation' },
              { icon: '🗄️', title: 'Data Access', desc: 'R2DBC (PostgreSQL), Reactive MongoDB, Redis caching' },
              { icon: '🔒', title: 'Security', desc: 'Spring Security, JWT, role-based authorization' },
              { icon: '🚀', title: 'Production', desc: 'WebClient, SSE, WebSockets, microservices, Micrometer' },
            ].map((c) => (
              <div key={c.title} className="card" style={{ cursor: 'default' }}>
                <div className="card-icon">{c.icon}</div>
                <div className="card-title">{c.title}</div>
                <div className="card-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="info-box success">
          <span className="info-box-icon">✅</span>
          <div className="info-box-content">
            <div className="info-box-title">Ready to start learning?</div>
            <Link to="/introduction-to-reactive-programming-and-spring-webflux">
              Begin with the Introduction to Reactive Programming →
            </Link>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
