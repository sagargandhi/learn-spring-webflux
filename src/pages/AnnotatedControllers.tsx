import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/building-rest-apis-with-annotated-controllers-in-spring-webflux';

export default function AnnotatedControllers() {
  return (
    <>
      <SEO
        title="Building REST APIs with Annotated Controllers in Spring WebFlux"
        description="Learn how to build reactive REST APIs using familiar Spring MVC annotations (@RestController, @GetMapping, @PostMapping) in a Spring WebFlux application, returning Mono and Flux from handler methods."
        path={PATH}
        keywords="Spring WebFlux controller, @RestController, @GetMapping, Mono, Flux REST API, reactive controller"
      />
      <PageLayout
        breadcrumb="Building REST APIs"
        title="Building REST APIs with Annotated Controllers in Spring WebFlux"
        description="Spring WebFlux supports the same @RestController, @GetMapping, and @RequestBody annotations you know from Spring MVC — but now your handler methods return reactive types. This chapter covers everything from basic CRUD endpoints to response streaming."
        badge={{ text: 'Intermediate', level: 'intermediate' }}
        readTime="24 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#setup">Controller Setup &amp; Dependencies</a></li>
            <li><a href="#basic-endpoints">Basic CRUD Endpoints</a></li>
            <li><a href="#path-query">Path Variables &amp; Query Params</a></li>
            <li><a href="#request-body">Reading the Request Body</a></li>
            <li><a href="#response-entity">ResponseEntity with Reactive Types</a></li>
            <li><a href="#streaming">Streaming Responses with Flux</a></li>
            <li><a href="#server-sent-events">Server-Sent Events from a Controller</a></li>
            <li><a href="#cors">CORS Configuration</a></li>
            <li><a href="#differences">WebFlux vs Spring MVC — Key Differences</a></li>
          </ol>
        </div>

        {/* Setup */}
        <div className="section" id="setup">
          <h2 className="section-title">Controller Setup &amp; Dependencies</h2>
          <div className="step-content">
            <p>Annotated controllers in Spring WebFlux require only the <code>spring-boot-starter-webflux</code> dependency — no additional setup needed. The necessary annotations are in the same packages as Spring MVC.</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml — webflux starter</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>

<!-- For validation (@Valid, @NotNull, etc.) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>`}</code></pre>
          </div>
        </div>

        {/* Basic Endpoints */}
        <div className="section" id="basic-endpoints">
          <h2 className="section-title">Basic CRUD Endpoints</h2>
          <div className="step-content">
            <p>
              The controller class looks identical to a Spring MVC controller. The only difference is the
              return type — instead of <code>User</code> you return <code>Mono&lt;User&gt;</code>, and
              instead of <code>List&lt;User&gt;</code> you return <code>Flux&lt;User&gt;</code>.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">UserController.java</span>
            </div>
            <pre><code>{`package com.example.webfluxdemo.controller;

import com.example.webfluxdemo.model.User;
import com.example.webfluxdemo.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users — return all users
    @GetMapping
    public Flux<User> getAllUsers() {
        return userService.findAll();
    }

    // GET /api/users/{id} — return a single user
    @GetMapping("/{id}")
    public Mono<User> getUserById(@PathVariable Long id) {
        return userService.findById(id);
    }

    // POST /api/users — create a new user
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<User> createUser(@RequestBody @Valid User user) {
        return userService.save(user);
    }

    // PUT /api/users/{id} — update a user
    @PutMapping("/{id}")
    public Mono<User> updateUser(@PathVariable Long id, @RequestBody @Valid User user) {
        return userService.update(id, user);
    }

    // DELETE /api/users/{id} — delete a user
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteUser(@PathVariable Long id) {
        return userService.delete(id);
    }
}`}</code></pre>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Mono&lt;Void&gt; for no-content responses</div>
              DELETE endpoints should return <code>Mono&lt;Void&gt;</code> to signal to the framework that
              no response body will be written. Spring WebFlux correctly sets the HTTP status to 204 No Content.
            </div>
          </div>
        </div>

        {/* Path Variables & Query Params */}
        <div className="section" id="path-query">
          <h2 className="section-title">Path Variables &amp; Query Params</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Path variables and query parameters</span>
            </div>
            <pre><code>{`// GET /api/products/electronics/42
@GetMapping("/{category}/{productId}")
public Mono<Product> getProduct(
    @PathVariable String category,
    @PathVariable Long productId) {
    return productService.findByCategoryAndId(category, productId);
}

// GET /api/users?page=0&size=20&sort=name
@GetMapping
public Flux<User> getUsers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "id") String sort) {
    return userService.findAll(PageRequest.of(page, size, Sort.by(sort)));
}

// GET /api/search?q=john
@GetMapping("/search")
public Flux<User> searchUsers(@RequestParam String q) {
    return userService.search(q);
}`}</code></pre>
          </div>
        </div>

        {/* Request Body */}
        <div className="section" id="request-body">
          <h2 className="section-title">Reading the Request Body</h2>
          <div className="step-content">
            <p>
              Use <code>@RequestBody</code> to deserialize JSON. Spring WebFlux reads the body
              asynchronously and wraps the result in a <code>Mono</code>. You can also accept a
              <code> Mono&lt;T&gt;</code> directly as the parameter — useful for streaming request bodies.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Request body variants</span>
            </div>
            <pre><code>{`// Standard: Spring reads body and hands you the deserialized object
