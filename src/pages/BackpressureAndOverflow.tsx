import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/backpressure-and-overflow-handling-in-reactive-streams';

export default function BackpressureAndOverflow() {
  return (
    <>
      <SEO
        title="Backpressure and Overflow Handling in Reactive Streams"
        description="Understand how Reactive Streams backpressure protocol works, what happens when a producer is faster than a consumer, and how to handle overflow with onBackpressureBuffer, onBackpressureDrop, and onBackpressureLatest."
        path={PATH}
        keywords="backpressure, reactive streams, overflow, onBackpressureBuffer, onBackpressureDrop, Project Reactor"
      />
      <PageLayout
        breadcrumb="Core Concepts"
        title="Backpressure and Overflow Handling in Reactive Streams"
        description="One of the most important — and most misunderstood — concepts in reactive programming. Learn exactly how the Reactive Streams backpressure contract works, what happens when it breaks down, and the strategies available to handle overflow gracefully."
        badge={{ text: 'Intermediate', level: 'intermediate' }}
        readTime="22 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#what-is-backpressure">What is Backpressure?</a></li>
            <li><a href="#the-contract">The Reactive Streams Contract</a></li>
            <li><a href="#demand-signaling">Demand Signaling with request(n)</a></li>
            <li><a href="#overflow-strategies">Overflow Strategies</a></li>
            <li><a href="#buffer">onBackpressureBuffer</a></li>
            <li><a href="#drop">onBackpressureDrop</a></li>
            <li><a href="#latest">onBackpressureLatest</a></li>
            <li><a href="#error">onBackpressureError</a></li>
            <li><a href="#limitrate">limitRate — Controlling Fetch Size</a></li>
            <li><a href="#hot-cold">Backpressure in Hot vs Cold Publishers</a></li>
            <li><a href="#common-mistakes">Common Backpressure Mistakes</a></li>
          </ol>
        </div>

        {/* Section 1 */}
        <div className="section" id="what-is-backpressure">
          <h2 className="section-title">What is Backpressure?</h2>
          <div className="step-content">
            <p>
              <strong>Backpressure</strong> is the mechanism by which a <em>consumer</em> signals to a
              <em> producer</em> how much data it is ready to receive. Without it, a fast producer
              can overwhelm a slow consumer, causing unbounded memory growth and eventually an
              <code> OutOfMemoryError</code>.
            </p>
            <p>
              Think of a garden hose connected to a fire hydrant. Without a way to reduce the flow rate,
              the hose bursts. Backpressure is the valve that lets the hose control how much water comes through.
            </p>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Backpressure is built into Reactive Streams from the start</div>
              Unlike older reactive libraries that had to bolt on backpressure support later, this
              feature was designed in from day one. Every part of the system — producer, consumer,
              and the connection between them — all participate in flow control.
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="section" id="the-contract">
          <h2 className="section-title">The Reactive Streams Rules</h2>
          <div className="step-content">
            <p>The Reactive Streams standard defines four building blocks:</p>
            <ul>
              <li><code>Publisher&lt;T&gt;</code> — produces items when asked.</li>
              <li><code>Subscriber&lt;T&gt;</code> — receives items and tells the producer how many it wants.</li>
              <li><code>Subscription</code> — the connection between the two; used to request more items or cancel.</li>
              <li><code>Processor&lt;T,R&gt;</code> — sits in the middle, transforms items, then passes them on.</li>
            </ul>
            <p>The golden rule: <strong>a producer must never send more items than were asked for</strong>.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Reactive Streams interfaces (simplified)</span>
            </div>
            <pre><code>{`// The Reactive Streams spec (package org.reactivestreams)

public interface Publisher<T> {
    void subscribe(Subscriber<? super T> subscriber);
}

public interface Subscriber<T> {
    void onSubscribe(Subscription s);  // called once, gives you the subscription handle
    void onNext(T t);                  // called for each item (up to requested amount)
    void onError(Throwable t);         // terminal: error
    void onComplete();                 // terminal: done
}

public interface Subscription {
    void request(long n);   // signal demand — ask for n more items
    void cancel();          // cancel the subscription
}

// The protocol:
//  1. Publisher calls subscriber.onSubscribe(subscription)
//  2. Subscriber calls subscription.request(n) to signal demand
//  3. Publisher calls subscriber.onNext(item) up to n times
//  4. Subscriber calls request(n) again when ready for more
//  5. Publisher calls onComplete() or onError() to terminate`}</code></pre>
          </div>
        </div>

        {/* Section 3 */}
        <div className="section" id="demand-signaling">
          <h2 className="section-title">Demand Signaling with request(n)</h2>
          <div className="step-content">
            <p>
              When you call <code>subscribe()</code> on a Flux or Mono, a <code>Subscription</code> is created.
              The subscriber calls <code>subscription.request(n)</code> to tell the publisher it can handle
              <code> n</code> more items. Project Reactor handles this automatically, but you can override it.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Manual demand signaling</span>
            </div>
            <pre><code>{`// Default behavior: request(Long.MAX_VALUE) — unbounded
Flux.range(1, 1000)
    .subscribe(System.out::println);  // requests all 1000 at once

// Manual control with BaseSubscriber
Flux.range(1, 1000)
    .subscribe(new BaseSubscriber<Integer>() {
        @Override
        protected void hookOnSubscribe(Subscription subscription) {
            request(10);  // initially ask for 10 items
        }

        @Override
        protected void hookOnNext(Integer value) {
            System.out.println("Received: " + value);
            if (value % 10 == 0) {
                request(10);  // ask for 10 more every time we've processed 10
            }
        }
    });`}</code></pre>
          </div>
        </div>

        {/* Section 4 */}
        <div className="section" id="overflow-strategies">
          <h2 className="section-title">Overflow Strategies</h2>
          <div className="step-content">
            <p>
              When a producer emits items faster than a downstream subscriber requests them — which happens
              frequently with hot publishers (e.g., event streams) — you need an explicit overflow strategy.
              Project Reactor provides four operators for this.
            </p>
          </div>
          <table className="dep-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Strategy</th>
                <th>Data Loss?</th>
                <th>Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="dep-name">onBackpressureBuffer()</span></td>
                <td>Buffer excess items in memory</td>
                <td>No (until OOM)</td>
                <td>Spiky traffic with bounded peaks</td>
              </tr>
              <tr>
                <td><span className="dep-name">onBackpressureDrop()</span></td>
                <td>Silently drop excess items</td>
                <td>Yes</td>
                <td>Best-effort delivery (UI updates, metrics)</td>
              </tr>
              <tr>
                <td><span className="dep-name">onBackpressureLatest()</span></td>
                <td>Keep only the most recent excess item</td>
                <td>Yes</td>
                <td>Real-time data where only the latest matters</td>
              </tr>
              <tr>
                <td><span className="dep-name">onBackpressureError()</span></td>
                <td>Emit <code>OverflowException</code> on overflow</td>
                <td>No (terminates)</td>
                <td>Strict systems where overflow = bug</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 5 */}
        <div className="section" id="buffer">
          <h2 className="section-title">onBackpressureBuffer</h2>
          <div className="step-content">
            <p>
              Buffers items in an unbounded (or bounded) queue when the downstream cannot keep up.
              Unbounded buffering is the default and can cause an <code>OutOfMemoryError</code> under
              sustained load. Always prefer a bounded buffer with an overflow strategy.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">onBackpressureBuffer variants</span>
            </div>
            <pre><code>{`// Unbounded buffer (dangerous under sustained load)
Flux.interval(Duration.ofMillis(1))
    .onBackpressureBuffer()
    .publishOn(Schedulers.boundedElastic())
    .subscribe(i -> {
        Thread.sleep(10);  // slow consumer
        System.out.println(i);
    });

// Bounded buffer with DROP_OLDEST overflow strategy
Flux.interval(Duration.ofMillis(1))
    .onBackpressureBuffer(
        256,                    // max buffer size
        dropped -> log.warn("Dropped: {}", dropped),
        BufferOverflowStrategy.DROP_OLDEST   // or DROP_LATEST, ERROR
    )
    .publishOn(Schedulers.boundedElastic())
    .subscribe(System.out::println);`}</code></pre>
          </div>
        </div>

        {/* Section 6 */}
        <div className="section" id="drop">
          <h2 className="section-title">onBackpressureDrop</h2>
          <div className="step-content">
            <p>
              Silently discards items when the downstream hasn't requested any. You can supply a callback
              to log or count dropped items.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">onBackpressureDrop</span>
            </div>
            <pre><code>{`AtomicLong droppedCount = new AtomicLong();

Flux.interval(Duration.ofMillis(1))
    .onBackpressureDrop(dropped -> droppedCount.incrementAndGet())
    .publishOn(Schedulers.boundedElastic())
    .subscribe(i -> {
        sleepMillis(50);   // very slow consumer
        System.out.println("Processed: " + i + " | Dropped: " + droppedCount.get());
    });`}</code></pre>
          </div>
        </div>

        {/* Section 7 */}
        <div className="section" id="latest">
          <h2 className="section-title">onBackpressureLatest</h2>
          <div className="step-content">
            <p>
              Keeps only the <strong>most recent</strong> item when the downstream is not ready. All
              intermediate items are discarded. Useful for sensor readings, stock prices, or UI state
              where you only care about the current value.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">onBackpressureLatest</span>
            </div>
            <pre><code>{`// Stock price feed — we only care about the latest price
Flux<StockPrice> priceFeed = stockPriceSource.asFlux()
    .onBackpressureLatest()
    .publishOn(Schedulers.boundedElastic());

priceFeed.subscribe(price -> {
    // May skip prices if we're slower than the feed,
    // but we always get the most recent one.
    updateDashboard(price);
});`}</code></pre>
          </div>
        </div>

        {/* Section 8 */}
        <div className="section" id="error">
          <h2 className="section-title">onBackpressureError</h2>
          <div className="step-content">
            <p>
              Terminates the stream with an <code>OverflowException</code> as soon as the downstream
              cannot keep up. This is the "fail-fast" strategy — useful in systems where overflow
              should never happen and indicates a programming error.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">onBackpressureError</span>
            </div>
            <pre><code>{`Flux.interval(Duration.ofMillis(1))
    .onBackpressureError()
    .publishOn(Schedulers.boundedElastic())
    .subscribe(
        i -> slowOperation(i),
        error -> log.error("Overflow: {}", error.getMessage())
        // → reactor.core.Exceptions$OverflowException: The receiver is overrun by its upstream
    );`}</code></pre>
          </div>
        </div>

        {/* Section 9 */}
        <div className="section" id="limitrate">
          <h2 className="section-title">limitRate — Controlling Fetch Size</h2>
          <div className="step-content">
            <p>
              <code>limitRate(n)</code> caps the maximum number of items requested upstream at a time.
              This is the primary way to implement cooperative backpressure in reactive pipelines without
              overflow operators, and is particularly useful when consuming from reactive repositories.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">limitRate usage</span>
            </div>
            <pre><code>{`// Without limitRate: subscriber requests Long.MAX_VALUE,
// and the repository might try to load all rows at once.
userRepository.findAll()
    .subscribe(this::processUser);

// With limitRate: subscriber fetches 100 rows at a time
// (then 75 as the low-tide mark triggers a prefetch)
userRepository.findAll()
    .limitRate(100)
    .subscribe(this::processUser);

// limitRate(highTide, lowTide)
// lowTide controls when a new request is sent upstream
// (refill when 75% consumed = 75 out of 100)
Flux.range(1, 10_000)
    .limitRate(100, 75)
    .subscribe(System.out::println);`}</code></pre>
          </div>
          <div className="info-box tip">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">limitRate vs limitRequest</div>
              <code>limitRate(n)</code> controls how many items are requested per batch (prefetch).
              <code> limitRequest(n)</code> caps the total number of items that will ever be requested —
              the stream completes after n items regardless of what the source has.
            </div>
          </div>
        </div>

        {/* Section 10 */}
        <div className="section" id="hot-cold">
          <h2 className="section-title">Backpressure in Hot vs Cold Publishers</h2>
          <div className="step-content">
            <p>
              <strong>Cold publishers</strong> (Flux.fromIterable, database queries) are backpressure-safe by
              nature — they only produce items when asked. <strong>Hot publishers</strong> (event buses, WebSocket
              messages, Kafka topics) emit regardless of downstream demand. This is where overflow strategies matter.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Converting hot to cold (with backpressure)</span>
            </div>
            <pre><code>{`// A hot source (e.g., Sinks.Many pushed externally)
Sinks.Many<String> hotSink = Sinks.many().multicast().onBackpressureBuffer(512);
Flux<String> hotFlux = hotSink.asFlux();

// Wrap it with an overflow strategy so slow subscribers are protected
hotFlux
    .onBackpressureBuffer(256, BufferOverflowStrategy.DROP_OLDEST)
    .publishOn(Schedulers.boundedElastic())
    .subscribe(msg -> {
        processMessage(msg);  // slow processing
    });

// Push messages from another thread
hotSink.tryEmitNext("event-1");
hotSink.tryEmitNext("event-2");`}</code></pre>
          </div>
        </div>

        {/* Section 11 */}
        <div className="section" id="common-mistakes">
          <h2 className="section-title">Common Backpressure Mistakes</h2>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Mistake 1: Ignoring backpressure entirely</div>
              Calling <code>subscribe()</code> with no overflow strategy on a high-throughput hot source
              defaults to <code>onBackpressureError()</code>. Under load, your stream will terminate with
              <code> OverflowException</code>. Always be explicit about your overflow strategy.
            </div>
          </div>
          <div className="info-box warning" style={{ marginTop: '0.75rem' }}>
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Mistake 2: Unbounded buffers in production</div>
              <code>onBackpressureBuffer()</code> without a size limit can consume all heap memory
              during traffic spikes. Always provide a maximum buffer size and a drop strategy.
            </div>
          </div>
          <div className="info-box warning" style={{ marginTop: '0.75rem' }}>
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Mistake 3: Blocking inside the pipeline</div>
              Blocking an event loop thread defeats backpressure — the thread can't process new requests
              signals while it's blocked. Always use <code>publishOn(Schedulers.boundedElastic())</code>
              before any blocking operation.
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
