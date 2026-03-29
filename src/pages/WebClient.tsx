import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/using-webclient-for-reactive-http-calls-in-spring-webflux';

export default function WebClient() {
  return (
    <>
      <SEO
        title="Using WebClient for Reactive HTTP Calls in Spring WebFlux"
        description="Master Spring's WebClient: builder configuration, GET/POST/PUT/DELETE, error handling with onStatus, retry and timeout strategies, exchange filters for logging, and load-balanced calls with Spring Cloud."
        path={PATH}
        keywords="WebClient Spring, reactive HTTP client, WebClient builder, onStatus error handling, WebClient retry, ExchangeFilterFunction"
      />
      <PageLayout
        breadcrumb="Advanced Topics"
        title="Using WebClient for Reactive HTTP Calls in Spring WebFlux"
        description="WebClient is Spring's non-blocking, reactive HTTP client — the successor to the deprecated RestTemplate. This chapter covers building and configuring WebClient, making all types of HTTP requests, handling errors reactively, adding retry/timeout strategies, and calling load-balanced services."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="25 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#overview">WebClient vs RestTemplate</a></li>
            <li><a href="#setup">Creating and Configuring WebClient</a></li>
            <li><a href="#get">GET Requests</a></li>
            <li><a href="#post">POST Requests</a></li>
            <li><a href="#put-patch-delete">PUT, PATCH, DELETE</a></li>
            <li><a href="#error-handling">Error Handling with onStatus</a></li>
            <li><a href="#retry-timeout">Retry and Timeout</a></li>
            <li><a href="#filters">ExchangeFilterFunction (Logging)</a></li>
            <li><a href="#exchange-vs-retrieve">exchange() vs retrieve()</a></li>
            <li><a href="#load-balancer">Load Balancing with Spring Cloud</a></li>
          </ol>
        </div>

        {/* Overview */}
        <div className="section" id="overview">
          <h2 className="section-title">WebClient vs RestTemplate</h2>
          <table className="dep-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>RestTemplate</th>
                <th>WebClient</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Execution model</td>
                <td>Blocking (thread-per-request)</td>
                <td>Non-blocking (event loop)</td>
              </tr>
              <tr>
                <td>Return type</td>
                <td>T (direct value)</td>
                <td>Mono&lt;T&gt; / Flux&lt;T&gt;</td>
              </tr>
              <tr>
                <td>Status</td>
                <td>Deprecated (Spring 5.3)</td>
                <td>Recommended</td>
              </tr>
              <tr>
                <td>Use in WebFlux</td>
                <td>Will block the event loop</td>
                <td>Works correctly</td>
              </tr>
              <tr>
                <td>Use in MVC</td>
                <td>Native</td>
                <td>Fully supported</td>
              </tr>
            </tbody>
          </table>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Never use RestTemplate inside WebFlux</div>
              Calling a blocking <code>RestTemplate</code> method from a reactive chain will block a Netty
              event-loop thread, destroying throughput and potentially causing deadlocks.
              Always use <code>WebClient</code> in WebFlux applications.
            </div>
          </div>
        </div>

        {/* Setup */}
        <div className="section" id="setup">
          <h2 className="section-title">Creating and Configuring WebClient</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">WebClientConfig.java</span>
            </div>
            <pre><code>{`@Configuration
public class WebClientConfig {

    // Simple WebClient with base URL
    @Bean
    public WebClient productServiceClient() {
        return WebClient.builder()
            .baseUrl("https://api.example.com")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    // WebClient with custom Netty HttpClient (timeouts, connection pool)
    @Bean
    public WebClient httpClientWebClient() {
        HttpClient httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
            .responseTimeout(Duration.ofSeconds(10))
            .doOnConnected(conn ->
                conn.addHandlerLast(new ReadTimeoutHandler(10, TimeUnit.SECONDS))
                    .addHandlerLast(new WriteTimeoutHandler(10, TimeUnit.SECONDS)));

        return WebClient.builder()
            .baseUrl("https://api.example.com")
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            // Increase default memory limit for response bodies (default 256 KB)
            .codecs(config -> config.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
            .build();
    }
}`}</code></pre>
          </div>
        </div>

        {/* GET */}
        <div className="section" id="get">
          <h2 className="section-title">GET Requests</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">GET — single item and list</span>
            </div>
            <pre><code>{`// --- Single item (Mono) ---
public Mono<Product> findById(String id) {
    return webClient.get()
        .uri("/products/{id}", id)
        .retrieve()
        .bodyToMono(Product.class);
}

// --- List (Flux) ---
public Flux<Product> findAll() {
    return webClient.get()
        .uri("/products")
        .retrieve()
        .bodyToFlux(Product.class);
}

// --- Query parameters ---
public Flux<Product> search(String category, double maxPrice) {
    return webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/products")
            .queryParam("category", category)
            .queryParam("maxPrice", maxPrice)
            .build())
        .retrieve()
        .bodyToFlux(Product.class);
}

// --- Custom headers per request ---
public Mono<UserProfile> getProfile(String token) {
    return webClient.get()
        .uri("/me")
        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
        .retrieve()
        .bodyToMono(UserProfile.class);
}`}</code></pre>
          </div>
        </div>

        {/* POST */}
        <div className="section" id="post">
          <h2 className="section-title">POST Requests</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">POST with request body</span>
            </div>
            <pre><code>{`// --- POST with a plain object body ---
public Mono<OrderResponse> createOrder(CreateOrderRequest request) {
    return webClient.post()
        .uri("/orders")
        .bodyValue(request)   // Serialized to JSON automatically
        .retrieve()
        .bodyToMono(OrderResponse.class);
}

// --- POST with a Mono body (streaming) ---
public Mono<OrderResponse> createOrderFromMono(Mono<CreateOrderRequest> requestMono) {
    return webClient.post()
        .uri("/orders")
        .body(requestMono, CreateOrderRequest.class)
        .retrieve()
        .bodyToMono(OrderResponse.class);
}

// --- POST form data (multipart) ---
public Mono<Void> uploadFile(FilePart filePart) {
    MultipartBodyBuilder builder = new MultipartBodyBuilder();
    builder.asyncPart("file", filePart.content(), DataBuffer.class)
        .filename(filePart.filename());

    return webClient.post()
        .uri("/files/upload")
        .contentType(MediaType.MULTIPART_FORM_DATA)
        .body(BodyInserters.fromMultipartData(builder.build()))
        .retrieve()
        .toBodilessEntity()
        .then();
}`}</code></pre>
          </div>
        </div>

        {/* Error Handling */}
        <div className="section" id="error-handling">
          <h2 className="section-title">Error Handling with onStatus</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Error handling strategies</span>
            </div>
            <pre><code>{`public Mono<Product> findById(String id) {
    return webClient.get()
        .uri("/products/{id}", id)
        .retrieve()

        // Map specific HTTP status codes to domain exceptions
        .onStatus(HttpStatusCode::is4xxClientError, response -> {
            if (response.statusCode() == HttpStatus.NOT_FOUND) {
                return Mono.error(new ProductNotFoundException(id));
            }
            return response.bodyToMono(ErrorResponse.class)
                .flatMap(err -> Mono.error(new BadRequestException(err.message())));
        })
        .onStatus(HttpStatusCode::is5xxServerError, response ->
            response.bodyToMono(String.class)
                .flatMap(body -> Mono.error(new RemoteServiceException("Upstream error: " + body))))

        .bodyToMono(Product.class)

        // Optional: additional reactive error handling
        .onErrorMap(WebClientRequestException.class,
            ex -> new ServiceUnavailableException("Product service is down", ex));
}

// Global error handling via default for all calls from this client
WebClient.builder()
    .filter(ExchangeFilterFunction.ofResponseProcessor(response -> {
        if (response.statusCode().isError()) {
            return response.bodyToMono(String.class)
                .flatMap(body -> Mono.error(new RemoteServiceException(body)));
        }
        return Mono.just(response);
    }))
    .build();`}</code></pre>
          </div>
        </div>

        {/* Retry + Timeout */}
        <div className="section" id="retry-timeout">
          <h2 className="section-title">Retry and Timeout</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Retry with exponential backoff and timeout</span>
            </div>
            <pre><code>{`public Mono<Product> findByIdWithResilience(String id) {
    return webClient.get()
        .uri("/products/{id}", id)
        .retrieve()
        .bodyToMono(Product.class)

        // Timeout: if no response within 5 seconds, error
        .timeout(Duration.ofSeconds(5))

        // Retry: up to 3 attempts, exponential backoff (1s, 2s, 4s), only on server errors
        .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
            .maxBackoff(Duration.ofSeconds(10))
            .filter(ex -> ex instanceof RemoteServiceException  // only retry on 5xx
                          || ex instanceof java.net.ConnectException)
            .onRetryExhaustedThrow((spec, signal) ->
                new ServiceUnavailableException("Upstream service unavailable after retries")))

        // Fallback: return a default/cached value when all retries fail
        .onErrorReturn(ServiceUnavailableException.class, Product.defaultProduct());
}`}</code></pre>
          </div>
        </div>

        {/* Filters */}
        <div className="section" id="filters">
          <h2 className="section-title">ExchangeFilterFunction (Logging)</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Request/response logging filter</span>
            </div>
            <pre><code>{`private static ExchangeFilterFunction logRequest() {
    return ExchangeFilterFunction.ofRequestProcessor(request -> {
        log.info("Request: {} {}", request.method(), request.url());
        request.headers().forEach((name, values) ->
            values.forEach(value -> log.debug("Header: {}={}", name, value)));
        return Mono.just(request);
    });
}

private static ExchangeFilterFunction logResponse() {
    return ExchangeFilterFunction.ofResponseProcessor(response -> {
        log.info("Response status: {}", response.statusCode());
        return Mono.just(response);
    });
}

// Authentication token injector — add the token only if present
private ExchangeFilterFunction bearerTokenFilter(Supplier<String> tokenSupplier) {
    return ExchangeFilterFunction.ofRequestProcessor(request -> {
        String token = tokenSupplier.get();
        if (token != null) {
            return Mono.just(ClientRequest.from(request)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build());
        }
        return Mono.just(request);
    });
}

// Apply when building WebClient
WebClient.builder()
    .filter(logRequest())
    .filter(logResponse())
    .filter(bearerTokenFilter(this::getCurrentToken))
    .build();`}</code></pre>
          </div>
        </div>

        {/* Load Balancer */}
        <div className="section" id="load-balancer">
          <h2 className="section-title">Load Balancing with Spring Cloud</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml — Spring Cloud LoadBalancer</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
<!-- Also required: service discovery, e.g. Eureka -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Load-balanced WebClient</span>
            </div>
            <pre><code>{`// Annotate the bean builder with @LoadBalanced
@Bean
@LoadBalanced
public WebClient.Builder loadBalancedWebClientBuilder() {
    return WebClient.builder();
}

// Use the service name (from Eureka/Consul) as the host — LoadBalancer resolves it
@Service
public class OrderService {

    private final WebClient webClient;

    public OrderService(@LoadBalanced WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://product-service").build();
    }

    public Mono<Product> getProduct(String id) {
        return webClient.get()
            .uri("/api/products/{id}", id)
            .retrieve()
            .bodyToMono(Product.class);
        // Requests are round-robin distributed across all "product-service" instances
    }
}`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
