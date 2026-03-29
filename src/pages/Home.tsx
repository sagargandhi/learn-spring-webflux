import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import ReactiveArchitectureDiagram from '../components/ReactiveArchitectureDiagram';

const PATH = '/';

interface TopicCard {
  icon: string;
  title: string;
  description: string;
  path: string;
  badge: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

const topics: TopicCard[] = [
  {
    icon: '🚀',
    title: 'Introduction to Reactive Programming',
    description: 'Learn what reactive programming is, why it matters, and how Spring WebFlux fits into the picture.',
    path: '/introduction-to-reactive-programming-and-spring-webflux',
    badge: 'Start Here',
    level: 'beginner',
  },
  {
    icon: '⚙️',
    title: 'Setting Up Your First WebFlux Project',
    description: 'Bootstrap a Spring WebFlux project from scratch using Spring Initializr with the right dependencies.',
    path: '/setting-up-your-first-spring-webflux-project-with-spring-initializr',
    badge: 'Beginner',
    level: 'beginner',
  },
  {
    icon: '🏗️',
    title: 'Understanding the Project Structure',
    description: 'Walk through every folder and file in a WebFlux project and understand what each one does.',
    path: '/understanding-spring-webflux-project-structure-and-key-files',
    badge: 'Beginner',
    level: 'beginner',
  },
  {
    icon: '🔷',
    title: 'Mono and Flux — Core Reactive Types',
    description: 'Master the two fundamental building blocks of Project Reactor: Mono and Flux.',
    path: '/mono-and-flux-the-core-reactive-types-in-project-reactor',
    badge: 'Beginner',
    level: 'beginner',
  },
  {
    icon: '🔧',
    title: 'Reactive Operators Deep Dive',
    description: 'map, flatMap, filter, zip, switchMap and many more operators explained with real examples.',
    path: '/reactive-operators-map-flatmap-filter-zip-and-more',
    badge: 'Intermediate',
    level: 'intermediate',
  },
  {
    icon: '🧵',
    title: 'Schedulers and Threading Model',
    description: 'Understand publishOn vs subscribeOn and how to safely call blocking code from reactive pipelines.',
    path: '/schedulers-and-the-threading-model-in-spring-webflux',
    badge: 'Intermediate',
    level: 'intermediate',
  },
  {
    icon: '⚡',
    title: 'Error Handling Strategies',
    description: 'onErrorReturn, onErrorResume, retry, global handlers, and RFC 9457 Problem Details.',
    path: '/error-handling-strategies-in-reactive-spring-webflux',
    badge: 'Intermediate',
    level: 'intermediate',
  },
  {
    icon: '🌊',
    title: 'Backpressure and Overflow Handling',
    description: 'Learn how Reactive Streams backpressure works and the strategies to handle overflow gracefully.',
    path: '/backpressure-and-overflow-handling-in-reactive-streams',
    badge: 'Intermediate',
    level: 'intermediate',
  },
  {
    icon: '📡',
    title: 'Annotated Controllers with WebFlux',
    description: 'Build REST APIs with familiar @RestController and @RequestMapping annotations reactively.',
    path: '/building-rest-apis-with-annotated-controllers-in-spring-webflux',
    badge: 'Intermediate',
    level: 'intermediate',
  },
  {
    icon: '🔀',
    title: 'Functional Routing and Handlers',
    description: 'Use RouterFunction and HandlerFunction for a pure functional approach to routing.',
    path: '/functional-routing-and-handler-functions-in-spring-webflux',
    badge: 'Intermediate',
    level: 'intermediate',
  },
  {
    icon: '🗄️',
    title: 'Reactive Database Access with R2DBC',
    description: 'Connect to PostgreSQL reactively using R2DBC, Spring Data R2DBC, and reactive repositories.',
    path: '/reactive-database-access-using-r2dbc-and-postgresql',
    badge: 'Advanced',
    level: 'advanced',
  },
  {
    icon: '🍃',
    title: 'Reactive MongoDB Integration',
    description: 'Use Spring Data Reactive MongoDB to build fully non-blocking data access layers.',
    path: '/spring-data-reactive-mongodb-with-spring-webflux',
    badge: 'Advanced',
    level: 'advanced',
  },
  {
    icon: '🔴',
    title: 'Reactive Redis Caching',
    description: 'Cache data reactively using Spring Data Redis with Lettuce and ReactiveRedisTemplate.',
    path: '/reactive-redis-caching-with-lettuce-and-spring-webflux',
    badge: 'Advanced',
    level: 'advanced',
  },
  {
    icon: '🔒',
    title: 'Spring Security with WebFlux',
    description: 'Secure your reactive application with Spring Security, including JWT-based authentication.',
    path: '/spring-security-reactive-authentication-and-authorization',
    badge: 'Advanced',
    level: 'advanced',
  },
  {
    icon: '🌐',
    title: 'WebClient for HTTP Calls',
    description: 'Make non-blocking HTTP requests to external services using Spring WebClient.',
    path: '/using-webclient-for-reactive-http-calls-in-spring-webflux',
    badge: 'Advanced',
    level: 'advanced',
  },
  {
    icon: '📊',
    title: 'Performance Tuning and Metrics',
    description: 'Monitor, profile, and tune your Spring WebFlux application using Micrometer and Actuator.',
    path: '/performance-tuning-monitoring-and-metrics-in-spring-webflux',
    badge: 'Advanced',
    level: 'advanced',
  },
];

export default function Home() {
  return (
    <>
      <SEO
        title="Learn Spring WebFlux — Reactive Programming Guide"
        description="A complete, step-by-step learning guide for Spring WebFlux: reactive programming, Project Reactor, R2DBC, Spring Security, WebClient, and more."
        path={PATH}
        keywords="Spring WebFlux tutorial, reactive programming Java, Project Reactor guide, R2DBC, Spring Boot WebFlux"
      />
      <main className="main-content home-content">
        {/* Hero */}
        <div className="hero">
          <div className="hero-tag">Free · Open · Step-by-Step</div>
          <h1 className="hero-title">Master Spring WebFlux &amp; Reactive Programming</h1>
          <p className="hero-subtitle">
            A comprehensive, hands-on tutorial series covering everything from reactive fundamentals to
            production-ready patterns — written for Java developers at every level.
          </p>
          <div className="hero-actions">
            <Link to="/introduction-to-reactive-programming-and-spring-webflux" className="btn-primary">
              Start Learning →
            </Link>
            <Link to="/setting-up-your-first-spring-webflux-project-with-spring-initializr" className="btn-secondary">
              Quick Setup Guide
            </Link>
          </div>
        </div>

        {/* Architecture Diagram */}
        <ReactiveArchitectureDiagram />

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-value">20+</div>
            <div className="stat-label">In-depth Chapters</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">200+</div>
            <div className="stat-label">Code Examples</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">6</div>
            <div className="stat-label">Topic Areas</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">Free</div>
          </div>
        </div>

        <div className="divider" />

        {/* What You'll Learn */}
        <section>
          <h2 className="section-title">What You'll Learn</h2>
          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {topics.map((t) => (
              <Link key={t.path} to={t.path} className="card">
                <div className="card-icon">{t.icon}</div>
                <div className="card-title">{t.title}</div>
                <div className="card-desc">{t.description}</div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className={`badge badge-${t.level}`}>{t.badge}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* Learning Path */}
        <section>
          <h2 className="section-title">Recommended Learning Path</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-body">
                <div className="step-title">Understand the Why</div>
                <div className="step-content">
                  <p>Read the <Link to="/introduction-to-reactive-programming-and-spring-webflux">Introduction to Reactive Programming</Link> chapter.
                  Understand the limitations of thread-per-request models, what non-blocking I/O means, and why the
                  Reactive Streams specification was created.</p>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-body">
                <div className="step-title">Set Up Your Environment</div>
                <div className="step-content">
                  <p>Follow the <Link to="/setting-up-your-first-spring-webflux-project-with-spring-initializr">project setup guide</Link> to
                  bootstrap a Spring Boot 3 WebFlux project using Spring Initializr. You'll pick the right dependencies,
                  understand the generated pom.xml, and write your first reactive endpoint.</p>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-body">
                <div className="step-title">Master Mono &amp; Flux</div>
                <div className="step-content">
                  <p>Spend time with the <Link to="/mono-and-flux-the-core-reactive-types-in-project-reactor">Mono and Flux chapter</Link> and
                  the <Link to="/reactive-operators-map-flatmap-filter-zip-and-more">operators guide</Link>. These are the
                  building blocks for everything else. Don't rush this step.</p>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-body">
                <div className="step-title">Build REST APIs</div>
                <div className="step-content">
                  <p>Learn both styles — <Link to="/building-rest-apis-with-annotated-controllers-in-spring-webflux">annotated controllers</Link> and{' '}
                  <Link to="/functional-routing-and-handler-functions-in-spring-webflux">functional routing</Link>. Understand request/response handling,
                  validation, and error response formatting.</p>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-body">
                <div className="step-title">Add Persistence &amp; Security</div>
                <div className="step-content">
                  <p>Connect to a database reactively using <Link to="/reactive-database-access-using-r2dbc-and-postgresql">R2DBC</Link> or{' '}
                  <Link to="/spring-data-reactive-mongodb-with-spring-webflux">MongoDB</Link>, then secure your
                  API with <Link to="/spring-security-reactive-authentication-and-authorization">Spring Security</Link> and{' '}
                  <Link to="/jwt-authentication-and-authorization-in-spring-webflux">JWT tokens</Link>.</p>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">6</div>
              <div className="step-body">
                <div className="step-title">Test, Deploy and Tune</div>
                <div className="step-content">
                  <p>Write robust tests with <Link to="/testing-reactive-applications-with-webtestclient-and-stepverifier">WebTestClient and StepVerifier</Link>,
                  then learn <Link to="/performance-tuning-monitoring-and-metrics-in-spring-webflux">performance tuning and observability</Link> techniques
                  to prepare for production.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Prerequisites */}
        <section>
          <h2 className="section-title">Prerequisites</h2>
          <div className="step-content">
            <p>This guide is designed for Java developers. You should be comfortable with:</p>
            <ul>
              <li><strong>Java 17+</strong> — generics, lambdas, streams, Optional, CompletableFuture</li>
              <li><strong>Spring Boot basics</strong> — dependency injection, auto-configuration, application.yml</li>
              <li><strong>Maven or Gradle</strong> — adding dependencies, running builds</li>
              <li><strong>REST concepts</strong> — HTTP methods, status codes, JSON</li>
            </ul>
            <p style={{ marginTop: '0.6rem' }}>
              No prior reactive programming experience is required — we start from the very beginning.
            </p>
          </div>
          <div className="info-box info" style={{ marginTop: '1rem' }}>
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Spring Boot Version</div>
              All code examples in this guide use <strong>Spring Boot 3.3.x</strong> with <strong>Java 21</strong>.
              Spring WebFlux version 6.x (bundled with Boot 3) includes all the features covered here.
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
