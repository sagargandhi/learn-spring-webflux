import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/reactive-microservices-patterns-with-spring-cloud-and-webflux';

export default function ReactiveMicroservices() {
  return (
    <>
      <SEO
        title="Reactive Microservices Patterns with Spring Cloud and WebFlux"
        description="Build resilient reactive microservices: Spring Cloud Gateway routing, Resilience4j circuit breaker, Eureka service discovery, WebClient load balancing, and distributed tracing with Micrometer and Zipkin."
        path={PATH}
        keywords="Spring Cloud Gateway WebFlux, Circuit Breaker reactive, Resilience4j, Eureka WebFlux, Micrometer tracing reactive microservices"
      />
      <PageLayout
        breadcrumb="Advanced Topics"
        title="Reactive Microservices Patterns with Spring Cloud and WebFlux"
        description="Spring Cloud and Spring WebFlux form a powerful combination for building reactive microservice architectures. This chapter covers reactive API gateway routing, circuit breakers, service discovery, distributed tracing, and event-driven communication with Kafka."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="30 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#overview">Reactive Microservices Overview</a></li>
            <li><a href="#gateway">Spring Cloud Gateway (Reactive)</a></li>
            <li><a href="#circuit-breaker">Circuit Breaker with Resilience4j</a></li>
            <li><a href="#service-discovery">Service Discovery with Eureka</a></li>
            <li><a href="#webclient-lb">WebClient with Load Balancer</a></li>
            <li><a href="#tracing">Distributed Tracing with Micrometer + Zipkin</a></li>
            <li><a href="#kafka">Reactive Kafka with Spring Kafka</a></li>
            <li><a href="#reactor-kafka">Reactor Kafka (reactor-kafka)</a></li>
          </ol>
        </div>

        {/* Overview */}
        <div className="section" id="overview">
          <h2 className="section-title">Reactive Microservices Overview</h2>
          <div className="step-content">
            <p>
              In a reactive microservices architecture, components communicate asynchronously.
              Inter-service HTTP calls are made with <code>WebClient</code>, the API gateway uses
              Spring Cloud Gateway (built on Netty + WebFlux), and circuit breakers prevent
              cascading failures. Additionally, event-driven communication via Kafka enables
              fully non-blocking service interaction.
            </p>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Spring Cloud BOM</div>
              Manage all Spring Cloud dependency versions with the BOM:
              <pre style={{marginTop: '0.5rem'}}>
{`<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>2023.0.3</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Gateway */}
        <div className="section" id="gateway">
          <h2 className="section-title">Spring Cloud Gateway (Reactive)</h2>
          <div className="step-content">
            <p>
              Spring Cloud Gateway is built on Spring WebFlux and Netty. It provides dynamic routing,
              protocol translation, rate limiting, and a rich filter chain — all reactive.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">Gateway dependency</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
    <!-- Do NOT add spring-boot-starter-web — Gateway uses WebFlux internally -->
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">Gateway routes in application.yml</span>
            </div>
            <pre><code>{`spring:
  cloud:
    gateway:
      routes:
        - id: product-service
          uri: lb://product-service         # lb:// = Spring Cloud LoadBalancer
          predicates:
            - Path=/api/products/**
          filters:
            - StripPrefix=1                 # Remove /api prefix before forwarding
            - AddRequestHeader=X-Source, gateway
            - CircuitBreaker=name=productCB,fallbackUri=forward:/fallback/product

        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
            - Method=GET,POST
          filters:
            - RewritePath=/api/orders/(?<segment>.*), /orders/\${segment}
            - RequestRateLimiter=redis-rate-limiter.replenishRate=10,\
              redis-rate-limiter.burstCapacity=20`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Programmatic route definition</span>
            </div>
            <pre><code>{`@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("product-service", r -> r
                .path("/api/products/**")
                .filters(f -> f
                    .stripPrefix(1)
                    .addRequestHeader("X-Source", "gateway")
                    .circuitBreaker(c -> c
                        .setName("productCB")
                        .setFallbackUri("forward:/fallback/product")))
                .uri("lb://product-service"))
            .build();
    }

    // Fallback endpoint (returns degraded response when circuit is open)
    @RestController
    @RequestMapping("/fallback")
    public static class FallbackController {

        @GetMapping("/product")
        public Mono<Map<String, String>> productFallback() {
            return Mono.just(Map.of(
                "message", "Product service is temporarily unavailable",
                "status", "degraded"
            ));
        }
    }
}`}</code></pre>
          </div>
        </div>

        {/* Circuit Breaker */}
        <div className="section" id="circuit-breaker">
          <h2 className="section-title">Circuit Breaker with Resilience4j</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">Resilience4j dependency</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">Resilience4j config in application.yml</span>
            </div>
            <pre><code>{`resilience4j:
  circuitbreaker:
    instances:
      productCB:
        sliding-window-size: 10
        minimum-number-of-calls: 5
        failure-rate-threshold: 50       # Open after 50% failures
        wait-duration-in-open-state: 10s
        permitted-number-of-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true

  retry:
    instances:
      productRetry:
        max-attempts: 3
        wait-duration: 500ms
        retry-exceptions:
          - java.net.ConnectException
          - feign.FeignException$ServiceUnavailable`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Reactive circuit breaker usage</span>
            </div>
            <pre><code>{`@Service
public class ProductService {

    private final WebClient webClient;
    private final ReactiveCircuitBreakerFactory cbFactory;

    public Mono<Product> findById(String id) {
        ReactiveCircuitBreaker cb = cbFactory.create("productCB");

        Mono<Product> remoteCall = webClient.get()
            .uri("/products/{id}", id)
            .retrieve()
            .bodyToMono(Product.class);

        return cb.run(remoteCall, throwable -> {
            log.warn("Circuit breaker triggered: {}", throwable.getMessage());
            return Mono.just(Product.unavailable());  // fallback
        });
    }
}`}</code></pre>
          </div>
        </div>

        {/* Tracing */}
        <div className="section" id="tracing">
          <h2 className="section-title">Distributed Tracing with Micrometer + Zipkin</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">Micrometer tracing dependencies</span>
            </div>
            <pre><code>{`<!-- Micrometer tracing bridge for Brave (Zipkin) -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>

<!-- Zipkin reporter -->
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>

<!-- Spring Boot Actuator for /actuator/info, /actuator/trace etc. -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">Tracing configuration</span>
            </div>
            <pre><code>{`management:
  tracing:
    sampling:
      probability: 1.0   # 1.0 = trace all requests (use 0.1 in production)
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans

spring:
  application:
    name: product-service  # Shows in Zipkin UI`}</code></pre>
          </div>
        </div>

        {/* Kafka */}
        <div className="section" id="kafka">
          <h2 className="section-title">Reactive Kafka with Spring Kafka</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">reactor-kafka dependency</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>io.projectreactor.kafka</groupId>
    <artifactId>reactor-kafka</artifactId>
    <version>1.3.22</version>
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Reactive Kafka producer and consumer</span>
            </div>
            <pre><code>{`// --- Reactive Kafka Producer ---
@Service
public class OrderEventProducer {

    private final KafkaSender<String, OrderEvent> sender;

    public OrderEventProducer() {
        SenderOptions<String, OrderEvent> options = SenderOptions
            .<String, OrderEvent>create(Map.of(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092",
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class,
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class));
        this.sender = KafkaSender.create(options);
    }

    public Mono<Void> publishOrderCreated(OrderEvent event) {
        SenderRecord<String, OrderEvent, String> record =
            SenderRecord.create("order-events", null, null,
                event.orderId(), event, event.orderId());

        return sender.send(Mono.just(record)).then();
    }
}

// --- Reactive Kafka Consumer ---
@Service
public class OrderEventConsumer {

    @PostConstruct
    public void startConsuming() {
        ReceiverOptions<String, OrderEvent> options = ReceiverOptions
            .<String, OrderEvent>create(Map.of(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092",
                ConsumerConfig.GROUP_ID_CONFIG, "order-processor",
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class,
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class))
            .subscription(Collections.singleton("order-events"));

        KafkaReceiver.create(options)
            .receive()
            .flatMap(record -> processOrder(record.value())
                .doOnSuccess(v -> record.receiverOffset().acknowledge()))
            .subscribe();
    }

    private Mono<Void> processOrder(OrderEvent event) {
        // ... process asynchronously
        return Mono.empty();
    }
}`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
