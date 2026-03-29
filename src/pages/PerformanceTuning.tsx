import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/performance-tuning-monitoring-and-metrics-in-spring-webflux';

export default function PerformanceTuning() {
  return (
    <>
      <SEO
        title="Performance Tuning, Monitoring and Metrics in Spring WebFlux"
        description="Optimize Spring WebFlux applications: Micrometer metrics, Actuator endpoints, Prometheus scraping, BlockHound for blocking code detection, Reactor operator metrics, and Netty tuning."
        path={PATH}
        keywords="Spring WebFlux performance, BlockHound, Micrometer metrics, Prometheus WebFlux, Reactor metrics, Netty tuning"
      />
      <PageLayout
        breadcrumb="Advanced Topics"
        title="Performance Tuning, Monitoring and Metrics in Spring WebFlux"
        description="A reactive application can achieve high throughput, but only if blocking code is absent and the event loop is configured correctly. This chapter covers monitoring with Micrometer and Actuator, publishing metrics to Prometheus, detecting blocking calls with BlockHound, and tuning Netty's thread pool."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="24 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#actuator">Spring Boot Actuator Setup</a></li>
            <li><a href="#micrometer">Micrometer Metrics</a></li>
            <li><a href="#prometheus">Prometheus Integration</a></li>
            <li><a href="#timed">@Timed Annotation</a></li>
            <li><a href="#reactor-metrics">Reactor Operator Metrics</a></li>
            <li><a href="#blockhound">BlockHound — Detecting Blocking Calls</a></li>
            <li><a href="#netty-tuning">Netty Thread Pool Tuning</a></li>
            <li><a href="#schedulers">Reactor Schedulers and Offloading</a></li>
            <li><a href="#profiling">Profiling and Heap Analysis</a></li>
          </ol>
        </div>

        {/* Actuator */}
        <div className="section" id="actuator">
          <h2 className="section-title">Spring Boot Actuator Setup</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml — Actuator + Prometheus</span>
            </div>
            <pre><code>{`<!-- Spring Boot Actuator -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- Micrometer Prometheus registry -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
    <scope>runtime</scope>
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">Expose actuator endpoints</span>
            </div>
            <pre><code>{`management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,loggers,env
      base-path: /actuator
  endpoint:
    health:
      show-details: always
    prometheus:
      enabled: true
  metrics:
    tags:
      application: \${spring.application.name}
      environment: \${spring.profiles.active:default}`}</code></pre>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Secure Actuator endpoints in production</div>
              Never expose <code>/actuator/env</code> or <code>/actuator/heapdump</code> publicly.
              Use Spring Security to restrict access:
              <code>.pathMatchers("/actuator/**").hasRole("ACTUATOR_ADMIN")</code>
            </div>
          </div>
        </div>

        {/* Micrometer */}
        <div className="section" id="micrometer">
          <h2 className="section-title">Micrometer Metrics</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Custom metrics with MeterRegistry</span>
            </div>
            <pre><code>{`@Service
public class OrderService {

    private final Counter ordersCreatedCounter;
    private final Counter ordersFailedCounter;
    private final Timer orderProcessingTimer;
    private final AtomicInteger pendingOrdersGauge;

    public OrderService(MeterRegistry registry) {
        this.ordersCreatedCounter = Counter.builder("orders.created")
            .description("Total orders created")
            .tag("region", "eu-west")
            .register(registry);

        this.ordersFailedCounter = Counter.builder("orders.failed")
            .description("Total orders that failed")
            .register(registry);

        this.orderProcessingTimer = Timer.builder("orders.processing.duration")
            .description("Time to process an order")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);

        this.pendingOrdersGauge = registry.gauge("orders.pending",
            new AtomicInteger(0));
    }

    public Mono<OrderResponse> createOrder(CreateOrderRequest request) {
        pendingOrdersGauge.incrementAndGet();

        return Timer.Sample.start()
            .flatMap(sample -> processOrder(request)
                .doOnSuccess(r -> {
                    ordersCreatedCounter.increment();
                    sample.stop(orderProcessingTimer);
                })
                .doOnError(e -> {
                    ordersFailedCounter.increment();
                    sample.stop(orderProcessingTimer);
                })
                .doFinally(signal -> pendingOrdersGauge.decrementAndGet()));
    }
}`}</code></pre>
          </div>
        </div>

        {/* Prometheus */}
        <div className="section" id="prometheus">
          <h2 className="section-title">Prometheus Integration</h2>
          <div className="step-content">
            <p>
              Once the <code>micrometer-registry-prometheus</code> dependency is on the classpath, the
              <code> /actuator/prometheus</code> endpoint exposes all metrics in Prometheus text format.
              Configure your Prometheus server to scrape it.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">prometheus.yml — scrape config</span>
            </div>
            <pre><code>{`scrape_configs:
  - job_name: spring-webflux-app
    metrics_path: /actuator/prometheus
    static_configs:
      - targets: ['localhost:8080']
    scrape_interval: 15s`}</code></pre>
          </div>
          <div className="step-content">
            <p>Useful Prometheus queries for a WebFlux application:</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">promql</span>
              <span className="code-block-filename">Useful PromQL queries</span>
            </div>
            <pre><code>{`# Request rate per second (by URI)
rate(http_server_requests_seconds_count[1m])

# 99th percentile response time
http_server_requests_seconds{quantile="0.99"}

# Currently active connections (Netty)
reactor_netty_http_server_connections_active

# JVM memory used
jvm_memory_used_bytes{area="heap"}

# Event loop tasks (should be low — means backpressure is working)
reactor_netty_eventloop_pending_tasks`}</code></pre>
          </div>
        </div>

        {/* Timed */}
        <div className="section" id="timed">
          <h2 className="section-title">@Timed Annotation</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">@Timed on controllers and services</span>
            </div>
            <pre><code>{`// Enable @Timed on reactive methods — requires the AspectJ interceptor
@Bean
public TimedAspect timedAspect(MeterRegistry registry) {
    return new TimedAspect(registry);
}

// Apply @Timed to controller or service methods
@RestController
public class ProductController {

    @Timed(value = "product.get", description = "Time to get a product",
           percentiles = {0.5, 0.95, 0.99})
    @GetMapping("/api/products/{id}")
    public Mono<ProductResponse> getProduct(@PathVariable String id) {
        return productService.findById(id).map(ProductResponse::from);
    }
}`}</code></pre>
          </div>
        </div>

        {/* Reactor Metrics */}
        <div className="section" id="reactor-metrics">
          <h2 className="section-title">Reactor Operator Metrics</h2>
          <div className="step-content">
            <p>
              Reactor 3.5+ integrates with Micrometer via the <code>.metrics()</code> operator.
              It records queue size, latency between operators, and more.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Reactor operator metrics</span>
            </div>
            <pre><code>{`// Enable Micrometer integration globally
Schedulers.enableMetrics();

// Add .metrics() to a specific chain — it names the segment
public Flux<Product> findAll() {
    return productRepository.findAll()
        .name("product.repository.findAll")   // Metric name
        .tag("layer", "repository")           // Additional tag
        .metrics()                            // Activate recording
        .map(ProductResponse::from)
        .name("product.mapping")
        .metrics();
}`}</code></pre>
          </div>
        </div>

        {/* BlockHound */}
        <div className="section" id="blockhound">
          <h2 className="section-title">BlockHound — Detecting Blocking Calls</h2>
          <div className="step-content">
            <p>
              BlockHound is a Java agent that detects blocking calls (e.g., <code>Thread.sleep()</code>,
              <code> JDBC queries</code>) made from Reactor's non-blocking threads. It should be enabled
              in tests and development, NOT in production.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">BlockHound dependency</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>io.projectreactor.tools</groupId>
    <artifactId>blockhound</artifactId>
    <version>1.0.9.RELEASE</version>
    <scope>test</scope>   <!-- Only in tests / dev -->
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Enabling BlockHound</span>
            </div>
            <pre><code>{`// Install it early in the application lifecycle
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        BlockHound.install();   // BEFORE SpringApplication.run()
        SpringApplication.run(Application.class, args);
    }
}

