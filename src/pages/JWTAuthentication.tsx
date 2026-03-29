import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/jwt-authentication-and-authorization-in-spring-webflux';

export default function JWTAuthentication() {
  return (
    <>
      <SEO
        title="JWT Authentication and Authorization in Spring WebFlux"
        description="Implement stateless JWT authentication in Spring WebFlux: JWT filter, token generation with jjwt, SecurityWebFilterChain for stateless sessions, login endpoint, and protected routes."
        path={PATH}
        keywords="JWT Spring WebFlux, JWT authentication, stateless auth, jjwt, WebFilter JWT, spring security JWT"
      />
      <PageLayout
        breadcrumb="Security & Testing"
        title="JWT Authentication and Authorization in Spring WebFlux"
        description="JSON Web Tokens (JWT) enable stateless, scalable authentication. This chapter shows how to build a complete JWT authentication system for Spring WebFlux using the jjwt library — token generation, a custom WebFilter, and a stateless SecurityWebFilterChain."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="30 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#dependencies">Dependencies</a></li>
            <li><a href="#jwt-service">JWT Service</a></li>
            <li><a href="#jwt-filter">JWT Authentication Filter</a></li>
            <li><a href="#security-config">SecurityWebFilterChain (Stateless)</a></li>
            <li><a href="#auth-controller">Auth Controller (Login Endpoint)</a></li>
            <li><a href="#user-details">Wiring ReactiveUserDetailsService</a></li>
            <li><a href="#refresh-tokens">Refresh Tokens</a></li>
            <li><a href="#token-claims">Custom Claims in JWT</a></li>
            <li><a href="#testing">Testing JWT-Secured Endpoints</a></li>
          </ol>
        </div>

        {/* Dependencies */}
        <div className="section" id="dependencies">
          <h2 className="section-title">Dependencies</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml</span>
            </div>
            <pre><code>{`<!-- Spring Security WebFlux -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- jjwt — JSON Web Token library -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">application.yml</span>
            </div>
            <pre><code>{`app:
  jwt:
    # Use a secure, random 256-bit (32-byte) secret — never hardcode in production
    # Generate with: openssl rand -base64 32
    secret: "zmFmYzA0NzNkNzlhMmE4NTI3MzJhNzEzZjNlYmVkZDI="
    expiration-ms: 3600000       # 1 hour in ms
    refresh-expiration-ms: 604800000  # 7 days in ms`}</code></pre>
          </div>
        </div>

        {/* JWT Service */}
        <div className="section" id="jwt-service">
          <h2 className="section-title">JWT Service</h2>
          <div className="step-content">
            <p>
              The <code>JwtService</code> is a plain Spring bean that encapsulates all token operations:
              generating tokens, validating them, and extracting claims.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">JwtService.java</span>
            </div>
            <pre><code>{`@Service
public class JwtService {

    @Value("\${app.jwt.secret}")
    private String secret;

    @Value("\${app.jwt.expiration-ms}")
    private long expirationMs;

    @Value("\${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // --- Token Generation ---

    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails, expirationMs);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(Map.of("type", "refresh"), userDetails, refreshExpirationMs);
    }

    private String generateToken(Map<String, Object> extraClaims,
                                  UserDetails userDetails, long expiryMs) {
        return Jwts.builder()
            .claims(extraClaims)
            .subject(userDetails.getUsername())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiryMs))
            .claim("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
            .signWith(getSigningKey(), Jwts.SIG.HS256)
            .compact();
    }

    // --- Token Validation ---

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return claimsResolver.apply(claims);
    }
}`}</code></pre>
          </div>
        </div>

        {/* JWT Filter */}
        <div className="section" id="jwt-filter">
          <h2 className="section-title">JWT Authentication Filter</h2>
          <div className="step-content">
            <p>
              The filter intercepts every request, reads the <code>Authorization</code> header, validates
              the JWT if present, and populates the reactive security context.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">JwtAuthenticationFilter.java</span>
            </div>
            <pre><code>{`@Component
public class JwtAuthenticationFilter implements WebFilter {

    private final JwtService jwtService;
    private final ReactiveUserDetailsService userDetailsService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders()
            .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return chain.filter(exchange);  // No token — pass through
        }

        String token = authHeader.substring(7);

        return Mono.fromCallable(() -> jwtService.extractUsername(token))
            .onErrorResume(e -> Mono.empty())  // Invalid token format — ignore
            .flatMap(username -> userDetailsService.findByUsername(username))
            .filter(userDetails -> jwtService.isTokenValid(token, userDetails))
            .map(userDetails -> new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()))
            .flatMap(auth -> chain.filter(exchange)
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth)))
            .switchIfEmpty(chain.filter(exchange));
    }
}`}</code></pre>
          </div>
        </div>

        {/* Security Config */}
        <div className="section" id="security-config">
          <h2 className="section-title">SecurityWebFilterChain (Stateless)</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">SecurityConfig.java</span>
            </div>
            <pre><code>{`@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            // Stateless REST API — no HTTP session, no CSRF needed
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Public endpoints
            .authorizeExchange(auth -> auth
                .pathMatchers("/api/auth/**").permitAll()
                .pathMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                .anyExchange().authenticated()
            )

            // No form login, no HTTP Basic — JWT only
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // Register our JWT filter before the standard auth filter
            .addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)

            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}`}</code></pre>
          </div>
        </div>

        {/* Auth Controller */}
        <div className="section" id="auth-controller">
          <h2 className="section-title">Auth Controller (Login Endpoint)</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">AuthController.java</span>
            </div>
            <pre><code>{`public record LoginRequest(String username, String password) {}
public record AuthResponse(String accessToken, String refreshToken, long expiresIn) {}

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ReactiveAuthenticationManager authManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ReactiveUserDetailsService userDetailsService;

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public Mono<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(request.username(), request.password());

        return authManager.authenticate(authToken)
            .map(auth -> {
                UserDetails userDetails = (UserDetails) auth.getPrincipal();
                String accessToken = jwtService.generateAccessToken(userDetails);
                String refreshToken = jwtService.generateRefreshToken(userDetails);
                return new AuthResponse(accessToken, refreshToken, 3600);
            });
    }

    @PostMapping("/refresh")
    public Mono<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        String username = jwtService.extractUsername(refreshToken);
        return userDetailsService.findByUsername(username)
            .filter(u -> jwtService.isTokenValid(refreshToken, u))
            .map(userDetails -> {
                String newAccess = jwtService.generateAccessToken(userDetails);
                return new AuthResponse(newAccess, refreshToken, 3600);
            })
            .switchIfEmpty(Mono.error(new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid refresh token")));
    }
}`}</code></pre>
          </div>
        </div>

        {/* Testing */}
        <div className="section" id="testing">
          <h2 className="section-title">Testing JWT-Secured Endpoints</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">AuthIntegrationTest.java</span>
            </div>
            <pre><code>{`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private JwtService jwtService;

    // Helper — build a token for a fake user in tests
    private String tokenForUser(String username, String role) {
        UserDetails user = User.withUsername(username)
            .password("irrelevant")
            .roles(role)
            .build();
        return jwtService.generateAccessToken(user);
    }

    @Test
    void loginEndpoint_returnsTokens() {
        webTestClient.post().uri("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("username", "user", "password", "user123"))
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.accessToken").isNotEmpty()
            .jsonPath("$.refreshToken").isNotEmpty()
            .jsonPath("$.expiresIn").isEqualTo(3600);
    }

    @Test
    void protectedEndpoint_withValidToken_returnsOk() {
        String token = tokenForUser("user", "USER");
        webTestClient.get().uri("/api/profile")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    void protectedEndpoint_withoutToken_returnsUnauthorized() {
        webTestClient.get().uri("/api/profile")
            .exchange()
            .expectStatus().isUnauthorized();
    }
}`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
