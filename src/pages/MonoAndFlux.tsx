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
            <li><a href="#publisher">Publishers in Reactive Streams</a></li>
            <li><a href="#mono">Mono — 0 or 1 Item</a></li>
            <li><a href="#flux">Flux — 0 to N Items</a></li>
            <li><a href="#creating">Creating Mono and Flux</a></li>
            <li><a href="#subscribing">The Subscription Lifecycle</a></li>
            <li><a href="#cold-hot">Cold vs Hot Publishers</a></li>
            <li><a href="#combining">Combining Publishers</a></li>
          </ol>
        </div>

        <div className="section" id="publisher">
          <h2 className="section-title">How Mono and Flux Work</h2>
          <div className="step-content">
            <p>Both <code>Mono</code> and <code>Flux</code> describe a stream of data. The key thing to understand is that they are <strong>lazy</strong> — they do nothing until something subscribes to them.</p>
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