// Or just in tests
@BeforeAll
static void setupBlockHound() {
    BlockHound.install();
}

// Allow specific well-known blocking calls that are safe (e.g., file reads on startup)
BlockHound.builder()
    .allowBlockingCallsInside("com.zaxxer.hikari.pool.HikariPool", "getConnection")
    .install();

// What BlockHound catches (throws BlockingOperationError):
Flux.just("hello")
    .flatMap(s -> {
        Thread.sleep(100);   // ← BlockHound catches this!
        return Mono.just(s.toUpperCase());
    })
    .subscribe();`}</code></pre>
          </div>
        </div>

        {/* Netty Tuning */}
        <div className="section" id="netty-tuning">
          <h2 className="section-title">Netty Thread Pool Tuning</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Custom Netty server configuration</span>
            </div>
            <pre><code>{`@Configuration
public class NettyConfig {

    @Bean
    public ReactiveWebServerFactory reactiveWebServerFactory() {
        NettyReactiveWebServerFactory factory = new NettyReactiveWebServerFactory();

        factory.addServerCustomizers(server -> server
            // Worker threads: default = 2 × CPU cores
            // Increase if you have CPU-bound work mixed in
            .runOn(LoopResources.create("http-server",
                Runtime.getRuntime().availableProcessors() * 2,
                true))

            // Request timeout
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)

            // Keep alive
            .childOption(ChannelOption.SO_KEEPALIVE, true)

            // Enabled HTTP/2
            .protocol(HttpProtocol.H2C, HttpProtocol.HTTP11)

            // Connection pool
            .maxKeepAliveRequests(1000)
        );

