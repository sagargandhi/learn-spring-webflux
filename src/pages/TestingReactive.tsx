import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/testing-reactive-applications-with-webtestclient-and-stepverifier';

export default function TestingReactive() {
  return (
    <>
      <SEO
        title="Testing Reactive Applications with WebTestClient and StepVerifier"
        description="Master testing in Spring WebFlux: StepVerifier for Reactor streams, WebTestClient for HTTP integration tests, @WebFluxTest slice tests, mocking with Mockito, and testing secured endpoints."
        path={PATH}
        keywords="WebTestClient, StepVerifier, reactive testing, @WebFluxTest, reactor test, spring webflux test"
      />
      <PageLayout
        breadcrumb="Security & Testing"
        title="Testing Reactive Applications with WebTestClient and StepVerifier"
        description="Testing reactive code requires tools that understand asynchronous streams. This chapter covers StepVerifier for unit-testing Reactor publishers, WebTestClient for HTTP-level integration tests, @WebFluxTest for slice tests, and best practices for mocking reactive components."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="26 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#dependencies">Test Dependencies</a></li>
            <li><a href="#stepverifier">StepVerifier Basics</a></li>
            <li><a href="#stepverifier-error">Testing Errors with StepVerifier</a></li>
            <li><a href="#stepverifier-time">Virtual Time in StepVerifier</a></li>
            <li><a href="#webtestclient">WebTestClient Basics</a></li>
            <li><a href="#webfluxtest">@WebFluxTest Slice Tests</a></li>
            <li><a href="#integration">@SpringBootTest Integration Tests</a></li>
            <li><a href="#mocking">Mocking Reactive Services</a></li>
            <li><a href="#security-testing">Testing Secured Endpoints</a></li>
            <li><a href="#repository-testing">Testing Reactive Repositories</a></li>
          </ol>
        </div>

        {/* Dependencies */}
        <div className="section" id="dependencies">
          <h2 className="section-title">Test Dependencies</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml</span>
            </div>
            <pre><code>{`<!-- Spring Boot test starter (includes JUnit 5, Mockito, AssertJ) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- reactor-test: provides StepVerifier and PublisherProbe -->
<dependency>
    <groupId>io.projectreactor</groupId>
    <artifactId>reactor-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- Spring Security test: @WithMockUser etc. -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>`}</code></pre>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">reactor-test is separate</div>
              <code>reactor-test</code> is NOT included in <code>spring-boot-starter-test</code>.
              You must add it explicitly. It provides <code>StepVerifier</code>, <code>PublisherProbe</code>,
              and virtual time utilities.
            </div>
          </div>
        </div>

        {/* StepVerifier Basics */}
        <div className="section" id="stepverifier">
          <h2 className="section-title">StepVerifier Basics</h2>
          <div className="step-content">
            <p>
              <code>StepVerifier</code> is the primary tool for unit-testing a <code>Mono</code> or
              <code> Flux</code>. It sets up a subscription to the publisher and lets you assert each
              signal: <code>onNext</code>, <code>onError</code>, and <code>onComplete</code>.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">StepVerifier — basic usage</span>
            </div>
            <pre><code>{`class ProductServiceTest {

    private final ProductRepository repo = Mockito.mock(ProductRepository.class);
    private final ProductService service = new ProductService(repo);

    // --- Testing Mono ---
    @Test
    void findById_existingProduct_returnsMono() {
        Product p = new Product("p1", "Widget", 9.99);
        Mockito.when(repo.findById("p1")).thenReturn(Mono.just(p));

        StepVerifier.create(service.findById("p1"))
            .expectNext(p)              // Assert next emitted item
            .verifyComplete();           // Assert onComplete was signalled
    }

    @Test
    void findById_missingId_returnsEmpty() {
        Mockito.when(repo.findById("x")).thenReturn(Mono.empty());

        StepVerifier.create(service.findById("x"))
            .verifyComplete();   // empty Mono = no items, then complete
    }

    // --- Testing Flux ---
    @Test
    void findAll_returnsAllProducts() {
        List<Product> products = List.of(
            new Product("p1", "Widget", 9.99),
            new Product("p2", "Gadget", 19.99)
        );
        Mockito.when(repo.findAll()).thenReturn(Flux.fromIterable(products));

        StepVerifier.create(service.findAll())
            .expectNext(products.get(0))
            .expectNext(products.get(1))
            .verifyComplete();
    }

    // --- Asserting with a predicate ---
    @Test
    void findById_assertFields() {
        Product p = new Product("p1", "Widget", 9.99);
        Mockito.when(repo.findById("p1")).thenReturn(Mono.just(p));

        StepVerifier.create(service.findById("p1"))
            .expectNextMatches(product -> product.name().equals("Widget")
                               && product.price() == 9.99)
            .verifyComplete();
    }

    // --- Count items ---
    @Test
    void findAll_correctItemCount() {
        Mockito.when(repo.findAll()).thenReturn(Flux.range(1, 10).map(i ->
            new Product("p" + i, "P" + i, i * 1.5)));

        StepVerifier.create(service.findAll())
            .expectNextCount(10)
            .verifyComplete();
    }
}`}</code></pre>
          </div>
        </div>

        {/* Error Testing */}
        <div className="section" id="stepverifier-error">
          <h2 className="section-title">Testing Errors with StepVerifier</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">StepVerifier — error scenarios</span>
            </div>
            <pre><code>{`@Test
void findById_notFound_throwsException() {
    Mockito.when(repo.findById("x")).thenReturn(Mono.empty());

    StepVerifier.create(service.findByIdOrThrow("x"))
        .expectErrorMatches(ex -> ex instanceof ProductNotFoundException
            && ex.getMessage().contains("x"))
        .verify();
}

// Use verifyError(Class) for simple type assertion
@Test
void findById_repoFails_propagatesError() {
    Mockito.when(repo.findById("x"))
        .thenReturn(Mono.error(new RuntimeException("DB error")));

    StepVerifier.create(service.findById("x"))
        .verifyError(RuntimeException.class);
}

// Test error recovery
@Test
void findById_withFallback_returnsFallback() {
    Mockito.when(repo.findById("x")).thenReturn(Mono.error(new RuntimeException()));

    StepVerifier.create(service.findByIdWithFallback("x"))
        .expectNextMatches(p -> p.id().equals("default"))
        .verifyComplete();
}

// Testing that a Flux errors partway through
@Test
void findAll_partialError_emitsItemsThenErrors() {
    Flux<Product> partialFlux = Flux.concat(
        Flux.just(new Product("p1", "A", 1.0)),
        Flux.error(new RuntimeException("partial failure"))
    );
    Mockito.when(repo.findAll()).thenReturn(partialFlux);

    StepVerifier.create(service.findAll())
        .expectNextCount(1)
        .verifyError(RuntimeException.class);
}`}</code></pre>
          </div>
        </div>

        {/* Virtual Time */}
        <div className="section" id="stepverifier-time">
          <h2 className="section-title">Virtual Time in StepVerifier</h2>
          <div className="step-content">
            <p>
              Time-based operators like <code>Flux.interval</code>, <code>delayElements</code>, and
              <code> timeout</code> would make tests slow if tested in real time. Use
              <code> StepVerifier.withVirtualTime()</code> to manipulate time without waiting.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Virtual time — test without sleeping</span>
            </div>
            <pre><code>{`@Test
void priceUpdates_emitsTenItemsEverySecond() {
    // Supply the publisher via a Supplier — VirtualTimeScheduler replaces the real clock
    StepVerifier.withVirtualTime(() ->
            Flux.interval(Duration.ofSeconds(1)).take(10))
        .thenAwait(Duration.ofSeconds(10))   // advance virtual time by 10 seconds
        .expectNextCount(10)
        .verifyComplete();
}

@Test
void retryWithDelay_retriesAfterDelay() {
    AtomicInteger attempts = new AtomicInteger(0);
    Mono<String> flaky = Mono.fromCallable(() -> {
        if (attempts.incrementAndGet() < 3) throw new RuntimeException("not yet");
        return "success";
    }).retryWhen(Retry.fixedDelay(3, Duration.ofSeconds(2)));

    StepVerifier.withVirtualTime(() -> flaky)
        .expectSubscription()
        .thenAwait(Duration.ofSeconds(4))   // 2 retries × 2 second delay
        .expectNext("success")
        .verifyComplete();
}`}</code></pre>
          </div>
        </div>

        {/* WebTestClient */}
        <div className="section" id="webtestclient">
          <h2 className="section-title">WebTestClient Basics</h2>
          <div className="step-content">
            <p>
              <code>WebTestClient</code> is the reactive counterpart of Spring MVC's <code>MockMvc</code>.
              It can bind directly to a controller (no server needed) or connect to a running server.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">WebTestClient examples</span>
            </div>
            <pre><code>{`// --- GET request ---
webTestClient.get()
    .uri("/api/products/{id}", "p1")
    .accept(MediaType.APPLICATION_JSON)
    .exchange()
    .expectStatus().isOk()
    .expectBody(ProductResponse.class)
    .value(p -> assertThat(p.name()).isEqualTo("Widget"));

// --- POST request with body ---
webTestClient.post()
    .uri("/api/products")
    .contentType(MediaType.APPLICATION_JSON)
    .bodyValue(new CreateProductRequest("Widget", 9.99))
    .exchange()
    .expectStatus().isCreated()
    .expectHeader().exists("Location")
    .expectBody()
    .jsonPath("$.id").isNotEmpty()
    .jsonPath("$.name").isEqualTo("Widget");

// --- DELETE ---
webTestClient.delete()
    .uri("/api/products/{id}", "p1")
    .exchange()
    .expectStatus().isNoContent();

// --- Flux (list response) ---
webTestClient.get()
    .uri("/api/products")
    .exchange()
    .expectStatus().isOk()
    .expectBodyList(ProductResponse.class)
    .hasSize(3)
    .value(list -> assertThat(list).extracting("name").contains("Widget"));`}</code></pre>
          </div>
        </div>

        {/* @WebFluxTest */}
        <div className="section" id="webfluxtest">
          <h2 className="section-title">@WebFluxTest Slice Tests</h2>
          <div className="step-content">
            <p>
              <code>@WebFluxTest</code> loads only the web layer (controllers, filters, <code>WebFluxConfigurer</code>),
              not the full application context. It auto-configures <code>WebTestClient</code>. Mock
              services with <code>@MockBean</code>.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">ProductControllerTest.java</span>
            </div>
            <pre><code>{`@WebFluxTest(ProductController.class)
@Import(SecurityConfig.class)   // if security config is needed
class ProductControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private ProductService productService;

    @Test
    void getProduct_existingId_returnsProduct() {
        ProductResponse response = new ProductResponse("p1", "Widget", 9.99);
        Mockito.when(productService.findById("p1"))
            .thenReturn(Mono.just(response));

        webTestClient.get()
            .uri("/api/products/p1")
            .exchange()
            .expectStatus().isOk()
            .expectBody(ProductResponse.class)
            .isEqualTo(response);
    }

    @Test
    void getProduct_notFound_returns404() {
        Mockito.when(productService.findById("x"))
            .thenReturn(Mono.error(new ProductNotFoundException("x")));

        webTestClient.get()
            .uri("/api/products/x")
            .exchange()
            .expectStatus().isNotFound();
    }

    @Test
    void createProduct_invalidBody_returns400() {
        // Empty name violates @NotBlank
        webTestClient.post()
            .uri("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("name", "", "price", -1.0))
            .exchange()
            .expectStatus().isBadRequest()
            .expectBody()
            .jsonPath("$.violations").isArray();
    }
}`}</code></pre>
          </div>
        </div>

        {/* Security Testing */}
        <div className="section" id="security-testing">
          <h2 className="section-title">Testing Secured Endpoints</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Testing with authentication context</span>
            </div>
            <pre><code>{`@WebFluxTest(AdminController.class)
class AdminControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(roles = "ADMIN")    // Mocks an authenticated ADMIN user
    void adminEndpoint_withAdminRole_returnsOk() {
        Mockito.when(userService.findAll()).thenReturn(Flux.empty());

        webTestClient.get()
            .uri("/api/admin/users")
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    @WithMockUser(roles = "USER")    // USER — should be Forbidden
    void adminEndpoint_withUserRole_returnsForbidden() {
        webTestClient.get()
            .uri("/api/admin/users")
            .exchange()
            .expectStatus().isForbidden();
    }

    @Test
    void adminEndpoint_unauthenticated_returnsUnauthorized() {
        webTestClient.get()
            .uri("/api/admin/users")
            .exchange()
            .expectStatus().isUnauthorized();
    }

    // For JWT-based auth — inject the actual token
    @Test
    void adminEndpoint_withJwtToken_returnsOk(@Autowired JwtService jwtService) {
        UserDetails admin = User.withUsername("admin").password("x").roles("ADMIN").build();
        String token = jwtService.generateAccessToken(admin);

        Mockito.when(userService.findAll()).thenReturn(Flux.empty());

        webTestClient.get()
            .uri("/api/admin/users")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .exchange()
            .expectStatus().isOk();
    }
}`}</code></pre>
          </div>
        </div>

        {/* Repository Testing */}
        <div className="section" id="repository-testing">
          <h2 className="section-title">Testing Reactive Repositories</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">R2DBC repository slice test</span>
            </div>
            <pre><code>{`// Use @DataR2dbcTest for R2DBC repositories
@DataR2dbcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ProductRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.r2dbc.url", () ->
            "r2dbc:postgresql://localhost:" + postgres.getFirstMappedPort() + "/testdb");
        registry.add("spring.r2dbc.username", postgres::getUsername);
        registry.add("spring.r2dbc.password", postgres::getPassword);
    }

    @Autowired
    private ProductRepository repo;

    @Test
    void saveAndFindById_roundTrips() {
        Product p = new Product(null, "Widget", 9.99);

        StepVerifier.create(repo.save(p).flatMap(saved -> repo.findById(saved.id())))
            .expectNextMatches(found -> found.name().equals("Widget"))
            .verifyComplete();
    }

    @Test
    void findByPriceLessThan_returnsFilteredResults() {
        Product cheap = new Product(null, "Cheap", 5.00);
        Product expensive = new Product(null, "Expensive", 100.00);

        StepVerifier.create(
            repo.saveAll(List.of(cheap, expensive))
                .thenMany(repo.findByPriceLessThan(10.00)))
            .expectNextMatches(p -> p.name().equals("Cheap"))
            .verifyComplete();
    }
}`}</code></pre>
          </div>
          <div className="info-box tip">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">Testcontainers for integration tests</div>
              Use <code>testcontainers</code> to spin up a real PostgreSQL (or MongoDB, Redis) instance
              in Docker during tests. Add <code>spring-boot-testcontainers</code> and
              <code> testcontainers</code> BOM to get auto-configuration with <code>@ServiceConnection</code>.
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