@PostMapping
public Mono<Order> createOrder(@RequestBody @Valid CreateOrderRequest request) {
    return orderService.create(request);
}

// Reactive: accept Mono<T> — useful when you want to pipeline the body
@PostMapping("/bulk")
public Flux<User> createBulk(@RequestBody Flux<User> users) {
    return users.flatMap(userService::save);
}

// Multipart form data (file upload)
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Mono<String> uploadFile(@RequestPart("file") FilePart file) {
    return fileStorageService.store(file)
        .map(path -> "Uploaded to: " + path);
}`}</code></pre>
          </div>
        </div>

        {/* ResponseEntity */}
        <div className="section" id="response-entity">
          <h2 className="section-title">ResponseEntity with Reactive Types</h2>
          <div className="step-content">
            <p>
              When you need to control HTTP status codes and headers dynamically (e.g., return 201 with
              a <code>Location</code> header), return <code>Mono&lt;ResponseEntity&lt;T&gt;&gt;</code>.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">ResponseEntity examples</span>
            </div>
            <pre><code>{`// Return 201 Created with Location header
@PostMapping
public Mono<ResponseEntity<User>> createUser(@RequestBody @Valid User user) {
    return userService.save(user)
        .map(saved -> ResponseEntity
            .created(URI.create("/api/users/" + saved.getId()))
            .body(saved));
}

// Return 200 or 404
@GetMapping("/{id}")
public Mono<ResponseEntity<User>> getUserById(@PathVariable Long id) {
    return userService.findById(id)
        .map(ResponseEntity::ok)
        .defaultIfEmpty(ResponseEntity.notFound().build());
}

// Custom headers
@GetMapping("/export")
public Mono<ResponseEntity<Flux<byte[]>>> exportData() {
    Flux<byte[]> data = reportService.generateCsvBytes();
    return Mono.just(ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.csv")
        .contentType(MediaType.TEXT_PLAIN)
        .body(data));
}`}</code></pre>
          </div>
        </div>

        {/* Streaming */}
        <div className="section" id="streaming">
          <h2 className="section-title">Streaming Responses with Flux</h2>
          <div className="step-content">
            <p>
              When your endpoint returns a <code>Flux&lt;T&gt;</code> and the client requests
              <code> application/x-ndjson</code> (Newline Delimited JSON) or <code>text/event-stream</code>,
              WebFlux will stream each item as it becomes available rather than waiting for all items.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Streaming NDJSON endpoint</span>
            </div>
            <pre><code>{`// Each User is written to the response as JSON newline-delimited
// when the client sends: Accept: application/x-ndjson
@GetMapping(value = "/stream", produces = MediaType.APPLICATION_NDJSON_VALUE)
public Flux<User> streamUsers() {
    return userService.findAll();  // emits users one by one
}

// Test with curl:
// curl -H "Accept: application/x-ndjson" http://localhost:8080/api/users/stream`}</code></pre>
          </div>
        </div>

        {/* SSE */}
        <div className="section" id="server-sent-events">
          <h2 className="section-title">Server-Sent Events from a Controller</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">SSE endpoint</span>
            </div>
            <pre><code>{`@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> streamEvents() {
    return Flux.interval(Duration.ofSeconds(1))
        .map(seq -> ServerSentEvent.<String>builder()
            .id(String.valueOf(seq))
            .event("tick")
            .data("Server time: " + Instant.now())
            .build());
}`}</code></pre>
          </div>
        </div>

        {/* CORS */}
        <div className="section" id="cors">
          <h2 className="section-title">CORS Configuration</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Global CORS via WebFluxConfigurer</span>
            </div>
            <pre><code>{`@Configuration
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://myfrontend.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}

// Per-controller annotation
@CrossOrigin(origins = "https://myfrontend.com")
@RestController
@RequestMapping("/api/users")
public class UserController { ... }`}</code></pre>
          </div>
        </div>

        {/* Differences */}
        <div className="section" id="differences">
          <h2 className="section-title">WebFlux vs Spring MVC — Key Differences</h2>
          <table className="dep-table">
            <thead>
              <tr><th>Aspect</th><th>Spring MVC</th><th>Spring WebFlux</th></tr>
            </thead>
            <tbody>
              <tr><td>Return type</td><td><code>User</code>, <code>List&lt;User&gt;</code></td><td><code>Mono&lt;User&gt;</code>, <code>Flux&lt;User&gt;</code></td></tr>
              <tr><td>Exception handling</td><td><code>@ExceptionHandler</code></td><td><code>@ExceptionHandler</code> on <code>@ControllerAdvice</code> returning Mono</td></tr>
              <tr><td>Blocking calls</td><td>Allowed (thread pool)</td><td>Must use <code>publishOn(boundedElastic)</code></td></tr>
              <tr><td>ThreadLocal</td><td>Works naturally</td><td>Use Reactor <code>Context</code> instead</td></tr>
              <tr><td>Server default</td><td>Tomcat (servlet)</td><td>Netty (non-blocking)</td></tr>
              <tr><td>HTTP client</td><td>RestTemplate / RestClient</td><td>WebClient (reactive)</td></tr>
            </tbody>
          </table>
        </div>
      </PageLayout>
    </>
  );
}
