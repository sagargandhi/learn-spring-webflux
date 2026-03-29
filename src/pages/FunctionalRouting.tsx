import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/functional-routing-and-handler-functions-in-spring-webflux';

export default function FunctionalRouting() {
  return (
    <>
      <SEO
        title="Functional Routing and Handler Functions in Spring WebFlux"
        description="Learn the functional programming model in Spring WebFlux using RouterFunction and HandlerFunction — an alternative to @RestController that offers more explicit control over routing and request handling."
        path={PATH}
        keywords="RouterFunction, HandlerFunction, functional routing, Spring WebFlux routes, ServerRequest, ServerResponse"
      />
      <PageLayout
        breadcrumb="Building REST APIs"
        title="Functional Routing and Handler Functions in Spring WebFlux"
        description="Spring WebFlux offers a purely functional alternative to annotations: RouterFunction defines routes, HandlerFunction handles requests. This model gives you explicit, composable, and testable routing logic without reflection or classpath scanning."
        badge={{ text: 'Intermediate', level: 'intermediate' }}
        readTime="22 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#overview">Overview of Functional Routing</a></li>
            <li><a href="#handler">Writing a HandlerFunction</a></li>
            <li><a href="#router">Defining Routes with RouterFunction</a></li>
            <li><a href="#reading-request">Reading Path, Query, and Body</a></li>
            <li><a href="#building-response">Building Responses</a></li>
            <li><a href="#composing">Composing Multiple Routers</a></li>
            <li><a href="#filters">Router-Level Filters</a></li>
            <li><a href="#testing">Testing Functional Routes</a></li>
            <li><a href="#vs-annotated">Functional vs Annotated — When to Use Which</a></li>
          </ol>
        </div>

        {/* Overview */}
        <div className="section" id="overview">
          <h2 className="section-title">Overview of Functional Routing</h2>
          <div className="step-content">
            <p>
              In the functional model, routing is done via two interfaces:
            </p>
            <ul>
              <li>
                <strong><code>HandlerFunction&lt;T&gt;</code></strong> — a function that takes a
                <code> ServerRequest</code> and returns a <code>Mono&lt;ServerResponse&gt;</code>.
                This is your request handler.
              </li>
              <li>
                <strong><code>RouterFunction&lt;T&gt;</code></strong> — maps a <code>RequestPredicate</code>
                (e.g., HTTP method + path) to a <code>HandlerFunction</code>. Think of it as a
                programmatic version of <code>@GetMapping</code>.
              </li>
            </ul>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Both models co-exist in the same application</div>
              You can mix annotated controllers and functional routes in the same Spring Boot application.
              They are handled by different layers of the WebFlux framework and do not conflict.
            </div>
          </div>
        </div>

        {/* HandlerFunction */}
        <div className="section" id="handler">
          <h2 className="section-title">Writing a HandlerFunction</h2>
          <div className="step-content">
            <p>
              Convention: group your handlers in a <code>*Handler</code> class annotated with
              <code> @Component</code>. Each method takes a <code>ServerRequest</code> and returns
              <code> Mono&lt;ServerResponse&gt;</code>.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">UserHandler.java</span>
            </div>
            <pre><code>{`package com.example.webfluxdemo.handler;

import com.example.webfluxdemo.model.User;
import com.example.webfluxdemo.service.UserService;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.server.ServerResponse.*;

@Component
public class UserHandler {

    private final UserService userService;

    public UserHandler(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users
    public Mono<ServerResponse> getAllUsers(ServerRequest request) {
        return ok()
            .contentType(APPLICATION_JSON)
            .body(userService.findAll(), User.class);
    }

    // GET /api/users/{id}
    public Mono<ServerResponse> getUserById(ServerRequest request) {
        Long id = Long.parseLong(request.pathVariable("id"));
        return userService.findById(id)
            .flatMap(user -> ok().contentType(APPLICATION_JSON).bodyValue(user))
            .switchIfEmpty(notFound().build());
    }

    // POST /api/users
    public Mono<ServerResponse> createUser(ServerRequest request) {
        return request.bodyToMono(User.class)
            .flatMap(userService::save)
            .flatMap(saved -> created(URI.create("/api/users/" + saved.getId()))
                .contentType(APPLICATION_JSON)
                .bodyValue(saved));
    }

    // DELETE /api/users/{id}
    public Mono<ServerResponse> deleteUser(ServerRequest request) {
        Long id = Long.parseLong(request.pathVariable("id"));
        return userService.delete(id)
            .then(noContent().build());
    }
}`}</code></pre>
          </div>
        </div>

        {/* RouterFunction */}
        <div className="section" id="router">
          <h2 className="section-title">Defining Routes with RouterFunction</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">UserRouter.java</span>
            </div>
            <pre><code>{`package com.example.webfluxdemo.router;

import com.example.webfluxdemo.handler.UserHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.RequestPredicates.*;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;

@Configuration
public class UserRouter {

    @Bean
    public RouterFunction<ServerResponse> userRoutes(UserHandler handler) {
        return route()
            .GET("/api/users", handler::getAllUsers)
            .GET("/api/users/{id}", handler::getUserById)
            .POST("/api/users", handler::createUser)
            .PUT("/api/users/{id}", handler::updateUser)
            .DELETE("/api/users/{id}", handler::deleteUser)
            .build();
    }
}`}</code></pre>
          </div>
        </div>

        {/* Reading requests */}
        <div className="section" id="reading-request">
          <h2 className="section-title">Reading Path, Query, and Body</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">ServerRequest — reading data</span>
            </div>
            <pre><code>{`// Path variable
String id = request.pathVariable("id");

// Optional query parameter
Optional<String> page = request.queryParam("page");
int pageNum = page.map(Integer::parseInt).orElse(0);

// Required query parameter (throws if missing)
MultiValueMap<String, String> params = request.queryParams();

// Deserialize JSON body to a Mono<T>
Mono<CreateOrderRequest> body = request.bodyToMono(CreateOrderRequest.class);

// Deserialize streaming JSON body to Flux<T>
Flux<Product> products = request.bodyToFlux(Product.class);

// Request headers
String authHeader = request.headers().firstHeader("Authorization");

// Principal (authenticated user)
Mono<Principal> principal = request.principal();`}</code></pre>
          </div>
        </div>

        {/* Building responses */}
        <div className="section" id="building-response">
          <h2 className="section-title">Building Responses</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">ServerResponse builder patterns</span>
            </div>
            <pre><code>{`// 200 OK with a single body
Mono<ServerResponse> response = ServerResponse.ok()
    .contentType(MediaType.APPLICATION_JSON)
    .bodyValue(user);                         // wraps in Mono internally

// 200 OK with Flux body (streams NDJSON)
ServerResponse.ok()
    .contentType(MediaType.APPLICATION_NDJSON)
    .body(userFlux, User.class);

// 201 Created with Location header
ServerResponse.created(URI.create("/api/users/" + id))
    .bodyValue(savedUser);

// 204 No Content
ServerResponse.noContent().build();

// 404 Not Found
Mono<ServerResponse> notFound = ServerResponse.notFound().build();

// Custom status
ServerResponse.status(HttpStatus.PARTIAL_CONTENT)
    .bodyValue(partialResult);

// With custom header
ServerResponse.ok()
    .header("X-Request-Id", requestId)
    .bodyValue(result);`}</code></pre>
          </div>
        </div>

        {/* Composing */}
        <div className="section" id="composing">
          <h2 className="section-title">Composing Multiple Routers</h2>
          <div className="step-content">
            <p>
              Register each resource's routes as a separate <code>@Bean</code> and combine them.
              Spring Boot auto-detects all <code>RouterFunction</code> beans and composes them.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Combining multiple RouterFunctions</span>
            </div>
            <pre><code>{`@Configuration
public class AppRouter {

    @Bean
    public RouterFunction<ServerResponse> routes(
            UserHandler userHandler,
            ProductHandler productHandler,
            OrderHandler orderHandler) {

        return RouterFunctions.route()
            // Nest /api/users
            .nest(RequestPredicates.path("/api/users"), builder -> builder
                .GET("", userHandler::getAllUsers)
                .GET("/{id}", userHandler::getUserById)
                .POST("", userHandler::createUser)
            )
            // Nest /api/products
            .nest(RequestPredicates.path("/api/products"), builder -> builder
                .GET("", productHandler::getAllProducts)
                .GET("/{id}", productHandler::getProductById)
            )
            // Nest /api/orders
            .nest(RequestPredicates.path("/api/orders"), builder -> builder
                .POST("", orderHandler::createOrder)
            )
            .build();
    }
}`}</code></pre>
          </div>
        </div>

        {/* Filters */}
        <div className="section" id="filters">
          <h2 className="section-title">Router-Level Filters</h2>
          <div className="step-content">
            <p>
              Use <code>.filter()</code> on a router to intercept all requests matched by that router —
              useful for logging, authentication checks, or request ID injection.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Router filter for logging</span>
            </div>
            <pre><code>{`@Bean
public RouterFunction<ServerResponse> userRoutes(UserHandler handler) {
    return route()
        .GET("/api/users", handler::getAllUsers)
        .GET("/api/users/{id}", handler::getUserById)
        .filter((request, next) -> {
            long start = System.currentTimeMillis();
            log.info("→ {} {}", request.method(), request.path());
            return next.handle(request)
                .doOnTerminate(() ->
                    log.info("← {} {} {}ms",
                        request.method(),
                        request.path(),
                        System.currentTimeMillis() - start));
        })
        .build();
}`}</code></pre>
          </div>
        </div>

        {/* Testing */}
        <div className="section" id="testing">
          <h2 className="section-title">Testing Functional Routes</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">UserRouterTest.java</span>
            </div>
            <pre><code>{`@WebFluxTest
class UserRouterTest {

    @Autowired
    private WebTestClient client;

    @MockBean
    private UserService userService;

    @Test
    void shouldReturnAllUsers() {
        when(userService.findAll())
            .thenReturn(Flux.just(new User(1L, "Alice"), new User(2L, "Bob")));

        client.get().uri("/api/users")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(User.class)
            .hasSize(2)
            .contains(new User(1L, "Alice"));
    }

    @Test
    void shouldReturn404WhenUserNotFound() {
        when(userService.findById(99L)).thenReturn(Mono.empty());

        client.get().uri("/api/users/99")
            .exchange()
            .expectStatus().isNotFound();
    }
}`}</code></pre>
          </div>
        </div>

        {/* vs Annotated */}
        <div className="section" id="vs-annotated">
          <h2 className="section-title">Functional vs Annotated — When to Use Which</h2>
          <table className="dep-table">
            <thead>
              <tr><th>Aspect</th><th>Annotated Controllers</th><th>Functional Routing</th></tr>
            </thead>
            <tbody>
              <tr><td>Learning curve</td><td>Low (familiar to Spring MVC devs)</td><td>Moderate</td></tr>
              <tr><td>Routing visibility</td><td>Scattered across controller classes</td><td>Centralised in router beans</td></tr>
              <tr><td>Composability</td><td>Limited — annotations only</td><td>High — programmatic, nestable</td></tr>
              <tr><td>Router-level filters</td><td>Use <code>WebFilter</code></td><td>Built-in <code>.filter()</code></td></tr>
              <tr><td>Team familiarity</td><td>Most Spring developers know it</td><td>Less common, may surprise newcomers</td></tr>
              <tr><td>Recommendation</td><td>Brownfield / large teams</td><td>Greenfield / microservices</td></tr>
            </tbody>
          </table>
        </div>
      </PageLayout>
    </>
  );
}
