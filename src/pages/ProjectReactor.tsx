import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/what-is-project-reactor-and-how-it-differs-from-traditional-rest';

/* ─── Diagram 1: Traditional Blocking Model ─────────────────────────────── */
function BlockingDiagram() {
  return (
    <svg
      viewBox="0 0 780 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', margin: '1.5rem 0' }}
      aria-label="Traditional blocking request model"
    >
      {/* Background */}
      <rect width="780" height="300" fill="#f6f8fa" rx="10" />

      {/* Title */}
      <text x="390" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1f2328">
        Traditional Blocking Model (Spring MVC / Tomcat)
      </text>

      {/* ── Requests column ── */}
      <text x="70" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#57606a">REQUESTS</text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="20" y={70 + i * 52} width="100" height="32" rx="6"
            fill={i < 3 ? '#0969da' : '#cf222e'} opacity="0.9" />
          <text x="70" y={91 + i * 52} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600">
            {i < 3 ? `Request ${i + 1}` : 'Request 4'}
          </text>
        </g>
      ))}
      <text x="70" y="282" textAnchor="middle" fontSize="10" fill="#cf222e" fontWeight="600">↑ Queuing — no free threads</text>

      {/* ── Arrows ── */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1="122" y1={86 + i * 52} x2="178" y2={86 + i * 52}
            stroke="#57606a" strokeWidth="1.5" markerEnd="url(#arr)" />
        </g>
      ))}

      {/* ── Threads column ── */}
      <text x="280" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#57606a">THREADS (limited pool)</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {/* Thread box */}
          <rect x="180" y={68 + i * 52} width="200" height="36" rx="6"
            fill="#fff" stroke="#d0d7de" strokeWidth="1.5" />
          {/* Busy section — waiting on I/O */}
          <rect x="180" y={68 + i * 52} width="130" height="36" rx="6"
            fill="#ddf4ff" />
          <text x="245" y={91 + i * 52} textAnchor="middle" fontSize="10" fill="#0550ae" fontWeight="600">
            ⏳ Waiting on DB / API
          </text>
          <text x="340" y={91 + i * 52} textAnchor="middle" fontSize="10" fill="#57606a">
            Thread {i + 1}
          </text>
        </g>
      ))}

      {/* "Thread blocked" label */}
      <rect x="180" y="232" width="200" height="28" rx="6"
        fill="#ffebe9" stroke="#d0d7de" strokeWidth="1.5" />
      <text x="280" y="251" textAnchor="middle" fontSize="10" fill="#cf222e" fontWeight="600">
        All threads busy — request waits
      </text>

      {/* ── Arrows to DB ── */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1="382" y1={86 + i * 52} x2="438" y2={86 + i * 52}
          stroke="#57606a" strokeWidth="1.5" markerEnd="url(#arr)" />
      ))}

      {/* ── Database ── */}
      <text x="560" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#57606a">DATABASE / SERVICE</text>
      <ellipse cx="560" cy="130" rx="80" ry="32" fill="#eef8f0" stroke="#2da44e" strokeWidth="2" />
      <rect x="480" y="130" width="160" height="40" fill="#eef8f0" stroke="#2da44e" strokeWidth="1.5" />
      <ellipse cx="560" cy="170" rx="80" ry="22" fill="#eef8f0" stroke="#2da44e" strokeWidth="2" />
      <text x="560" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1a7f37">DB</text>
      <text x="560" y="162" textAnchor="middle" fontSize="10" fill="#1a7f37">slow query</text>

      {/* Arrow marker */}
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#57606a" />
        </marker>
      </defs>

      {/* Verdict */}
      <rect x="460" y="220" width="280" height="50" rx="8" fill="#ffebe9" stroke="#cf222e" strokeWidth="1.5" />
      <text x="600" y="241" textAnchor="middle" fontSize="11" fontWeight="700" fill="#cf222e">⚠ Problem</text>
      <text x="600" y="258" textAnchor="middle" fontSize="10" fill="#82071e">
        3 active threads all blocked waiting for DB.
      </text>
      <text x="600" y="271" textAnchor="middle" fontSize="10" fill="#82071e">
        Request 4 cannot start — it queues.
      </text>
    </svg>
  );
}

