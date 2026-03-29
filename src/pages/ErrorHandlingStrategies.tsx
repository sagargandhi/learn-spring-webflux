import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/error-handling-strategies-in-reactive-spring-webflux';

export default function ErrorHandlingStrategies() {
  return (
    <>
      <SEO
        title="Error Handling Strategies in Reactive Spring WebFlux"
        description="Learn every error-handling operator in Project Reactor and Spring WebFlux: onErrorReturn, onErrorResume, retry, retryWhen, @ExceptionHandler, and global error handling."
        path={PATH}
        keywords="error handling WebFlux, onErrorResume, onErrorReturn, retry, retryWhen, WebExceptionHandler"
      />
      <PageLayout
        breadcrumb="Core Concepts"
        title="Error Handling Strategies in Reactive Spring WebFlux"
        description="A practical guide to every error-handling technique in Project Reactor and Spring WebFlux — from in-pipeline operators to global exception handlers and custom error responses."
        badge={{ text: 'Intermediate', level: 'intermediate' }}
        readTime="20 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#error-signals">Understanding Error Signals</a></li>
            <li><a href="#onerror-return">onErrorReturn — fallback value</a></li>
            <li><a href="#onerror-resume">onErrorResume — fallback publisher</a></li>
            <li><a href="#onerror-map">onErrorMap — translate errors</a></li>
            <li><a href="#retry">retry and retryWhen</a></li>
            <li><a href="#exception-handler">@ExceptionHandler in Controllers</a></li>
            <li><a href="#global-handler">Global Error Handling</a></li>
            <li><a href="#problem-details">RFC 9457 Problem Details</a></li>
          </ol>
        </div>

        <div className="section" id="error-signals">
          <h2 className="section-title">How Errors Work in Reactive Streams</h2>
          <div className="step-content">
            <p>In reactive streams, an error ends the stream immediately — nothing more will be delivered after it. Instead of wrapping code in a try-catch block, you handle errors by adding an error-handling step to your chain of operators.</p>
            <p>If you don't handle an error, it bubbles up to the subscriber and shows as a stack trace. Always handle errors explicitly in production code.</p>
          </div>
        </div>

        <div className="section" id="onerror-return">
          <h2 className="section-title">onErrorReturn — Fallback Value</h2>
          <div className="step-content">
            <p>Return a static fallback value when an error occurs. The pipeline completes normally after the fallback is emitted.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
            </div>
            <pre><code>{`// Return a default value on ANY error
Mono<User> user = userRepository.findById(id)
    .onErrorReturn(User.ANONYMOUS);

// Return a default value ONLY for a specific exception type
Mono<Product> product = productService.findById(productId)
    .onErrorReturn(NotFoundException.class, Product.EMPTY);

// Match by predicate
Mono<String> result = callExternalApi()
    .onErrorReturn(e -> e.getMessage().contains("timeout"), "default");`}</code></pre>
          </div>
        </div>

        <div className="section" id="onerror-resume">
          <h2 className="section-title">onErrorResume — Fallback Publisher</h2>
          <div className="step-content">
            <p>Switch to a different Publisher when an error occurs. More powerful than <code>onErrorReturn</code> because the fallback can be another async operation.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
            </div>
            <pre><code>{`// On error, try fetching from cache
Mono<Product> product = productService.findFromDatabase(id)
    .onErrorResume(DataAccessException.class, ex -> {
        log.warn("DB unavailable, serving from cache: {}", ex.getMessage());
        return cacheService.findById(id);
    });

// On 404, return empty
Mono<User> user = webClient.get()
    .uri("/users/{id}", id)
    .retrieve()
    .bodyToMono(User.class)
    .onErrorResume(WebClientResponseException.NotFound.class, ex -> Mono.empty());`}</code></pre>
          </div>
        </div>

        <div className="section" id="onerror-map">
          <h2 className="section-title">onErrorMap — Translate Errors</h2>
          <div className="step-content">
            <p>Transform one exception type into another. Useful for mapping low-level exceptions (SQL, HTTP) into domain exceptions.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
            </div>
            <pre><code>{`Mono<Order> order = orderRepository.findById(id)
    .onErrorMap(R2dbcDataIntegrityViolationException.class,
                ex -> new ConflictException("Order already exists: " + id))
    .onErrorMap(R2dbcTimeoutException.class,
                ex -> new ServiceUnavailableException("Database timeout"));`}</code></pre>
          </div>
        </div>

        <div className="section" id="retry">
          <h2 className="section-title">retry and retryWhen</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">retry with exponential backoff</span>
            </div>
            <pre><code>{`// Simple: retry up to 3 times immediately
Mono<String> result = callExternalService()
    .retry(3);

// Advanced: exponential backoff with jitter
Mono<String> withBackoff = callExternalService()
    .retryWhen(Retry.backoff(3, Duration.ofMillis(500))
        .maxBackoff(Duration.ofSeconds(5))
        .jitter(0.5)                            // ±50% jitter to avoid thundering herd
        .filter(ex -> ex instanceof IOException) // only retry on IOException
        .onRetryExhaustedThrow((spec, signal) ->
            new ServiceUnavailableException("Service unavailable after 3 retries")));`}</code></pre>
          </div>
          <div className="info-box tip">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">Always add jitter to retry backoff</div>
              Without jitter, all retrying clients wake up at the same time and hammer the recovering service together — this is the "thundering herd" problem. Jitter randomises the retry timing.
            </div>
          </div>
        </div>

        <div className="section" id="exception-handler">
          <h2 className="section-title">@ExceptionHandler in Controllers</h2>
          <div className="step-content">
            <p>Use <code>@ExceptionHandler</code> inside a <code>@RestControllerAdvice</code> class to handle exceptions thrown by your reactive controllers and return meaningful HTTP error responses.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">GlobalExceptionHandler.java</span>
            </div>
            <pre><code>{`@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Mono<ErrorResponse> handleNotFound(NotFoundException ex) {
        return Mono.just(new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            Instant.now()
        ));
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Mono<ErrorResponse> handleValidation(ValidationException ex) {
        return Mono.just(new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            Instant.now()
        ));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Mono<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return Mono.just(new ErrorResponse(500, "Internal Server Error", Instant.now()));
    }
}`}</code></pre>
          </div>
        </div>

        <div className="section" id="global-handler">
          <h2 className="section-title">Global Error Handling with WebExceptionHandler</h2>
          <div className="step-content">
            <p>For errors that occur outside the controller layer (e.g., in filters or router functions), implement <code>WebExceptionHandler</code>:</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">CustomWebExceptionHandler.java</span>
            </div>
            <pre><code>{`@Component
@Order(-2)  // Run before the default Spring WebFlux error handler (order -1)
public class CustomWebExceptionHandler implements WebExceptionHandler {

    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();

        ErrorResponse errorResponse;
        if (ex instanceof NotFoundException) {
            response.setStatusCode(HttpStatus.NOT_FOUND);
            errorResponse = new ErrorResponse(404, ex.getMessage(), Instant.now());
        } else if (ex instanceof UnauthorizedException) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            errorResponse = new ErrorResponse(401, "Unauthorized", Instant.now());
        } else {
            response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
            errorResponse = new ErrorResponse(500, "Internal Server Error", Instant.now());
        }

        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}`}</code></pre>
          </div>
        </div>

        <div className="section" id="problem-details">
          <h2 className="section-title">RFC 9457 Problem Details</h2>
          <div className="step-content">
            <p>Spring Framework 6+ supports the <a href="https://www.rfc-editor.org/rfc/rfc9457" target="_blank" rel="noreferrer">RFC 9457 Problem Details</a> standard for machine-readable HTTP error responses. Enable it with one property:</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">application.yml</span>
            </div>
            <pre><code>{`spring:
  webflux:
    problemdetails:
      enabled: true`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">json</span>
              <span className="code-block-filename">Example problem details response</span>
            </div>
            <pre><code>{`{
  "type": "https://example.com/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "User with id 42 was not found",
  "instance": "/api/users/42"
}`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