        return factory;
    }
}`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">Netty settings via application.yml</span>
            </div>
            <pre><code>{`server:
  port: 8080
  http2:
    enabled: true
  netty:
    connection-timeout: 5000ms
    idle-timeout: 60s
    max-keep-alive-requests: 1000
  compression:
    enabled: true
    mime-types: application/json,text/plain
    min-response-size: 2KB`}</code></pre>
          </div>
        </div>

        {/* Schedulers */}
        <div className="section" id="schedulers">
          <h2 className="section-title">Reactor Schedulers and Offloading</h2>
          <div className="step-content">
            <p>
              When you must perform a blocking operation (legacy code, synchronous drivers),
              offload it to a bounded elastic scheduler — never block the event loop.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Offloading blocking work to bounded elastic</span>
            </div>
            <pre><code>{`// WRONG — blocks the Netty event loop thread
public Mono<String> badExample() {
    return Mono.just(slowBlockingMethod());   // DON'T DO THIS
}

// CORRECT — wrap blocking call in Mono.fromCallable and subscribeOn
public Mono<String> goodExample() {
    return Mono.fromCallable(this::slowBlockingMethod)
        .subscribeOn(Schedulers.boundedElastic());  // Runs on a separate thread pool
}

// For Flux
public Flux<String> goodFluxExample() {
    return Flux.fromIterable(slowBlockingListMethod())
        .subscribeOn(Schedulers.boundedElastic());
}

// Custom bounded elastic with explicit limits
Scheduler customScheduler = Schedulers.newBoundedElastic(
    50,        // Max thread pool size
    1000,      // Max queued tasks
    "my-blocking-pool",
    300,       // TTL seconds for idle threads
    true       // Daemon threads
);`}</code></pre>
          </div>
          <div className="info-box tip">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">publishOn vs subscribeOn</div>
              <code>subscribeOn</code> affects where the subscription starts (where the source data
              is produced). <code>publishOn</code> shifts thread for downstream operators. For
              blocking I/O, use <code>subscribeOn(Schedulers.boundedElastic())</code>. For
              CPU-intensive computation, use <code>publishOn(Schedulers.parallel())</code>.
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
