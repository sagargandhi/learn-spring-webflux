import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Pages — Getting Started
import Home from './pages/Home';
import IntroductionToReactiveProgramming from './pages/IntroductionToReactiveProgramming';
import SettingUpFirstProject from './pages/SettingUpFirstProject';
import UnderstandingProjectStructure from './pages/UnderstandingProjectStructure';

// Pages — Core Concepts
import ProjectReactor from './pages/ProjectReactor';
import MonoAndFlux from './pages/MonoAndFlux';
import ReactiveOperators from './pages/ReactiveOperators';
import SchedulersAndThreading from './pages/SchedulersAndThreading';
import ErrorHandlingStrategies from './pages/ErrorHandlingStrategies';
import BackpressureAndOverflow from './pages/BackpressureAndOverflow';

// Pages — Building REST APIs
import AnnotatedControllers from './pages/AnnotatedControllers';
import FunctionalRouting from './pages/FunctionalRouting';
import RequestAndResponseHandling from './pages/RequestAndResponseHandling';
import ValidationAndErrorResponses from './pages/ValidationAndErrorResponses';

// Pages — Reactive Data Access
import R2DBCPostgreSQL from './pages/R2DBCPostgreSQL';
import ReactiveMongoDB from './pages/ReactiveMongoDB';
import ReactiveRedis from './pages/ReactiveRedis';

// Pages — Security & Testing
import SpringSecurity from './pages/SpringSecurity';
import JWTAuthentication from './pages/JWTAuthentication';
import TestingReactive from './pages/TestingReactive';

// Pages — Advanced Topics
import WebClient from './pages/WebClient';
import ServerSentEventsWebSockets from './pages/ServerSentEventsWebSockets';
import ReactiveMicroservices from './pages/ReactiveMicroservices';
import PerformanceTuning from './pages/PerformanceTuning';

// Static Pages
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Getting Started */}
        <Route path="/introduction-to-reactive-programming-and-spring-webflux" element={<IntroductionToReactiveProgramming />} />
        <Route path="/setting-up-your-first-spring-webflux-project-with-spring-initializr" element={<SettingUpFirstProject />} />
        <Route path="/understanding-spring-webflux-project-structure-and-key-files" element={<UnderstandingProjectStructure />} />

        {/* Core Concepts */}
        <Route path="/what-is-project-reactor-and-how-it-differs-from-traditional-rest" element={<ProjectReactor />} />
        <Route path="/mono-and-flux-the-core-reactive-types-in-project-reactor" element={<MonoAndFlux />} />
        <Route path="/reactive-operators-map-flatmap-filter-zip-and-more" element={<ReactiveOperators />} />
        <Route path="/schedulers-and-the-threading-model-in-spring-webflux" element={<SchedulersAndThreading />} />
        <Route path="/error-handling-strategies-in-reactive-spring-webflux" element={<ErrorHandlingStrategies />} />
        <Route path="/backpressure-and-overflow-handling-in-reactive-streams" element={<BackpressureAndOverflow />} />

        {/* Building REST APIs */}
        <Route path="/building-rest-apis-with-annotated-controllers-in-spring-webflux" element={<AnnotatedControllers />} />
        <Route path="/functional-routing-and-handler-functions-in-spring-webflux" element={<FunctionalRouting />} />
        <Route path="/request-and-response-handling-in-spring-webflux" element={<RequestAndResponseHandling />} />
        <Route path="/validation-and-custom-error-responses-in-spring-webflux" element={<ValidationAndErrorResponses />} />

        {/* Reactive Data Access */}
        <Route path="/reactive-database-access-using-r2dbc-and-postgresql" element={<R2DBCPostgreSQL />} />
        <Route path="/spring-data-reactive-mongodb-with-spring-webflux" element={<ReactiveMongoDB />} />
        <Route path="/reactive-redis-caching-with-lettuce-and-spring-webflux" element={<ReactiveRedis />} />

        {/* Security & Testing */}
        <Route path="/spring-security-reactive-authentication-and-authorization" element={<SpringSecurity />} />
        <Route path="/jwt-authentication-and-authorization-in-spring-webflux" element={<JWTAuthentication />} />
        <Route path="/testing-reactive-applications-with-webtestclient-and-stepverifier" element={<TestingReactive />} />

        {/* Advanced Topics */}
        <Route path="/using-webclient-for-reactive-http-calls-in-spring-webflux" element={<WebClient />} />
        <Route path="/server-sent-events-and-websockets-in-spring-webflux" element={<ServerSentEventsWebSockets />} />
        <Route path="/reactive-microservices-patterns-with-spring-cloud-and-webflux" element={<ReactiveMicroservices />} />
        <Route path="/performance-tuning-monitoring-and-metrics-in-spring-webflux" element={<PerformanceTuning />} />

        {/* Static */}
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="footer">
        <span>
          © {new Date().getFullYear()} Learn Spring WebFlux · Built by{' '}
          <a href="mailto:gandhi.sagar@protonmail.com">Sagar Gandhi</a>
        </span>
        <span>For educational purposes only. No affiliation with VMware / Broadcom.</span>
      </footer>
    </div>
  );
}
