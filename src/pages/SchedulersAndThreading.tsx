import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/schedulers-and-the-threading-model-in-spring-webflux';

export default function SchedulersAndThreading() {
  return (
    <>
      <SEO
        title="Schedulers and the Threading Model in Spring WebFlux"
        description="Learn how Project Reactor Schedulers work, the difference between publishOn and subscribeOn, and how to safely call blocking code from a reactive pipeline."
        path={PATH}
        keywords="Reactor Schedulers, publishOn, subscribeOn, blocking code in WebFlux, boundedElastic, parallel scheduler"
      />
      <PageLayout
        breadcrumb="Core Concepts"
        title="Schedulers and the Threading Model in Spring WebFlux"
        description="Understand how Project Reactor decides which thread executes which part of your pipeline, what the built-in Schedulers are, and the critical rules for mixing blocking and non-blocking code."
        badge={{ text: 'Intermediate', level: 'intermediate' }}
        readTime="18 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#event-loop">The Netty Event Loop</a></li>
            <li><a href="#schedulers">Built-in Schedulers</a></li>
            <li><a href="#publishon">publishOn — switch execution thread</a></li>
            <li><a href="#subscribeon">subscribeOn — switch subscription thread</a></li>
            <li><a href="#blocking">Calling Blocking Code Safely</a></li>
            <li><a href="#blocking-detector">BlockHound — the Blocking Code Detector</a></li>
          </ol>
        </div>

        <div className="section" id="event-loop">
          <h2 className="section-title">The Netty Event Loop</h2>
          <div className="step-content">
            <p>By default, Spring WebFlux uses Netty as its embedded server. Netty creates a small pool of <strong>event loop threads</strong> — typically one per CPU core. These threads do all the work: accepting connections, reading request bytes, executing your handlers, and writing response bytes.</p>
            <p>The golden rule:</p>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">🚨</span>
            <div className="info-box-content">
              <div className="info-box-title">Never block an event loop thread</div>
              Calling any blocking operation (JDBC, <code>Thread.sleep()</code>, blocking file I/O, <code>CompletableFuture.get()</code>) on an event loop thread stalls ALL requests being served by that thread. This eliminates the entire benefit of WebFlux.
            </div>
          </div>
        </div>

        <div className="section" id="schedulers">
          <h2 className="section-title">Built-in Schedulers</h2>
          <table className="dep-table">
            <thead>
              <tr><th>Scheduler</th><th>Thread Pool</th><th>Use Case</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="dep-name">Schedulers.parallel()</span></td>
                <td>Fixed (CPU count)</td>
                <td>CPU-bound work, non-blocking computations</td>
              </tr>
              <tr>
                <td><span className="dep-name">Schedulers.boundedElastic()</span></td>
                <td>Elastic, bounded (10× CPU by default)</td>
                <td>Wrapping blocking I/O calls safely</td>
              </tr>
              <tr>
                <td><span className="dep-name">Schedulers.single()</span></td>
                <td>Single thread</td>
                <td>Ordered, single-threaded processing</td>
              </tr>
              <tr>
                <td><span className="dep-name">Schedulers.immediate()</span></td>
                <td>Caller thread</td>
                <td>No scheduler switch — execute on current thread</td>
              </tr>
              <tr>
                <td><span className="dep-name">Schedulers.fromExecutor(exec)</span></td>
                <td>Custom Executor</td>
                <td>Bring your own thread pool</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section" id="publishon">
          <h2 className="section-title">publishOn — Switch the Execution Thread</h2>
          <div className="step-content">
            <p><code>publishOn(Scheduler)</code> affects everything <strong>downstream</strong> of the operator. All operators placed after it will execute on the specified Scheduler's thread.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">publishOn example</span>
            </div>
            <pre><code>{`Flux.range(1, 5)
    .map(n -> {
        // Runs on main/event-loop thread
        System.out.println("Before publishOn: " + Thread.currentThread().getName());
        return n;
    })
    .publishOn(Schedulers.parallel())   // <-- switch point
    .map(n -> {
        // Now runs on parallel-N thread
        System.out.println("After publishOn: " + Thread.currentThread().getName());
        return n * 2;
    })
    .subscribe(System.out::println);`}</code></pre>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Multiple publishOn calls are valid</div>
              You can chain multiple <code>publishOn</code> calls to switch threads at different points in the pipeline. This is useful when some steps are CPU-bound and others are I/O-bound.
            </div>
          </div>
        </div>

        <div className="section" id="subscribeon">
          <h2 className="section-title">subscribeOn — Switch the Subscription Thread</h2>
          <div className="step-content">
            <p><code>subscribeOn(Scheduler)</code> affects the thread on which the <em>source</em> of the pipeline executes — regardless of where you place it in the chain. Use it to move the origin of data production to a different thread. Only one <code>subscribeOn</code> is effective per pipeline (the first one wins).</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">subscribeOn example</span>
            </div>
            <pre><code>{`// This Mono.fromCallable wraps blocking JDBC
Mono<List<User>> users = Mono.fromCallable(() -> jdbcTemplate.query(...))
    .subscribeOn(Schedulers.boundedElastic());  // run the JDBC call on boundedElastic

// The JDBC query will execute on boundedElastic, not on the Netty event loop
users.subscribe(list -> System.out.println("Got " + list.size() + " users"));`}</code></pre>
          </div>
          <div className="info-box tip">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">publishOn vs subscribeOn — key difference</div>
              Think of <code>publishOn</code> as "from this point onwards, use this thread" and <code>subscribeOn</code> as "run the source on this thread". For wrapping blocking calls, always use <code>subscribeOn(Schedulers.boundedElastic())</code>.
            </div>
          </div>
        </div>

        <div className="section" id="blocking">
          <h2 className="section-title">Calling Blocking Code Safely</h2>
          <div className="step-content">
            <p>Sometimes you have no choice but to call blocking code (legacy JDBC, synchronous SDK, etc.). The correct pattern is to wrap it in <code>Mono.fromCallable()</code> or <code>Mono.fromSupplier()</code> and execute it on <code>Schedulers.boundedElastic()</code>:</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Safe blocking wrapper</span>
            </div>
            <pre><code>{`@Service
public class UserService {

    private final JdbcTemplate jdbc;  // blocking JDBC

    public Mono<User> findUserById(Long id) {
        return Mono.fromCallable(() -> {
                    // This is blocking — runs on boundedElastic thread
                    return jdbc.queryForObject(
                        "SELECT * FROM users WHERE id = ?",
                        userRowMapper, id);
                })
                .subscribeOn(Schedulers.boundedElastic())
                // Switch back to a parallel thread for downstream operators
                .publishOn(Schedulers.parallel());
    }
}`}</code></pre>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">boundedElastic is not unlimited</div>
              By default, <code>Schedulers.boundedElastic()</code> allows a maximum of <code>10 × CPU_count</code> threads with a queue of up to 100,000 tasks. If you have a high-traffic service wrapping blocking code, consider using R2DBC or an async driver instead.
            </div>
          </div>
        </div>

        <div className="section" id="blocking-detector">
          <h2 className="section-title">BlockHound — the Blocking Code Detector</h2>
          <div className="step-content">
            <p>BlockHound is a Java agent that throws an exception whenever blocking code is called from a non-blocking thread. Add it to your project for development and CI to catch blocking violations early.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml — add BlockHound</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>io.projectreactor.tools</groupId>
    <artifactId>blockhound</artifactId>
    <version>1.0.9.RELEASE</version>
    <!-- Use 'test' scope for test-only detection,
         or no scope to enable in all environments -->
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Install BlockHound in your main class</span>
            </div>
            <pre><code>{`@SpringBootApplication
public class WebfluxDemoApplication {
    public static void main(String[] args) {
        // Install BEFORE SpringApplication.run()
        BlockHound.install();
        SpringApplication.run(WebfluxDemoApplication.class, args);
    }
}
// Now if you accidentally call Thread.sleep() on a Netty thread,
// you will get: BlockingOperationError: Blocking call! java.lang.Thread#sleep`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
