import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/reactive-operators-map-flatmap-filter-zip-and-more';

export default function ReactiveOperators() {
  return (
    <>
      <SEO
        title="Reactive Operators — map, flatMap, filter, zip and More"
        description="Master the essential Project Reactor operators: map, flatMap, filter, zip, reduce, buffer, window, switchMap, concatMap and many more with detailed Java examples."
        path={PATH}
        keywords="reactive operators, flatMap, map, filter, Project Reactor operators, switchMap, concatMap"
      />
      <PageLayout
        breadcrumb="Core Concepts"
        title="Reactive Operators — map, flatMap, filter, zip and More"
        description="A comprehensive guide to the most important Project Reactor operators. Understanding these operators is essential for writing correct and efficient reactive pipelines."
        badge={{ text: 'Intermediate', level: 'intermediate' }}
        readTime="25 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#transform">Transformation Operators</a></li>
            <li><a href="#filter-ops">Filtering Operators</a></li>
            <li><a href="#flatmap">flatMap vs concatMap vs switchMap</a></li>
            <li><a href="#aggregation">Aggregation Operators</a></li>
            <li><a href="#side-effects">Side-Effect Operators</a></li>
            <li><a href="#time-ops">Time-Based Operators</a></li>
            <li><a href="#context">Context Propagation</a></li>
          </ol>
        </div>

        <div className="section" id="transform">
          <h2 className="section-title">Transformation Operators</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">map, cast, index, scan</span>
            </div>
            <pre><code>{`// map — synchronous 1-to-1 transformation (like Stream.map)
Flux.just(1, 2, 3, 4)
    .map(n -> n * n)
    .subscribe(System.out::println);  // 1, 4, 9, 16

// cast — unchecked cast of the element type
Flux<Object> objects = Flux.just("hello", "world");
Flux<String> strings = objects.cast(String.class);

// index — attach 0-based index to each element
Flux.just("a", "b", "c")
    .index()
    .subscribe(t -> System.out.println(t.getT1() + ": " + t.getT2()));
// 0: a,  1: b,  2: c

// scan — running aggregation (emits partial results)
Flux.range(1, 5)
    .scan(0, Integer::sum)
    .subscribe(System.out::println);  // 0, 1, 3, 6, 10, 15`}</code></pre>
          </div>
        </div>

        <div className="section" id="filter-ops">
          <h2 className="section-title">Filtering Operators</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">filter, take, skip, distinct, sample</span>
            </div>
            <pre><code>{`// filter — keep only matching items
Flux.range(1, 10)
    .filter(n -> n % 2 == 0)
    .subscribe(System.out::println);  // 2, 4, 6, 8, 10

// take — take only the first N items
Flux.range(1, 100).take(5);  // 1, 2, 3, 4, 5

// takeLast — take only the last N items
Flux.range(1, 100).takeLast(3);  // 98, 99, 100

// skip — skip the first N items
Flux.range(1, 10).skip(7);  // 8, 9, 10

// distinct — remove duplicates (uses equals/hashCode)
Flux.just(1, 2, 2, 3, 1, 4).distinct();  // 1, 2, 3, 4

// distinctUntilChanged — remove consecutive duplicates
Flux.just(1, 1, 2, 2, 3, 1).distinctUntilChanged();  // 1, 2, 3, 1

// first — emit only the first element, then complete
Flux.range(1, 10).next();  // Mono<Integer> with value 1

// single — assert there is exactly one element; error if 0 or >1
Flux.just(42).single();`}</code></pre>
          </div>
        </div>

        <div className="section" id="flatmap">
          <h2 className="section-title">flatMap vs concatMap vs switchMap</h2>
          <div className="step-content">
            <p>These three operators all accept a function that maps each element to a Publisher. They differ in how they handle concurrency and ordering:</p>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Never use map for async operations</div>
              If your mapping function returns a <code>Mono</code> or <code>Flux</code>, use <code>flatMap</code>, not <code>map</code>. Using <code>map</code> would give you a <code>Flux&lt;Mono&lt;T&gt;&gt;</code> — a stream of unwrapped publishers — which is almost certainly not what you want.
            </div>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">flatMap — concurrent, unordered</span>
            </div>
            <pre><code>{`// flatMap subscribes to inner publishers CONCURRENTLY.
// Items from inner publishers are merged as they arrive — ORDER IS NOT PRESERVED.
// Use when you want maximum throughput and don't care about ordering.
Flux.just("user1", "user2", "user3")
    .flatMap(userId -> fetchUserFromDatabase(userId))   // all 3 DB calls run in parallel
    .subscribe(System.out::println);`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">concatMap — sequential, ordered</span>
            </div>
            <pre><code>{`// concatMap subscribes to inner publishers ONE AT A TIME, in order.
// Slower than flatMap but guarantees ordering.
// Use when order matters or when inner operations must not overlap.
Flux.just("step1", "step2", "step3")
    .concatMap(step -> executeStep(step))  // step2 waits for step1 to complete
    .subscribe(System.out::println);`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">switchMap — cancel previous, use latest</span>
            </div>
            <pre><code>{`// switchMap cancels the PREVIOUS inner publisher when a new item arrives.
// Use for search-as-you-type: only care about results for the latest input.
searchTermFlux  // emits each keystroke
    .switchMap(term -> searchRepository.searchByTerm(term))
    .subscribe(results -> updateUI(results));
// If the user types quickly, only the last search's results are delivered`}</code></pre>
          </div>
          <table className="dep-table">
            <thead>
              <tr><th>Operator</th><th>Concurrency</th><th>Ordering</th><th>Best for</th></tr>
            </thead>
            <tbody>
              <tr><td><span className="dep-name">flatMap</span></td><td>Concurrent</td><td>Not preserved</td><td>Max throughput, independent ops</td></tr>
              <tr><td><span className="dep-name">concatMap</span></td><td>Sequential</td><td>Preserved</td><td>Ordered pipelines, dependent ops</td></tr>
              <tr><td><span className="dep-name">switchMap</span></td><td>Cancels prev</td><td>Latest only</td><td>Search/autocomplete, live data</td></tr>
              <tr><td><span className="dep-name">flatMapSequential</span></td><td>Concurrent</td><td>Preserved</td><td>Best of both (buffers out-of-order)</td></tr>
            </tbody>
          </table>
        </div>

        <div className="section" id="aggregation">
          <h2 className="section-title">Aggregation Operators</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">reduce, collectList, count, buffer, window</span>
            </div>
            <pre><code>{`// reduce — fold all items into one (returns Mono)
Mono<Integer> sum = Flux.range(1, 10)
    .reduce(0, Integer::sum);  // Mono<55>

// collectList — gather all items into a List (returns Mono<List<T>>)
Mono<List<String>> all = Flux.just("a", "b", "c").collectList();

// collectMap — gather into a Map
Mono<Map<String, Integer>> map = Flux.just("apple", "banana", "cherry")
    .collectMap(s -> s, String::length);

// count — count emitted items
Mono<Long> count = Flux.range(1, 100).count();  // Mono<100L>

// buffer — collect N items into a List, emit the List
Flux.range(1, 10)
    .buffer(3)
    .subscribe(System.out::println);
// [1, 2, 3], [4, 5, 6], [7, 8, 9], [10]

// window — create a Flux<Flux<T>> (sub-streams)
Flux.range(1, 10)
    .window(3)
    .flatMap(window -> window.collectList())
    .subscribe(System.out::println);`}</code></pre>
          </div>
        </div>

        <div className="section" id="side-effects">
          <h2 className="section-title">Side-Effect Operators</h2>
          <div className="step-content">
            <p>These operators let you "peek" at items or signals without modifying the stream. They are essential for logging, metrics, and debugging.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">doOn* operators</span>
            </div>
            <pre><code>{`Flux.range(1, 5)
    .doOnSubscribe(s  -> log.info("Subscribed"))
    .doOnNext(n       -> log.debug("Processing item: {}", n))
    .doOnError(e      -> log.error("Error: {}", e.getMessage()))
    .doOnComplete(()  -> log.info("All items processed"))
    .doFinally(signal -> log.info("Finished with signal: {}", signal))
    .map(n -> n * 2)
    .subscribe();`}</code></pre>
          </div>
        </div>

        <div className="section" id="time-ops">
          <h2 className="section-title">Time-Based Operators</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">delayElements, timeout, debounce, sample</span>
            </div>
            <pre><code>{`// delayElements — add delay between each item
Flux.range(1, 5)
    .delayElements(Duration.ofMillis(200));

// timeout — error if no item arrives within duration
Mono<User> result = fetchUser(id)
    .timeout(Duration.ofSeconds(5))
    .onErrorReturn(TimeoutException.class, User.ANONYMOUS);

// debounce — only emit if no new item arrives within duration (search box pattern)
searchTermFlux
    .debounce(Duration.ofMillis(300))
    .flatMap(term -> search(term));

// sample — emit the most recent item every N milliseconds
Flux.interval(Duration.ofMillis(100))
    .sample(Duration.ofMillis(500));  // emits ~5 values`}</code></pre>
          </div>
        </div>

        <div className="section" id="context">
          <h2 className="section-title">Context Propagation</h2>
          <div className="step-content">
            <p>In Spring WebFlux, there are no thread-local variables (since a single request may execute on many threads). Instead, Reactor provides <code>Context</code> — an immutable map that travels with the reactive pipeline.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Using Context for security / trace IDs</span>
            </div>
            <pre><code>{`// Write to context (downstream operations can read it)
Mono<String> result = Mono.deferContextual(ctx -> {
    String traceId = ctx.get("traceId");
    return processRequest(traceId);
}).contextWrite(Context.of("traceId", UUID.randomUUID().toString()));

// Spring Security uses Context under the hood for authentication
Mono<String> secureOp = ReactiveSecurityContextHolder.getContext()
    .map(ctx -> ctx.getAuthentication().getName())
    .flatMap(username -> service.doSomethingFor(username));`}</code></pre>
          </div>
          <div className="info-box tip">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">Spring Boot 3.2+ and Micrometer Observation</div>
              Spring Boot 3.2+ automatically propagates trace context (traceId, spanId) through reactive pipelines via Micrometer Observation. Enable it with <code>management.tracing.enabled=true</code>.
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
