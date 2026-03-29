import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/introduction-to-reactive-programming-and-spring-webflux';

export default function IntroductionToReactiveProgramming() {
  return (
    <>
      <SEO
        title="Introduction to Reactive Programming and Spring WebFlux"
        description="Learn what reactive programming is, how it differs from traditional Java web apps, and why Spring WebFlux was created."
        path={PATH}
        keywords="reactive programming, Spring WebFlux introduction, Project Reactor, non-blocking IO, event loop"
      />
      <PageLayout
        breadcrumb="Getting Started"
        title="Introduction to Reactive Programming and Spring WebFlux"
        description="Learn what reactive programming is, how it works differently from a standard Spring MVC app, and why the Spring team created WebFlux."
        badge={{ text: 'Beginner', level: 'beginner' }}
        readTime="12 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#what-is-reactive">What is Reactive Programming?</a></li>
            <li><a href="#blocking-vs-nonblocking">Blocking vs Non-Blocking I/O</a></li>
            <li><a href="#reactive-streams">The Reactive Streams Specification</a></li>
            <li><a href="#project-reactor">Project Reactor</a></li>
            <li><a href="#spring-webflux">What is Spring WebFlux?</a></li>
            <li><a href="#when-to-use">When Should You Use WebFlux?</a></li>
            <li><a href="#when-not-to-use">When NOT to Use WebFlux</a></li>
          </ol>
        </div>

        {/* Section 1 */}
        <div className="section" id="what-is-reactive">
          <h2 className="section-title">What is Reactive Programming?</h2>
          <div className="step-content">
            <p>
              <strong>Reactive programming</strong> is a coding style built around data that arrives
              over time. Instead of asking for data and sitting idle while you wait for it, you
              describe what should happen <em>when</em> the data arrives — and the framework
              handles all the waiting and scheduling in the background.
            </p>
            <p>
              The four key traits of a reactive system (as defined by the{' '}
              <a href="https://www.reactivemanifesto.org/" target="_blank" rel="noreferrer">
                Reactive Manifesto
              </a>
              ) are:
            </p>
            <ul>
              <li><strong>Responsive</strong> – the system replies quickly.</li>
              <li><strong>Resilient</strong> – the system keeps working even when something goes wrong.</li>
              <li><strong>Elastic</strong> – the system handles more or less traffic without breaking.</li>
              <li><strong>Message Driven</strong> – parts of the system communicate by sending messages without waiting for a reply.</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="section" id="blocking-vs-nonblocking">
          <h2 className="section-title">Blocking vs Non-Blocking I/O</h2>
          <div className="step-content">
            <p>
              In a standard Spring MVC app, every incoming HTTP request gets its own thread
              from a pool (usually Tomcat's). That thread is held in place while waiting for a
              database query, an external API call, or a file read to finish.
            </p>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">The Thread-per-Request Problem</div>
              Under high load, a blocking server can exhaust its thread pool (typically 200–500
              threads). New requests then queue up or get rejected, causing latency spikes and
              eventually service outages.
            </div>
          </div>
          <div className="step-content">
            <p>
              A non-blocking server uses just a handful of threads — usually one per CPU core —
              tied to an <strong>event loop</strong>. When a thread kicks off a database call
              or HTTP request, it doesn't sit and wait. Instead it moves on to handle the next
              request. When the result comes back, the event loop picks it up and sends the
              response — no thread is ever idle.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">text</span>
              <span className="code-block-filename">Thread model comparison</span>
            </div>
            <pre><code>{`Blocking (Spring MVC / Tomcat)
──────────────────────────────
Request 1 → Thread-1 → [waiting for DB…] → Thread-1 (still held)
Request 2 → Thread-2 → [waiting for DB…] → Thread-2 (still held)
…
Request 200 → Thread-200 → [waiting…]
Request 201 → QUEUE (no thread available!) ← latency spike

Non-Blocking (Spring WebFlux / Netty)
─────────────────────────────────────
Request 1 → Event Loop Thread → initiates DB call → moves on
Request 2 → Event Loop Thread → initiates DB call → moves on
…
DB result arrives → callback fires → response sent → thread free`}</code></pre>
          </div>
        </div>

        {/* Section 3 */}
        <div className="section" id="reactive-streams">
          <h2 className="section-title">The Reactive Streams Standard</h2>
          <div className="step-content">
            <p>
              <a href="https://www.reactive-streams.org/" target="_blank" rel="noreferrer">
                Reactive Streams
              </a>{' '}
              is an industry standard (built into Java 9+) that sets the rules for how data
              producers and consumers talk to each other. It defines four building blocks:
            </p>
            <ul>
              <li><code>Publisher&lt;T&gt;</code> – something that produces a stream of results.</li>
              <li><code>Subscriber&lt;T&gt;</code> – something that receives and uses those results.</li>
              <li><code>Subscription</code> – the connection between the two; the subscriber uses it to ask for more items or cancel.</li>
              <li><code>Processor&lt;T,R&gt;</code> – sits in the middle, transforms items, and passes them on.</li>
            </ul>
            <p>
              The key idea it adds over older callback or Future patterns is{' '}
              <strong>backpressure</strong>: the consumer tells the producer exactly how many
              items it can handle at once. This stops a fast producer from sending data faster
              than the consumer can process it.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="section" id="project-reactor">
          <h2 className="section-title">Project Reactor</h2>
          <div className="step-content">
            <p>
              <a href="https://projectreactor.io/" target="_blank" rel="noreferrer">
                Project Reactor
              </a>{' '}
              is the reactive library that Spring WebFlux is built on. It gives you two core
              types for working with results:
            </p>
            <ul>
              <li>
                <code>Mono&lt;T&gt;</code> – holds <strong>0 or 1</strong> result.
                Use it when you're looking up one thing — like a single user by ID.
              </li>
              <li>
                <code>Flux&lt;T&gt;</code> – holds <strong>0 to many</strong> results.
                Use it when you're working with a list or a continuous stream of data.
              </li>
            </ul>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Mono and Flux — quick preview</span>
            </div>
            <pre><code>{`// Mono — single optional value
Mono<String> greeting = Mono.just("Hello, WebFlux!");

// Flux — stream of values
Flux<Integer> numbers = Flux.range(1, 10);

// Subscribe to consume the values
numbers
    .filter(n -> n % 2 == 0)
    .map(n -> "Even: " + n)
    .subscribe(System.out::println);`}</code></pre>
          </div>
        </div>

        {/* Section 5 */}
        <div className="section" id="spring-webflux">
          <h2 className="section-title">What is Spring WebFlux?</h2>
          <div className="step-content">
            <p>
              Spring WebFlux is the reactive web framework added in{' '}
              <strong>Spring Framework 5</strong> (Spring Boot 2). It runs on a non-blocking
              server — by default Netty — instead of Tomcat.
            </p>
            <p>It gives you two ways to write endpoints:</p>
            <ul>
              <li>
                <strong>Annotated Controllers</strong> – the familiar{' '}
                <code>@RestController</code> / <code>@GetMapping</code> style you already
                know, but return types become <code>Mono</code> or <code>Flux</code>.
              </li>
              <li>
                <strong>Functional Endpoints</strong> – define routes and handlers using
                plain Java functions instead of annotations.
              </li>
            </ul>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Spring MVC and WebFlux coexist</div>
              Spring Boot can run both Spring MVC (servlet stack) and WebFlux (reactive stack)
              in the same application — but it is generally best to pick one per application.
              Mixing them defeats the purpose of the non-blocking model.
            </div>
          </div>
        </div>

        {/* Section 6 */}
        <div className="section" id="when-to-use">
          <h2 className="section-title">When Should You Use WebFlux?</h2>
          <div className="step-content">
            <ul>
              <li>Apps that handle many users at the same time (API gateways, live streaming).</li>
              <li>Apps that spend most of their time waiting — on databases, external services, or file reads.</li>
              <li>Microservices that make several downstream calls and combine the results.</li>
              <li>Real-time features like live feeds, Server-Sent Events, or WebSockets.</li>
              <li>Work where keeping thread count and memory low really matters.</li>
            </ul>
          </div>
        </div>

        {/* Section 7 */}
        <div className="section" id="when-not-to-use">
          <h2 className="section-title">When NOT to Use WebFlux</h2>
          <div className="step-content">
            <ul>
              <li>Heavy computation tasks (image processing, data crunching) — these keep threads busy regardless, so non-blocking doesn't help.</li>
              <li>Teams who are new to reactive coding — there is a real learning curve.</li>
              <li>Apps that depend on blocking database drivers (JDBC/JPA) — switch to R2DBC first.</li>
              <li>Simple CRUD apps with low traffic — Spring MVC is perfectly fine here.</li>
            </ul>
          </div>
          <div className="info-box success">
            <span className="info-box-icon">✅</span>
            <div className="info-box-content">
              <div className="info-box-title">You're ready for the next step!</div>
              Now that you understand the "why" behind Spring WebFlux, let's create your first
              project from scratch using Spring Initializr.
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
