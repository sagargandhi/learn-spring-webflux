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
            <li><a href="#why-mono-flux">Why Mono and Flux Are Needed</a></li>
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
              is the reactive library that Spring WebFlux is built on. It implements the
              Reactive Streams specification and provides two core types:
            </p>
            <ul>
              <li>
                <code>Mono&lt;T&gt;</code> – represents a <strong>single asynchronous result</strong>{' '}
                (0 or 1 value). Use it when you expect one thing back — like looking up a user by ID,
                saving a record, or performing any operation that yields at most one result.
              </li>
              <li>
                <code>Flux&lt;T&gt;</code> – represents a <strong>stream of asynchronous results</strong>{' '}
                (0 to N values). Use it when you expect multiple items — like fetching all orders from a
                database, receiving a live event feed, or streaming data to a client over Server-Sent Events.
              </li>
            </ul>
            <p>
              The critical difference from plain Java types like <code>User</code> or{' '}
              <code>List&lt;User&gt;</code> is that both <code>Mono</code> and <code>Flux</code>{' '}
              are <strong>lazy and non-blocking</strong>. They don't execute anything when created.
              They describe <em>what</em> to do — the actual work only happens when something
              subscribes to them. This lets a single thread handle thousands of concurrent operations
              without ever blocking.
            </p>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">Why not just return a List or a value directly?</div>
              A plain <code>List&lt;User&gt;</code> requires loading <em>all</em> users into memory before
              returning anything to the caller. A blocking <code>User</code> return means the thread sits
              idle while waiting for the DB. With <code>Mono&lt;User&gt;</code> or{' '}
              <code>Flux&lt;User&gt;</code>, the thread is free immediately — data flows through the pipeline
              as it arrives, item by item, without ever blocking. See the deep-dive on{' '}
              <a href="/mono-and-flux-the-core-reactive-types-in-project-reactor#flux-vs-rest">
                Flux vs Traditional REST API
              </a>{' '}
              for a full comparison.
            </div>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Mono and Flux — quick preview</span>
            </div>
            <pre><code>{`// Mono — a single asynchronous value (e.g. find user by ID)
Mono<User> user = userRepository.findById(42L);
// Nothing happens yet — this is just a recipe

// Flux — a stream of values (e.g. all products from DB)
Flux<Product> products = productRepository.findAll();
// Still nothing — lazy until subscribed

// Compose operators and subscribe (Spring WebFlux subscribes for you in controllers)
products
    .filter(p -> p.getPrice() > 10.0)
    .map(p -> new ProductDTO(p.getId(), p.getName()))
    .subscribe(dto -> System.out.println("Product: " + dto.getName()));
// NOW it runs — data flows through filter → map → subscriber`}</code></pre>
          </div>
          <div className="step-content">
            <p>
              Practical rule of thumb:
            </p>
            <ul>
              <li>Use <code>Mono</code> for single-item operations — <code>GET /users/{'{id}'}</code>,{' '}
                <code>POST /users</code>, <code>DELETE /users/{'{id}'}</code>.</li>
              <li>Use <code>Flux</code> for multi-item or streaming operations — <code>GET /users</code>,{' '}
                live event feeds, SSE endpoints, WebSocket streams.</li>
            </ul>
          </div>
        </div>

        {/* Section 5 */}
        <div className="section" id="why-mono-flux">
          <h2 className="section-title">Why Mono and Flux Are Needed (and How Flux Differs from Traditional REST)</h2>
          <div className="step-content">
            <p>
              In a traditional REST endpoint, returning <code>List&lt;User&gt;</code> means the server usually waits
              for all rows, builds the full list in memory, then sends one complete JSON response.
              Returning <code>Flux&lt;User&gt;</code> changes that model: users can be emitted progressively as data arrives,
              and the request thread is not blocked while waiting on I/O.
            </p>
            <p>
              Put simply: <code>Mono</code> and <code>Flux</code> are not just new container types — they are
              asynchronous contracts that model timing, completion, errors, and flow control.
            </p>
          </div>

          <table className="dep-table">
            <thead>
              <tr><th>Question</th><th>Traditional REST (MVC)</th><th>Reactive REST (WebFlux)</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>What does it return?</strong></td>
                <td><code>User</code> / <code>List&lt;User&gt;</code></td>
                <td><code>Mono&lt;User&gt;</code> / <code>Flux&lt;User&gt;</code></td>
              </tr>
              <tr>
                <td><strong>When does the client receive data?</strong></td>
                <td>Usually after all data is ready</td>
                <td>Can receive items progressively as they arrive</td>
              </tr>
              <tr>
                <td><strong>What happens to server threads while waiting?</strong></td>
                <td>Threads block on DB/API calls</td>
                <td>Threads are released; event loop continues other work</td>
              </tr>
              <tr>
                <td><strong>Backpressure support?</strong></td>
                <td>No built-in mechanism</td>
                <td>Yes, via Reactive Streams request(n)</td>
              </tr>
            </tbody>
          </table>

          <div className="step-content">
            <p><strong>When Flux is actually required:</strong></p>
            <ul>
              <li>Large result sets where loading all data at once can cause memory pressure.</li>
              <li>Live streaming scenarios (SSE/WebSocket), where data is continuous.</li>
              <li>Progressive rendering, where clients should see first results immediately.</li>
              <li>High-concurrency I/O-heavy APIs where blocking threads do not scale well.</li>
            </ul>
            <p>
              Deep dive: see{' '}
              <a href="/mono-and-flux-the-core-reactive-types-in-project-reactor#why-mono-flux">
                Why Do We Need Mono and Flux?
              </a>{' '}
              and{' '}
              <a href="/mono-and-flux-the-core-reactive-types-in-project-reactor#flux-vs-rest">
                Flux vs Traditional REST API
              </a>
              .
            </p>
          </div>
        </div>

        {/* Section 6 */}
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

        {/* Section 7 */}
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

        {/* Section 8 */}
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