/* ─── Diagram 2: Reactive Non-Blocking Model ─────────────────────────────── */
function ReactiveDiagram() {
  return (
    <svg
      viewBox="0 0 780 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', margin: '1.5rem 0' }}
      aria-label="Reactive non-blocking request model"
    >
      {/* Background */}
      <rect width="780" height="300" fill="#f6f8fa" rx="10" />

      {/* Title */}
      <text x="390" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1f2328">
        Reactive Non-Blocking Model (Spring WebFlux / Netty)
      </text>

      {/* ── Requests ── */}
      <text x="70" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#57606a">REQUESTS</text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="20" y={68 + i * 52} width="100" height="32" rx="6"
            fill="#0969da" opacity="0.9" />
          <text x="70" y={89 + i * 52} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600">
            Request {i + 1}
          </text>
        </g>
      ))}

      {/* ── Arrows to event loop ── */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="122" y1={84 + i * 52} x2="178" y2={130}
          stroke="#57606a" strokeWidth="1" markerEnd="url(#arr2)" opacity="0.6" />
      ))}

      {/* ── Event Loop ── */}
      <text x="280" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#57606a">EVENT LOOP (1–2 threads)</text>
      <rect x="180" y="68" width="200" height="164" rx="10"
        fill="#fff" stroke="#0969da" strokeWidth="2" />
      <circle cx="280" cy="130" r="44" fill="#ddf4ff" stroke="#0969da" strokeWidth="2" />
      <text x="280" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0550ae">Event</text>
      <text x="280" y="141" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0550ae">Loop</text>
      {/* loop arrow */}
      <path d="M256,88 A40,32 0 1,1 304,88" fill="none" stroke="#0969da" strokeWidth="1.5"
        strokeDasharray="4,3" markerEnd="url(#arr2)" />
      <text x="280" y="82" textAnchor="middle" fontSize="9" fill="#0550ae">non-stop</text>

      <text x="280" y="196" textAnchor="middle" fontSize="10" fill="#0550ae" fontWeight="600">
        Registers callbacks,
      </text>
      <text x="280" y="210" textAnchor="middle" fontSize="10" fill="#0550ae" fontWeight="600">
        never blocks
      </text>
      <text x="280" y="224" textAnchor="middle" fontSize="9" fill="#57606a">
        Handles all 4 requests
      </text>

      {/* ── Arrows to DB ── */}
      <line x1="382" y1="130" x2="438" y2="130"
        stroke="#57606a" strokeWidth="1.5" markerEnd="url(#arr2)" />
      <text x="410" y="120" textAnchor="middle" fontSize="9" fill="#57606a">async call</text>

      {/* ── Dashed callback arrows ── */}
      <line x1="438" y1="150" x2="382" y2="150"
        stroke="#2da44e" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arr3)" />
      <text x="410" y="170" textAnchor="middle" fontSize="9" fill="#2da44e">callback / result</text>

      {/* ── Database ── */}
      <text x="560" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#57606a">DATABASE / SERVICE</text>
      <ellipse cx="560" cy="116" rx="80" ry="32" fill="#eef8f0" stroke="#2da44e" strokeWidth="2" />
      <rect x="480" y="116" width="160" height="40" fill="#eef8f0" stroke="#2da44e" strokeWidth="1.5" />
      <ellipse cx="560" cy="156" rx="80" ry="22" fill="#eef8f0" stroke="#2da44e" strokeWidth="2" />
      <text x="560" y="134" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1a7f37">DB</text>
      <text x="560" y="148" textAnchor="middle" fontSize="10" fill="#1a7f37">slow query</text>

      {/* Arrow markers */}
      <defs>
        <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#57606a" />
        </marker>
        <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#2da44e" />
        </marker>
      </defs>

      {/* Verdict */}
      <rect x="460" y="200" width="280" height="64" rx="8" fill="#dafbe1" stroke="#2da44e" strokeWidth="1.5" />
      <text x="600" y="221" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1a7f37">✅ Solution</text>
      <text x="600" y="238" textAnchor="middle" fontSize="10" fill="#0a3622">
        One thread handles all 4 requests.
      </text>
      <text x="600" y="252" textAnchor="middle" fontSize="10" fill="#0a3622">
        While DB query runs, the thread picks up
      </text>
      <text x="600" y="266" textAnchor="middle" fontSize="10" fill="#0a3622">
        the next request — zero idle waiting.
      </text>
    </svg>
  );
}

