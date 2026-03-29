export interface NavItem {
  label: string;
  path: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Home', path: '/' },
      { label: 'Introduction to Reactive Programming', path: '/introduction-to-reactive-programming-and-spring-webflux' },
      { label: 'Setting Up Your First Project', path: '/setting-up-your-first-spring-webflux-project-with-spring-initializr', badge: 'Start Here' },
      { label: 'Understanding the Project Structure', path: '/understanding-spring-webflux-project-structure-and-key-files' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { label: 'What is Project Reactor?', path: '/what-is-project-reactor-and-how-it-differs-from-traditional-rest' },
      { label: 'Mono and Flux Explained', path: '/mono-and-flux-the-core-reactive-types-in-project-reactor' },
      { label: 'Reactive Operators Deep Dive', path: '/reactive-operators-map-flatmap-filter-zip-and-more' },
      { label: 'Schedulers and Threading Model', path: '/schedulers-and-the-threading-model-in-spring-webflux' },
      { label: 'Error Handling Strategies', path: '/error-handling-strategies-in-reactive-spring-webflux' },
      { label: 'Backpressure and Overflow Handling', path: '/backpressure-and-overflow-handling-in-reactive-streams' },
    ],
  },
  {
    title: 'Building REST APIs',
    items: [
      { label: 'Annotated Controllers with WebFlux', path: '/building-rest-apis-with-annotated-controllers-in-spring-webflux' },
      { label: 'Functional Routing and Handlers', path: '/functional-routing-and-handler-functions-in-spring-webflux' },
      { label: 'Request and Response Handling', path: '/request-and-response-handling-in-spring-webflux' },
      { label: 'Validation and Error Responses', path: '/validation-and-custom-error-responses-in-spring-webflux' },
    ],
  },
  {
    title: 'Reactive Data Access',
    items: [
      { label: 'R2DBC with PostgreSQL', path: '/reactive-database-access-using-r2dbc-and-postgresql' },
      { label: 'Spring Data Reactive MongoDB', path: '/spring-data-reactive-mongodb-with-spring-webflux' },
      { label: 'Redis Reactive with Lettuce', path: '/reactive-redis-caching-with-lettuce-and-spring-webflux' },
    ],
  },
  {
    title: 'Security & Testing',
    items: [
      { label: 'Spring Security with WebFlux', path: '/spring-security-reactive-authentication-and-authorization' },
      { label: 'JWT Authentication in WebFlux', path: '/jwt-authentication-and-authorization-in-spring-webflux' },
      { label: 'Testing Reactive Applications', path: '/testing-reactive-applications-with-webtestclient-and-stepverifier' },
    ],
  },
  {
    title: 'Advanced Topics',
    items: [
      { label: 'WebClient for HTTP Calls', path: '/using-webclient-for-reactive-http-calls-in-spring-webflux' },
      { label: 'Server-Sent Events and WebSockets', path: '/server-sent-events-and-websockets-in-spring-webflux' },
      { label: 'Reactive Microservices Patterns', path: '/reactive-microservices-patterns-with-spring-cloud-and-webflux' },
      { label: 'Performance Tuning and Metrics', path: '/performance-tuning-monitoring-and-metrics-in-spring-webflux' },
    ],
  },
  {
    title: 'About',
    items: [
      { label: 'About This Guide', path: '/about' },
    ],
  },
];

export const allPages = navSections.flatMap(s => s.items);
