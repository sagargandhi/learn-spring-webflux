import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/mono-and-flux-the-core-reactive-types-in-project-reactor';

export default function MonoAndFlux() {
  return (
    <>
      <SEO
        title="Mono and Flux — The Core Reactive Types in Project Reactor"
        description="Deep dive into Mono and Flux, the two fundamental reactive types in Project Reactor. Learn how to create, transform, combine, and subscribe to them with real-world examples."
        path={PATH}
        keywords="Mono, Flux, Project Reactor, reactive types, subscribe, just, fromCallable, create"
      />
      <PageLayout
        breadcrumb="Core Concepts"
        title="Mono and Flux — The Core Reactive Types in Project Reactor"
        description="A deep dive into Mono and Flux — the building blocks of every Spring WebFlux application. Learn how to create them, what the subscription lifecycle looks like, and how to combine multiple publishers."
        badge={{ text: 'Beginner', level: 'beginner' }}
        readTime="20 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#what-are-they">What Are Mono and Flux?</a></li>
            <li><a href="#problem-they-solve">The Problem They Solve</a></li>
            <li><a href="#publisher">Publishers in Reactive Streams</a></li>
            <li><a href="#mono">Mono — 0 or 1 Item</a></li>
            <li><a href="#flux">Flux — 0 to N Items</a></li>
            <li><a href="#why-mono-flux">Why Do We Need Mono and Flux?</a></li>
            <li><a href="#flux-vs-rest">Flux vs Traditional REST API</a></li>
            <li><a href="#creating">Creating Mono and Flux</a></li>
            <li><a href="#subscribing">The Subscription Lifecycle</a></li>
            <li><a href="#cold-hot">Cold vs Hot Publishers</a></li>
            <li><a href="#combining">Combining Publishers</a></li>
          </ol>
        </div>

        <div className="section" id="what-are-they">
          <h2 className="section-title">What Are Mono and Flux?</h2>
          <div className="step-content">
            <p>
              <code>Mono</code> and <code>Flux</code> are the two core types provided by{' '}
              <strong>Project Reactor</strong>, the reactive library that Spring WebFlux is built on.
              At their heart they are both <strong>publishers</strong> — objects that eventually
              produce data asynchronously and notify whoever is listening.
            </p>
            <p>
              Think of them like a <strong>promise or a contract</strong>: instead of handing back
              an actual value right now, they describe how and when data will arrive — and what to
              do if something goes wrong along the way. The key mental model shift is:
            </p>
            <ul>
              <li><strong>Traditional code</strong>: Call a method → wait → get the value back immediately (thread blocked).</li>
              <li><strong>Reactive code</strong>: Call a method → get a Mono/Flux back immediately → the value arrives later, asynchronously, on whatever thread finishes the work.</li>
            </ul>
            <p>
              <code>Mono&lt;T&gt;</code> models a <strong>single</strong> asynchronous result (0 or 1 value).{' '}
              <code>Flux&lt;T&gt;</code> models a <strong>stream</strong> of zero or more results arriving
              over time. Together they replace both <code>CompletableFuture&lt;T&gt;</code> and{' '}
              <code>List&lt;T&gt;</code> in the reactive world — but with far more power: rich operators,
              backpressure, composition, and unified error handling.
            </p>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">Analogy: a Mono is like a tracking number, a Flux is like a live shipment feed</div>
              When you order a single item online, you get a tracking number (Mono). You don't have
              the package yet, but you have a handle that will eventually resolve to your delivery —
              or an error if it gets lost. A Flux is like a live dashboard showing every scan of
              every package in a warehouse: items arrive one by one over time, you see each one as
              it happens, and the stream ends when the shift is over.
            </div>
          </div>
        </div>

        <div className="section" id="problem-they-solve">
          <h2 className="section-title">The Problem They Solve</h2>
          <div className="step-content">
            <p>
              Before reactive types, Java developers had a few options for asynchronous work,
              each with significant drawbacks:
            </p>
          </div>
          <table className="dep-table">
            <thead>
              <tr><th>Approach</th><th>What You Get Back</th><th>Problems</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Plain method call</td>
                <td><code>User</code> / <code>List&lt;User&gt;</code></td>
                <td>Blocks the calling thread until the DB returns. Under load, threads pile up and the server runs out of threads.</td>
              </tr>
              <tr>
                <td><code>Future&lt;T&gt;</code></td>
                <td>A future result</td>
                <td>Calling <code>.get()</code> still blocks. No composition operators. No backpressure. Error handling is clunky.</td>
              </tr>
              <tr>
                <td><code>CompletableFuture&lt;T&gt;</code></td>
                <td>A composable future</td>
                <td>Better composition, but still only models <em>one</em> value. No streaming support. No backpressure. Error propagation is awkward.</td>
              </tr>
              <tr>
                <td>Callbacks</td>
                <td>Nothing (side-effect based)</td>
                <td>Callback hell. Hard to compose. No standard way to signal completion or handle errors cleanly.</td>
              </tr>
              <tr>
                <td><code>Mono&lt;T&gt;</code> / <code>Flux&lt;T&gt;</code></td>
                <td>A publisher you compose</td>
                <td style={{color: '#1a7f37', fontWeight: 600}}>Non-blocking. Composable. Backpressure built-in. Unified error handling. Works with 0, 1, or many values.</td>
              </tr>
            </tbody>
          </table>
          <div className="step-content">
            <p>
              The fundamental problem is <strong>thread waste</strong>. In a traditional Spring MVC
              app, every HTTP request occupies one thread from Tomcat's pool (typically 200 threads).
              When that thread calls a database or an external service, it parks itself and waits —
              doing zero useful work during the wait, yet holding onto its slot in the thread pool.
              Under any meaningful load, you hit the ceiling fast.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">text</span>
              <span className="code-block-filename">Why threads are wasted in blocking code</span>
            </div>
            <pre><code>{`Request arrives → Thread-1 assigned
  Thread-1: sends DB query
  Thread-1: sleeping... waiting... (≈10–100 ms)   ← doing NOTHING
  Thread-1: DB result arrives
  Thread-1: serializes response
  Thread-1: returns to pool

During that 10–100ms wait, Thread-1 could have processed dozens
of other requests — but it was blocked, unavailable.

With 200 threads and 200 concurrent slow DB queries:
  → Thread pool exhausted
  → Request 201 must wait in queue
  → Latency spikes, then 503 errors`}</code></pre>
          </div>
          <div className="step-content">
            <p>
              <code>Mono</code> and <code>Flux</code> solve this by representing work as a{' '}
              <strong>pipeline</strong> rather than an imperative sequence. When you return a{' '}
              <code>Mono&lt;User&gt;</code> from a controller, you are effectively saying:
            </p>
            <blockquote style={{borderLeft: '4px solid #0969da', paddingLeft: '1rem', margin: '1rem 0', color: '#555', fontStyle: 'italic'}}>
              "I've registered the work to fetch this user. When the database finishes, deliver the result
              to the subscriber. In the meantime, this thread is completely free to handle other requests."
            </blockquote>
            <p>
              The actual DB call runs via a non-blocking driver (R2DBC). When results arrive,
              an event loop picks up the work and pushes it through the pipeline — no thread sat
              idle in between.
            </p>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Mono and Flux are lazy — nothing runs until subscribe()</div>
              A Mono or Flux is just a recipe — it describes <em>what</em> to do, not <em>when</em>.
              No database queries run, no HTTP calls are made, until something subscribes to it.
              In Spring WebFlux, the framework subscribes automatically when it handles your
              controller's return value. In tests or background jobs, you call <code>.subscribe()</code>
              or use <code>StepVerifier</code> yourself.
            </div>
          </div>
        </div>

        <div className="section" id="publisher">
          <h2 className="section-title">Publishers in Reactive Streams — How Mono and Flux Work</h2>
          <div className="step-content">
            <p>Both <code>Mono</code> and <code>Flux</code> implement the{' '}
              <code>Publisher&lt;T&gt;</code> interface from the Reactive Streams specification.
              This means they play by the same rules: they can only send data <em>after</em>{' '}
              a subscriber requests it, they must eventually signal completion or an error, and
              they must never send more items than were requested (backpressure).
            </p>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Nothing happens until you subscribe</div>
              A Mono or Flux is just a recipe — it describes <em>what</em> to do, not <em>when</em>. No database queries run, no HTTP calls are made, until something subscribes to it. This is different from a plain method call that runs immediately.
            </div>
          </div>
        </div>

        <div className="section" id="mono">
          <h2 className="section-title">Mono — 0 or 1 Result</h2>
          <div className="step-content">
            <p><code>Mono&lt;T&gt;</code> represents a future result that will eventually deliver either one value, no value, or an error. Use it whenever you expect a single result — like looking up a user by ID.</p>
            <ul>
              <li><strong>onNext(T)</strong> – the value arrived successfully.</li>
              <li><strong>onComplete</strong> – finished with no value (empty result).</li>
              <li><strong>onError(Throwable)</strong> – something went wrong.</li>
            </ul>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Mono examples</span>
            </div>
            <pre><code>{`// Present value
Mono<String> mono1 = Mono.just("Hello");

// Empty (like Optional.empty())
Mono<String> empty = Mono.empty();

// Error terminal signal
Mono<String> error = Mono.error(new RuntimeException("Something went wrong"));

// From a supplier (executed lazily on subscription)
Mono<User> userMono = Mono.fromCallable(() -> userRepository.findByIdBlocking(42L));

// From a CompletableFuture
Mono<String> fromFuture = Mono.fromFuture(someCompletableFuture);

// Delay (emits after 1 second)
Mono<Long> delayed = Mono.delay(Duration.ofSeconds(1));`}</code></pre>
          </div>
        </div>

        <div className="section" id="flux">
          <h2 className="section-title">Flux — 0 to Many Results</h2>
          <div className="step-content">
            <p><code>Flux&lt;T&gt;</code> represents a stream that delivers multiple values over time — like returning a list of products or a live feed of events. It can emit zero or more values, then ends with either a completion or an error signal.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Flux examples</span>
            </div>
            <pre><code>{`// From varargs
Flux<String> flux1 = Flux.just("A", "B", "C");

// From an Iterable (List, Set, etc.)
List<String> list = List.of("x", "y", "z");
Flux<String> fromList = Flux.fromIterable(list);

// Numeric range
Flux<Integer> range = Flux.range(1, 100);  // 1 to 100

// Interval (ticks every second)
Flux<Long> ticker = Flux.interval(Duration.ofSeconds(1));

// From a Stream
Flux<String> fromStream = Flux.fromStream(Stream.of("a", "b", "c"));

// Programmatic creation (push-based)
Flux<String> created = Flux.create(sink -> {
    sink.next("Item 1");
    sink.next("Item 2");
    sink.complete();
});`}</code></pre>
          </div>
        </div>

        <div className="section" id="why-mono-flux">
          <h2 className="section-title">Why Do We Need Mono and Flux?</h2>
          <div className="step-content">
            <p>
              In reactive systems, work is asynchronous and non-blocking. Returning plain Java values
              like <code>User</code> or <code>List&lt;User&gt;</code> does not describe <em>when</em> the data
              arrives, how errors travel, or how consumers can control data rate. <code>Mono</code> and
              <code> Flux</code> solve that by modeling data as a stream with lifecycle signals.
            </p>
            <p>Here are the five core reasons you need them:</p>
          </div>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-body">
                <div className="step-title">Clear Async Contract</div>
                <div className="step-content">
                  <p>
                    When a method returns <code>Mono&lt;User&gt;</code>, the caller knows
                    immediately: this is asynchronous, the data isn't here yet, and I should
                    compose rather than block. A plain <code>User</code> return type gives no such
                    hint — you have to read docs or source to know if it blocks.
                  </p>
                  <div className="code-block" style={{marginTop: '0.75rem'}}>
                    <pre><code>{`// Ambiguous — does this block? Is it null? Does it throw?
User findUser(long id);

// Crystal clear — async, non-blocking, may be empty, errors propagated
Mono<User> findUser(long id);`}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-body">
                <div className="step-title">Unified Error Handling</div>
                <div className="step-content">
                  <p>
                    Errors in reactive pipelines travel through the same channel as data — via
                    the <code>onError</code> signal. You don't need try/catch scattered everywhere.
                    Operators like <code>onErrorReturn</code>, <code>onErrorResume</code>, and{' '}
                    <code>retry</code> let you handle failures declaratively at any point in the pipeline.
                  </p>
                  <div className="code-block" style={{marginTop: '0.75rem'}}>
                    <pre><code>{`userRepository.findById(id)
    .onErrorReturn(User.anonymous())         // fallback on any error
    .onErrorResume(NotFoundException.class,
        e -> Mono.just(User.guest()))        // specific error type fallback
    .retry(3);                               // retry up to 3 times before failing`}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-body">
                <div className="step-title">Powerful Composition</div>
                <div className="step-content">
                  <p>
                    You can combine, transform, filter, and join multiple async sources using
                    over 100 built-in operators. Running two database queries in <em>parallel</em>{' '}
                    and combining their results is a one-liner:
                  </p>
                  <div className="code-block" style={{marginTop: '0.75rem'}}>
                    <pre><code>{`// Both queries run simultaneously — NOT sequentially
Mono.zip(
    userRepository.findById(userId),
    accountRepository.findByUser(userId)
).map(tuple -> new Dashboard(tuple.getT1(), tuple.getT2()));

// With plain blocking code, these would run one after the other,
// doubling the total latency.`}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-body">
                <div className="step-title">Built-in Backpressure</div>
                <div className="step-content">
                  <p>
                    When a <code>Flux</code> produces data faster than the consumer can process it,
                    the consumer signals how many items it wants via <code>request(n)</code>.
                    This prevents memory overload — no data sits in an unbounded buffer.
                    Traditional <code>List&lt;T&gt;</code> has no concept of this; the entire list
                    is always loaded into memory regardless of how long processing takes.
                  </p>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">5</div>
              <div className="step-body">
                <div className="step-title">Right Type for Cardinality</div>
                <div className="step-content">
                  <p>
                    Using the correct type documents intent and prevents bugs:{' '}
                    <code>Mono</code> for 0 or 1 result, <code>Flux</code> for 0 to N results.
                    This eliminates entire classes of errors — like accidentally returning a
                    list with one element when the caller expects a scalar, or trying to stream
                    from a type that doesn't support streaming.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <table className="dep-table" style={{marginTop: '1.5rem'}}>
            <thead>
              <tr><th>Use Case</th><th>Recommended Type</th><th>Reason</th></tr>
            </thead>
            <tbody>
              <tr><td>Find user by ID</td><td><code>Mono&lt;User&gt;</code></td><td>Single optional result — 0 or 1</td></tr>
              <tr><td>Create or update a record</td><td><code>Mono&lt;Void&gt;</code> or <code>Mono&lt;Result&gt;</code></td><td>One completion or result signal</td></tr>
              <tr><td>Delete a record</td><td><code>Mono&lt;Void&gt;</code></td><td>Signal completion with no payload</td></tr>
              <tr><td>Fetch all orders from DB</td><td><code>Flux&lt;Order&gt;</code></td><td>Multiple rows streamed one by one</td></tr>
              <tr><td>Live push notifications</td><td><code>Flux&lt;Notification&gt;</code></td><td>Continuous stream over time</td></tr>
              <tr><td>Server-Sent Events endpoint</td><td><code>Flux&lt;ServerSentEvent&gt;</code></td><td>Ongoing streaming response</td></tr>
              <tr><td>Count records</td><td><code>Mono&lt;Long&gt;</code></td><td>Scalar aggregate — one number</td></tr>
            </tbody>
          </table>
        </div>

        <div className="section" id="flux-vs-rest">
          <h2 className="section-title">Flux vs Traditional REST API</h2>
          <div className="step-content">
            <p>
              This is one of the most important distinctions to understand. When developers first
              encounter <code>Flux&lt;T&gt;</code> they often wonder:{' '}
              <em>"I already return a <code>List&lt;T&gt;</code> from my REST endpoint — why do I need Flux?"</em>
            </p>
            <p>
              The answer lies in <strong>how</strong> and <strong>when</strong> the data is
              produced, held in memory, and delivered to the client. Let's walk through the
              full lifecycle of each approach.
            </p>
          </div>

          <h3 style={{margin: '1.5rem 0 0.75rem', fontSize: '1.05rem', fontWeight: 700, color: '#1f2328'}}>How a Traditional REST Endpoint Works</h3>
          <div className="step-content">
            <ol>
              <li>An HTTP request arrives. Tomcat assigns a thread from its pool (≈200 default).</li>
              <li>The thread calls your controller, which calls a service, which executes a JDBC query.</li>
              <li><strong>The thread blocks and waits</strong> — doing nothing — while the database runs the query.</li>
              <li>All results are loaded into a <code>List&lt;T&gt;</code> <strong>fully in memory</strong>.</li>
              <li>Jackson serializes the entire list to JSON in one go.</li>
              <li>The complete JSON payload is written to the HTTP response body at once.</li>
              <li>The thread returns to the pool only after the response is fully sent.</li>
            </ol>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Traditional Spring MVC — blocking, all-at-once</span>
            </div>
            <pre><code>{`@RestController
public class UserController {

    @GetMapping("/users")
    public List<User> getUsers() {
        // ① Thread blocks here while DB runs the query
        // ② ALL rows loaded into memory at once → memory spike
        // ③ Entire list serialized and sent as one big JSON array
        // ④ Client receives nothing until all rows are ready
        return userService.findAll(); // blocking JDBC call
    }
}`}</code></pre>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Problems with the traditional approach</div>
              <ul style={{margin: '0.5rem 0 0', paddingLeft: '1.25rem'}}>
                <li><strong>Thread waste</strong>: the thread is parked for the entire DB wait (10–500ms per request).</li>
                <li><strong>Memory spike</strong>: 100,000 rows → 100,000 objects in heap at once → OutOfMemoryError risk.</li>
                <li><strong>High first-byte latency</strong>: client sees nothing until the full list is ready and serialized.</li>
                <li><strong>Thread ceiling</strong>: 200 threads × 100ms avg DB wait = you saturate the thread pool at just 2,000 req/sec.</li>
              </ul>
            </div>
          </div>

          <h3 style={{margin: '1.5rem 0 0.75rem', fontSize: '1.05rem', fontWeight: 700, color: '#1f2328'}}>How a Flux-Based WebFlux Endpoint Works</h3>
          <div className="step-content">
            <ol>
              <li>An HTTP request arrives. A Netty event loop thread picks it up.</li>
              <li>Your controller method <strong>returns a <code>Flux&lt;User&gt;</code> immediately</strong> — no blocking yet.</li>
              <li>Spring WebFlux subscribes to the Flux on your behalf.</li>
              <li>The R2DBC (reactive DB driver) sends the query asynchronously. The event loop thread is <strong>completely free</strong> to handle other requests while waiting.</li>
              <li>As each row comes back from the DB, it is emitted through the Flux, serialized, and <strong>written to the HTTP response immediately</strong> — item by item.</li>
              <li>The HTTP connection stays open (chunked transfer or NDJSON) and rows arrive at the client progressively.</li>
              <li>When the DB cursor is exhausted, the Flux completes and the connection closes.</li>
            </ol>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Spring WebFlux — non-blocking, progressive streaming</span>
            </div>
            <pre><code>{`@RestController
public class UserController {

    // Returns a standard JSON array — waits for all items, then sends
    // (same response shape as MVC, but non-blocking under the hood)
    @GetMapping("/users")
    public Flux<User> getUsers() {
        return userService.findAll(); // Flux<User> from R2DBC — non-blocking
    }

    // Streams each user as it arrives (Newline-Delimited JSON)
    // Client receives and can process users before the query finishes
    @GetMapping(value = "/users/stream", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<User> streamUsers() {
        return userService.findAll();
    }

    // Server-Sent Events — live push updates to browser clients
    @GetMapping(value = "/users/live", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<User> liveUsers() {
        return userService.findAll()
            .delayElements(Duration.ofMillis(100)); // paced streaming
    }
}`}</code></pre>
          </div>

          <h3 style={{margin: '1.5rem 0 0.75rem', fontSize: '1.05rem', fontWeight: 700, color: '#1f2328'}}>Full Side-by-Side Comparison</h3>
          <table className="dep-table">
            <thead>
              <tr><th>Aspect</th><th>Traditional REST (Spring MVC)</th><th>Flux-Based REST (Spring WebFlux)</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Execution model</strong></td>
                <td>Blocking, thread-per-request (Tomcat)</td>
                <td>Non-blocking, event-loop (Netty)</td>
              </tr>
              <tr>
                <td><strong>Thread usage</strong></td>
                <td>1 thread held per request for its full duration</td>
                <td>A few event-loop threads serve thousands of requests</td>
              </tr>
              <tr>
                <td><strong>Database driver</strong></td>
                <td>JDBC — synchronous, blocking</td>
                <td>R2DBC / Reactive MongoDB — fully non-blocking</td>
              </tr>
              <tr>
                <td><strong>Memory usage</strong></td>
                <td>Entire result set loaded into heap at once</td>
                <td>Items flow one-by-one; only a small window in memory</td>
              </tr>
              <tr>
                <td><strong>Response delivery</strong></td>
                <td>All at once — one complete JSON payload</td>
                <td>Progressive — client receives items as they arrive</td>
              </tr>
              <tr>
                <td><strong>First-byte latency</strong></td>
                <td>After full query + full serialization completes</td>
                <td>After the first row returns from the DB</td>
              </tr>
              <tr>
                <td><strong>Backpressure</strong></td>
                <td>None — everything is pushed regardless</td>
                <td>Built-in — consumer controls how many items it receives</td>
              </tr>
              <tr>
                <td><strong>Scalability ceiling</strong></td>
                <td>Thread pool size (typically 200 threads)</td>
                <td>CPU/IO bound — handles tens of thousands of connections</td>
              </tr>
              <tr>
                <td><strong>Streaming support</strong></td>
                <td>Not natural — requires workarounds</td>
                <td>Native — NDJSON, SSE, and WebSocket built-in</td>
              </tr>
              <tr>
                <td><strong>Best for</strong></td>
                <td>Low-to-moderate concurrency, simple CRUD</td>
                <td>High concurrency, IO-heavy work, live streaming</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{margin: '1.5rem 0 0.75rem', fontSize: '1.05rem', fontWeight: 700, color: '#1f2328'}}>When Is Flux Actually Required?</h3>
          <div className="step-content">
            <p>
              <code>Flux</code> is not just a stylistic choice — there are scenarios where it
              is the <em>only</em> practical approach:
            </p>
            <ul>
              <li>
                <strong>Large datasets</strong>: Returning 1 million records as a <code>List</code>{' '}
                would cause an <code>OutOfMemoryError</code>. A <code>Flux</code> streams them through
                a small fixed buffer.
              </li>
              <li>
                <strong>Real-time / live data</strong>: A <code>List</code> is finite and collected
                upfront. A <code>Flux</code> can be infinite — think a stock ticker, sensor readings,
                or chat messages that never fully "complete".
              </li>
              <li>
                <strong>Server-Sent Events (SSE)</strong>: The HTTP connection stays open and
                events are pushed to the client over time. Only <code>Flux</code> models this naturally.
              </li>
              <li>
                <strong>Progressive loading</strong>: Clients can start rendering the first items
                while the rest are still being fetched — significantly better perceived performance.
              </li>
              <li>
                <strong>High-concurrency systems</strong>: With Flux + R2DBC, a handful of event-loop
                threads can handle tens of thousands of simultaneous requests — impossible with
                Tomcat's 200-thread model.
              </li>
            </ul>
          </div>

          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Real-world example — loading 500,000 products</span>
            </div>
            <pre><code>{`// ❌ Traditional blocking approach: loads ALL 500,000 products into memory at once
@GetMapping("/products")
public List<Product> getAllProducts() {
    return productRepository.findAll(); // 500,000 objects → possible OutOfMemoryError!
}
// Problems:
// → Entire result set held in heap while serializing to JSON
// → Thread blocked for the entire duration (DB + serialization)
// → Client waits for 100% of data before receiving anything


// ✅ Reactive streaming approach: items flow one-by-one
@GetMapping(value = "/products", produces = MediaType.APPLICATION_NDJSON_VALUE)
public Flux<Product> getAllProducts() {
    return productRepository.findAll(); // R2DBC — streams rows as they arrive
}
// Benefits:
// → Only a small buffer in memory at any time
// → Event-loop thread free between DB rows arriving
// → Client starts receiving products almost immediately
// → Works for 500,000 or 50,000,000 rows — memory usage stays flat`}</code></pre>
          </div>

          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Mono vs Flux — choose based on how many results you have</div>
              Use <code>Mono</code> when your endpoint returns one item (like a user by ID) or signals
              completion of an operation. Use <code>Flux</code> when the endpoint naturally returns many
              items, a continuous stream, SSE events, or WebSocket messages.
              Rule of thumb: one result = <code>Mono</code>, many results or live stream = <code>Flux</code>.
            </div>
          </div>
        </div>

        <div className="section" id="creating">
          <h2 className="section-title">Creating Mono and Flux — Full Factory Method Reference</h2>
          <table className="dep-table">
            <thead>
              <tr><th>Factory Method</th><th>Type</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><span className="dep-name">Mono.just(T)</span></td><td>Mono</td><td>Wraps an already-computed value</td></tr>
              <tr><td><span className="dep-name">Mono.empty()</span></td><td>Mono</td><td>Completes without emitting</td></tr>
              <tr><td><span className="dep-name">Mono.error(Throwable)</span></td><td>Mono</td><td>Terminates with an error immediately</td></tr>
              <tr><td><span className="dep-name">Mono.fromCallable(Callable)</span></td><td>Mono</td><td>Lazy — executes callable on subscribe</td></tr>
              <tr><td><span className="dep-name">Mono.fromSupplier(Supplier)</span></td><td>Mono</td><td>Like fromCallable but unchecked</td></tr>
              <tr><td><span className="dep-name">Mono.fromFuture(CF)</span></td><td>Mono</td><td>Wraps CompletableFuture</td></tr>
              <tr><td><span className="dep-name">Mono.defer(Supplier&lt;Mono&gt;)</span></td><td>Mono</td><td>Creates a fresh Mono per subscription</td></tr>
              <tr><td><span className="dep-name">Flux.just(T...)</span></td><td>Flux</td><td>Fixed set of items</td></tr>
              <tr><td><span className="dep-name">Flux.fromIterable(Iterable)</span></td><td>Flux</td><td>From a collection</td></tr>
              <tr><td><span className="dep-name">Flux.range(start, count)</span></td><td>Flux</td><td>Integer range</td></tr>
              <tr><td><span className="dep-name">Flux.interval(Duration)</span></td><td>Flux</td><td>Ticks periodically (infinite)</td></tr>
              <tr><td><span className="dep-name">Flux.create(Consumer&lt;Sink&gt;)</span></td><td>Flux</td><td>Programmatic push-based creation</td></tr>
              <tr><td><span className="dep-name">Flux.generate(Callable, BiFunction)</span></td><td>Flux</td><td>Synchronous, stateful generation</td></tr>
            </tbody>
          </table>
        </div>

        <div className="section" id="subscribing">
          <h2 className="section-title">The Subscription Lifecycle</h2>
          <div className="step-content">
            <p>When you call <code>subscribe()</code>, the following sequence happens:</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-body">
                <div className="step-title">Subscriber calls subscribe(Publisher)</div>
                <div className="step-content"><p>This triggers the assembly of the reactive pipeline from source to sink.</p></div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-body">
                <div className="step-title">Publisher calls onSubscribe(Subscription)</div>
                <div className="step-content"><p>The Publisher hands a <code>Subscription</code> handle to the Subscriber. At this point no items flow yet.</p></div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-body">
                <div className="step-title">Subscriber calls request(n)</div>
                <div className="step-content"><p>The Subscriber signals how many items it can handle. This is the backpressure mechanism.</p></div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-body">
                <div className="step-title">Publisher emits up to n items via onNext(T)</div>
                <div className="step-content"><p>Items flow downstream through all operators in the pipeline.</p></div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-body">
                <div className="step-title">Terminal signal: onComplete() or onError()</div>
                <div className="step-content"><p>The sequence ends. No more items can be emitted after a terminal signal.</p></div>
              </div>
            </div>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Subscribing with full signal handling</span>
            </div>
            <pre><code>{`Flux.range(1, 5)
    .subscribe(
        item  -> System.out.println("onNext:    " + item),
        error -> System.err.println("onError:   " + error.getMessage()),
        ()    -> System.out.println("onComplete")
    );

// Output:
// onNext:    1
// onNext:    2
// onNext:    3
// onNext:    4
// onNext:    5
// onComplete`}</code></pre>
          </div>
        </div>

        <div className="section" id="cold-hot">
          <h2 className="section-title">Cold vs Hot Publishers</h2>
          <div className="step-content">
            <p><strong>Cold publishers</strong> (the default) start producing data fresh for each new subscriber — like a streaming service that starts a movie from the beginning for each viewer. <code>Mono.just()</code>, <code>Flux.fromIterable()</code>, and database query results are cold.</p>
            <p><strong>Hot publishers</strong> are live streams. They emit data regardless of whether anyone is subscribed — like a live broadcast. A new subscriber only receives items emitted after they subscribed. Examples: <code>Flux.interval()</code>, Sinks, WebSocket frames.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Hot publisher with Sinks.Many</span>
            </div>
            <pre><code>{`// Create a hot publisher (a multicast sink)
Sinks.Many<String> sink = Sinks.many().multicast().onBackpressureBuffer();
Flux<String> hotFlux = sink.asFlux();

// Subscriber 1 subscribes before any items are emitted
hotFlux.subscribe(s -> System.out.println("Sub1: " + s));

sink.tryEmitNext("A");  // Sub1 receives "A"
sink.tryEmitNext("B");  // Sub1 receives "B"

// Subscriber 2 joins AFTER "A" and "B" — it misses them
hotFlux.subscribe(s -> System.out.println("Sub2: " + s));
sink.tryEmitNext("C");  // Both Sub1 and Sub2 receive "C"`}</code></pre>
          </div>
        </div>

        <div className="section" id="combining">
          <h2 className="section-title">Combining Publishers</h2>
          <table className="dep-table">
            <thead>
              <tr><th>Operator</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><span className="dep-name">Mono.zip(m1, m2)</span></td><td>Waits for both Monos to complete, then combines their results</td></tr>
              <tr><td><span className="dep-name">Flux.merge(f1, f2)</span></td><td>Merges multiple Fluxes, items interleaved as they arrive</td></tr>
              <tr><td><span className="dep-name">Flux.concat(f1, f2)</span></td><td>Subscribes to f2 only after f1 completes (ordered)</td></tr>
              <tr><td><span className="dep-name">Flux.combineLatest(f1, f2, fn)</span></td><td>Combines latest values from each Flux when any emits</td></tr>
              <tr><td><span className="dep-name">flux.zipWith(other)</span></td><td>Pairs each item from this Flux with the corresponding item from other</td></tr>
            </tbody>
          </table>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Combining two Monos with zip</span>
            </div>
            <pre><code>{`Mono<User> userMono = userRepository.findById(1L);
Mono<Account> accountMono = accountRepository.findByUserId(1L);

// Both queries run in PARALLEL, then combine when both complete
Mono<UserWithAccount> combined = Mono.zip(userMono, accountMono)
    .map(tuple -> new UserWithAccount(tuple.getT1(), tuple.getT2()));`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