/* ─── Diagram 3: Where Reactor sits in the stack ────────────────────────── */
function StackDiagram() {
  const layers = [
    { label: 'Your Application Code', sub: '@RestController, Service, Repository', color: '#ddf4ff', border: '#0969da', text: '#0550ae' },
    { label: 'Spring WebFlux', sub: 'Routing, filters, HTTP codec', color: '#fff8c5', border: '#9a6700', text: '#7d4e00' },
    { label: 'Project Reactor', sub: 'Mono, Flux, operators — the reactive engine', color: '#ffd8b2', border: '#bc4c00', text: '#6e2e00' },
    { label: 'Reactive Streams API', sub: 'Publisher / Subscriber contract (Java standard)', color: '#eef8f0', border: '#2da44e', text: '#1a7f37' },
    { label: 'Netty (or other server)', sub: 'Non-blocking I/O, event loop threads', color: '#f3eeff', border: '#8250df', text: '#6639ba' },
  ];

  return (
    <svg
      viewBox="0 0 620 290"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '620px', height: 'auto', display: 'block', margin: '1.5rem auto' }}
      aria-label="Spring WebFlux stack layers"
    >
      <rect width="620" height="290" fill="#f6f8fa" rx="10" />
      <text x="310" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1f2328">
        Spring WebFlux Technology Stack
      </text>
      {layers.map((l, i) => (
        <g key={i}>
          <rect x="40" y={38 + i * 48} width="540" height="38" rx="7"
            fill={l.color} stroke={l.border} strokeWidth="1.8" />
          <text x="310" y={53 + i * 48} textAnchor="middle" fontSize="12" fontWeight="700" fill={l.text}>
            {l.label}
          </text>
          <text x="310" y={67 + i * 48} textAnchor="middle" fontSize="10" fill={l.text} opacity="0.85">
            {l.sub}
          </text>
          {i < layers.length - 1 && (
            <text x="310" y={84 + i * 48} textAnchor="middle" fontSize="14" fill="#57606a">↑</text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ProjectReactor() {
  return (
    <PageLayout
      breadcrumb="Core Concepts"
      title="What is Project Reactor?"
      description="Understand what Project Reactor is, how it powers Spring WebFlux, and how its non-blocking approach differs from a traditional REST application."
      badge={{ text: 'Beginner', level: 'beginner' }}
      readTime="10 min read"
      currentPath={PATH}
    >
      <SEO
        title="What is Project Reactor?"
        description="Learn what Project Reactor is, how Mono and Flux work, and how the non-blocking reactive model compares to a traditional blocking Spring MVC REST application."
        path={PATH}
        keywords="Project Reactor, reactive programming, non-blocking, Spring WebFlux, Mono, Flux, event loop, blocking vs reactive"
      />

      {/* ── Section 1: What is Project Reactor ── */}
      <div className="section" id="what-is-reactor">
        <h2 className="section-title">What is Project Reactor?</h2>
        <div className="step-content">
          <p>
            <strong>Project Reactor</strong> is an open-source Java library that makes it easy to
            write code that handles data arriving over time — without blocking threads while waiting.
            It is the reactive engine underneath Spring WebFlux, the same way Tomcat is the engine under Spring MVC.
          </p>
          <p>
            Reactor gives you two building blocks:
          </p>
          <ul>
            <li>
              <strong><code>Mono&lt;T&gt;</code></strong> — delivers at most one result in the future
              (e.g. fetching a single user from the database).
            </li>
            <li>
              <strong><code>Flux&lt;T&gt;</code></strong> — delivers a stream of 0 or more results over
              time (e.g. returning a list of products or a live event feed).
            </li>
          </ul>
          <p>
            Instead of writing <code>return user;</code> you write <code>return Mono.just(user);</code> —
            and the framework handles all the scheduling, threading, and delivery for you.
          </p>
        </div>

        <div className="info-box info">
          <span className="info-box-icon">ℹ️</span>
          <div className="info-box-content">
            <div className="info-box-title">Project Reactor vs RxJava</div>
            Both are reactive libraries with a similar API. Project Reactor is the one Spring chose to
            build WebFlux on top of because it was designed from scratch for the JVM
            and integrates seamlessly with the Spring ecosystem.
          </div>
        </div>
      </div>

      {/* ── Section 2: Traditional REST ── */}
      <div className="section" id="traditional-rest">
        <h2 className="section-title">How a Traditional REST Application Works</h2>
        <div className="step-content">
          <p>
            A standard Spring MVC application uses a <strong>thread-per-request</strong> model.
            When a request comes in, Tomcat picks a thread from its pool and assigns it to that
            request for its entire lifetime:
          </p>
          <ol>
            <li>Request arrives → thread is picked from the pool.</li>
            <li>Thread calls the database → <strong>sits idle waiting</strong> for the result.</li>
            <li>Database result arrives → thread sends the response.</li>
            <li>Thread goes back to the pool.</li>
          </ol>
          <p>
            This works perfectly for moderate traffic. The problem appears under high load: if 200
            requests arrive at the same time and the thread pool only has 200 threads, request 201
            has to <strong>queue and wait</strong> — even though every occupied thread is just idle,
            doing nothing but waiting for a database query to finish.
          </p>
        </div>

        <BlockingDiagram />
        <p className="arch-caption">
          Fig 1 — In the blocking model, each request holds a thread even while waiting for the database.
          When all threads are busy, new requests queue up.
        </p>
      </div>

      {/* ── Section 3: Reactive model ── */}
      <div className="section" id="reactive-model">
        <h2 className="section-title">How the Reactive Model Works</h2>
        <div className="step-content">
          <p>
            Spring WebFlux + Reactor use a <strong>non-blocking event loop</strong> model
            (borrowed from Node.js and Nginx). Instead of one thread per request, a tiny number
            of threads — usually one per CPU core — handle <em>all</em> requests:
          </p>
          <ol>
            <li>Request arrives → event loop thread picks it up.</li>
            <li>Thread starts the database call, <strong>registers a callback</strong>, and immediately
              moves on to the next request — it does not wait.</li>
            <li>When the database result is ready, the event loop picks up the callback and sends
              the response.</li>
          </ol>
          <p>
            No thread is ever idle. A server with 8 CPU cores can comfortably handle thousands of
            simultaneous connections because threads never block.
          </p>
        </div>

        <ReactiveDiagram />
        <p className="arch-caption">
          Fig 2 — In the reactive model, one event loop thread handles all requests concurrently by
          registering callbacks instead of waiting.
        </p>

        <div className="info-box success">
          <span className="info-box-icon">✅</span>
          <div className="info-box-content">
            <div className="info-box-title">The practical effect</div>
            A traditional Tomcat server configured with 200 threads can handle ~200 simultaneous
            slow database calls. A Netty-based WebFlux server with 8 threads can handle tens of
            thousands — because those 8 threads are never blocked waiting.
          </div>
        </div>
      </div>

      {/* ── Section 4: Side-by-side comparison ── */}
      <div className="section" id="comparison">
        <h2 className="section-title">Side-by-Side Comparison</h2>
        <div className="step-content">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Feature</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Traditional REST (Spring MVC)</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Reactive (Spring WebFlux)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Threading model', 'One thread per request', 'Event loop — few threads, many requests'],
                ['Waiting on I/O', 'Thread blocks and waits', 'Thread moves on; callback resumes later'],
                ['Concurrency at same thread count', 'Limited (= thread pool size)', 'Very high'],
                ['Memory use under load', 'Grows with thread count', 'Stays low (fewer threads)'],
                ['Return types', 'Plain objects, List<T>, Optional<T>', 'Mono<T>, Flux<T>'],
                ['Database driver', 'JDBC (blocking)', 'R2DBC (non-blocking)'],
                ['Learning curve', 'Low — familiar imperative style', 'Higher — reactive operators take time'],
                ['Best for', 'Standard CRUD, low-to-medium traffic', 'High concurrency, streaming, microservices'],
              ].map(([feature, mvc, webflux], i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg2)' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: 'var(--text)' }}>{feature}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--text2)' }}>{mvc}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--text2)' }}>{webflux}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: Where Reactor fits ── */}
      <div className="section" id="stack">
        <h2 className="section-title">Where Project Reactor Fits in Your App</h2>
        <div className="step-content">
          <p>
            When you write a Spring WebFlux application, Project Reactor sits in the middle of
            the stack — between your code and the low-level server. You don't interact with it
            directly very often; mostly you just write controller methods that return
            <code> Mono</code> or <code>Flux</code> and Reactor handles everything below.
          </p>
        </div>
        <StackDiagram />
        <p className="arch-caption">
          Fig 3 — Project Reactor is the layer that turns your Mono/Flux declarations into actual
          non-blocking I/O calls on Netty's event loop threads.
        </p>
      </div>

      {/* ── Section 6: Code comparison ── */}
      <div className="section" id="code-comparison">
        <h2 className="section-title">Code: MVC vs WebFlux</h2>
        <div className="step-content">
          <p>The code change is mostly in the return type. The logic stays the same:</p>
        </div>

        <div className="step-content">
          <p><strong>Spring MVC (blocking)</strong></p>
          <pre><code>{`@RestController
public class UserController {

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        // Thread blocks here until DB responds
        return userRepository.findById(id);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}`}</code></pre>

          <p style={{ marginTop: '1.5rem' }}><strong>Spring WebFlux (non-blocking)</strong></p>
          <pre><code>{`@RestController
public class UserController {

    @GetMapping("/users/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        // Returns immediately — result delivered later
        return userRepository.findById(id);
    }

    @GetMapping("/users")
    public Flux<User> getAllUsers() {
        return userRepository.findAll();
    }
}`}</code></pre>
        </div>

        <div className="info-box warning">
          <span className="info-box-icon">⚠️</span>
          <div className="info-box-content">
            <div className="info-box-title">Don't mix blocking and reactive code</div>
            If you call a blocking JDBC method inside a WebFlux controller, it will block the event
            loop thread and cancel out all the benefits. Use R2DBC (reactive database driver) or
            wrap blocking calls with <code>Mono.fromCallable(...).subscribeOn(Schedulers.boundedElastic())</code>
            to move them off the event loop.
          </div>
        </div>
      </div>

      {/* ── Section 7: When to use / not use ── */}
      <div className="section" id="when-to-use">
        <h2 className="section-title">When Should You Use Project Reactor / WebFlux?</h2>
        <div className="step-content">
          <p><strong>Great fit:</strong></p>
          <ul>
            <li>APIs that handle lots of simultaneous users (hundreds or thousands).</li>
            <li>Apps that call many external services and databases per request.</li>
            <li>Real-time features: live notifications, Server-Sent Events, WebSockets.</li>
            <li>Microservices that chain several downstream calls together.</li>
          </ul>

          <p style={{ marginTop: '1rem' }}><strong>Not a great fit:</strong></p>
          <ul>
            <li>Simple CRUD apps with low traffic — Spring MVC is simpler and perfectly adequate.</li>
            <li>Heavy computation tasks (image processing, report generation) — threads are busy regardless.</li>
            <li>Teams new to reactive programming — there is a real learning curve.</li>
            <li>Apps that depend on blocking libraries with no reactive alternative.</li>
          </ul>
        </div>
      </div>

      {/* ── Section 8: Summary ── */}
      <div className="section" id="summary">
        <h2 className="section-title">Summary</h2>
        <div className="step-content">
          <ul>
            <li><strong>Project Reactor</strong> is the reactive library Spring WebFlux is built on — it provides <code>Mono</code> and <code>Flux</code>.</li>
            <li><strong>Traditional REST</strong> uses one thread per request; that thread blocks while waiting on I/O.</li>
            <li><strong>Reactor / WebFlux</strong> uses an event loop; threads never wait — they move on and get notified when data is ready.</li>
            <li>The code difference is mostly the return type: <code>User</code> → <code>Mono&lt;User&gt;</code>.</li>
            <li>The biggest gain is <strong>higher throughput with fewer threads and less memory</strong> under heavy load.</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
