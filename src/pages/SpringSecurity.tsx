import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/spring-security-reactive-authentication-and-authorization';

export default function SpringSecurity() {
  return (
    <>
      <SEO
        title="Spring Security — Reactive Authentication and Authorization"
        description="Complete guide to Spring Security with Spring WebFlux: SecurityWebFilterChain, ReactiveUserDetailsService, in-memory auth, form login, HTTP Basic, method security, and CSRF configuration."
        path={PATH}
        keywords="Spring Security WebFlux, SecurityWebFilterChain, ReactiveUserDetailsService, reactive security, method security"
      />
      <PageLayout
        breadcrumb="Security & Testing"
        title="Spring Security — Reactive Authentication and Authorization"
        description="Spring Security 6 has full reactive support for Spring WebFlux. This chapter covers the reactive security model, configuring SecurityWebFilterChain, building a ReactiveUserDetailsService, protecting endpoints, and adding method-level security."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="28 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#dependency">Dependencies</a></li>
            <li><a href="#security-chain">SecurityWebFilterChain</a></li>
            <li><a href="#user-details">ReactiveUserDetailsService</a></li>
            <li><a href="#password-encoder">Password Encoding</a></li>
            <li><a href="#http-basic">HTTP Basic Auth</a></li>
            <li><a href="#form-login">Form Login</a></li>
            <li><a href="#role-based">Role-Based Authorization</a></li>
            <li><a href="#method-security">Method-Level Security</a></li>
            <li><a href="#security-context">Accessing the Security Context Reactively</a></li>
            <li><a href="#csrf">CSRF Configuration</a></li>
          </ol>
        </div>

        {/* Dependency */}
        <div className="section" id="dependency">
          <h2 className="section-title">Dependencies</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- For testing security configs -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>`}</code></pre>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Reactive vs Servlet security model</div>
              In Spring MVC, you extend <code>WebSecurityConfigurerAdapter</code> (deprecated in Spring 6).
              In WebFlux, you define a <code>SecurityWebFilterChain</code> bean using
              <code> ServerHttpSecurity</code> — no extending, no inheritance.
            </div>
          </div>
        </div>

        {/* Security Chain */}
        <div className="section" id="security-chain">
          <h2 className="section-title">SecurityWebFilterChain</h2>
          <div className="step-content">
            <p>
              The <code>SecurityWebFilterChain</code> bean is the central place to configure all
              security rules. You define it using <code>ServerHttpSecurity</code>, Spring Security's
              reactive DSL.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">SecurityConfig.java</span>
            </div>
            <pre><code>{`@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            // Disable CSRF for REST APIs (enable for form-based UIs)
            .csrf(csrf -> csrf.disable())

            // Define authorization rules
            .authorizeExchange(auth -> auth
                // Public endpoints
                .pathMatchers("/api/auth/**").permitAll()
                .pathMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .pathMatchers("/actuator/health").permitAll()
                // Require authentication for everything else
                .anyExchange().authenticated()
            )

            // Enable HTTP Basic authentication
            .httpBasic(Customizer.withDefaults())

            .build();
    }
}`}</code></pre>
          </div>
        </div>

        {/* User Details */}
        <div className="section" id="user-details">
          <h2 className="section-title">ReactiveUserDetailsService</h2>
          <div className="step-content">
            <p>
              <code>ReactiveUserDetailsService</code> is the reactive counterpart of
              <code> UserDetailsService</code>. It has a single method: <code>findByUsername()</code>
              that returns <code>Mono&lt;UserDetails&gt;</code>.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">DatabaseUserDetailsService.java</span>
            </div>
            <pre><code>{`@Service
public class DatabaseUserDetailsService implements ReactiveUserDetailsService {

    private final UserRepository userRepository;

    @Override
    public Mono<UserDetails> findByUsername(String username) {
        return userRepository.findByUsername(username)
            .map(user -> org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())  // must be encoded
                .roles(user.getRole())          // ROLE_USER, ROLE_ADMIN, etc.
                .accountExpired(false)
                .credentialsExpired(false)
                .accountLocked(!user.isActive())
                .disabled(!user.isActive())
                .build())
            .cast(UserDetails.class)
            // If not found, return empty — Spring Security will throw BadCredentialsException
            .switchIfEmpty(Mono.empty());
    }
}

// Register it (Spring Boot auto-detects it — no explicit @Bean needed if only one exists)
@Bean
public ReactiveAuthenticationManager authenticationManager(
        ReactiveUserDetailsService userDetailsService,
        PasswordEncoder passwordEncoder) {
    UserDetailsRepositoryReactiveAuthenticationManager manager =
        new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService);
    manager.setPasswordEncoder(passwordEncoder);
    return manager;
}`}</code></pre>
          </div>
        </div>

        {/* Password Encoder */}
        <div className="section" id="password-encoder">
          <h2 className="section-title">Password Encoding</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">BCrypt password encoder bean</span>
            </div>
            <pre><code>{`@Bean
public PasswordEncoder passwordEncoder() {
    // BCrypt with strength 12 (default is 10; higher = slower = more secure)
    return new BCryptPasswordEncoder(12);
}

// When saving a new user, always encode the password first:
public Mono<User> registerUser(CreateUserRequest request) {
    String encodedPassword = passwordEncoder.encode(request.password());
    User user = new User(request.username(), request.email(), encodedPassword);
    return userRepository.save(user);
}

// Test convenience — in-memory user for development only
@Bean
@Profile("dev")
public MapReactiveUserDetailsService inMemoryUsers(PasswordEncoder encoder) {
    UserDetails admin = User.withUsername("admin")
        .password(encoder.encode("admin123"))
        .roles("ADMIN")
        .build();
    UserDetails user = User.withUsername("user")
        .password(encoder.encode("user123"))
        .roles("USER")
        .build();
    return new MapReactiveUserDetailsService(admin, user);
}`}</code></pre>
          </div>
        </div>

        {/* Role-based */}
        <div className="section" id="role-based">
          <h2 className="section-title">Role-Based Authorization</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Role-based access in SecurityConfig</span>
            </div>
            <pre><code>{`.authorizeExchange(auth -> auth
    // Public
    .pathMatchers(HttpMethod.GET, "/api/products/**").permitAll()
    .pathMatchers("/api/auth/**").permitAll()

    // User role required
    .pathMatchers(HttpMethod.POST, "/api/orders/**").hasRole("USER")
    .pathMatchers(HttpMethod.GET, "/api/profile/**").hasAnyRole("USER", "ADMIN")

    // Admin role required
    .pathMatchers("/api/admin/**").hasRole("ADMIN")
    .pathMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")

    // Require authentication for all other paths
    .anyExchange().authenticated()
)`}</code></pre>
          </div>
        </div>

        {/* Method Security */}
        <div className="section" id="method-security">
          <h2 className="section-title">Method-Level Security</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Method-level security with @PreAuthorize</span>
            </div>
            <pre><code>{`// Enable in config
@Configuration
@EnableReactiveMethodSecurity
public class MethodSecurityConfig { }

// Use in service or controller
@Service
public class UserService {

    @PreAuthorize("hasRole('ADMIN')")
    public Flux<User> findAllUsers() {
        return userRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public Mono<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostFilter("filterObject.role != 'ADMIN'")
    public Flux<User> findNonAdminUsers() {
        return userRepository.findAll();
    }

    @PostAuthorize("returnObject.map(u -> u.username == authentication.name).block()")
    public Mono<User> findMyProfile(Long id) {
        return userRepository.findById(id);
    }
}`}</code></pre>
          </div>
        </div>

        {/* Security Context */}
        <div className="section" id="security-context">
          <h2 className="section-title">Accessing the Security Context Reactively</h2>
          <div className="step-content">
            <p>
              In Spring MVC, you use <code>SecurityContextHolder.getContext()</code> which relies on
              thread-local storage. In WebFlux, you must use <code>ReactiveSecurityContextHolder</code>
              because operations may run on different threads.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Accessing the authenticated principal</span>
            </div>
            <pre><code>{`// In a controller — inject directly
@GetMapping("/me")
public Mono<UserResponse> getProfile(Authentication authentication) {
    String username = authentication.getName();
    return userService.findByUsername(username).map(UserResponse::from);
}

// Or via @AuthenticationPrincipal
@GetMapping("/me")
public Mono<UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
    return userService.findByUsername(userDetails.getUsername()).map(UserResponse::from);
}

// In a service — use ReactiveSecurityContextHolder
public Mono<String> getCurrentUsername() {
    return ReactiveSecurityContextHolder.getContext()
        .map(SecurityContext::getAuthentication)
        .map(Authentication::getName);
}

// Access roles
public Mono<Boolean> currentUserIsAdmin() {
    return ReactiveSecurityContextHolder.getContext()
        .map(ctx -> ctx.getAuthentication().getAuthorities()
            .stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
}`}</code></pre>
          </div>
        </div>

        {/* CSRF */}
        <div className="section" id="csrf">
          <h2 className="section-title">CSRF Configuration</h2>
          <div className="step-content">
            <p>
              CSRF protection is enabled by default. For pure REST APIs consumed by mobile or SPA clients
              (using token-based auth), disable it. For server-rendered forms, keep it enabled.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">CSRF options</span>
            </div>
            <pre><code>{`// Option 1: Disable CSRF entirely (safe for token-based REST APIs)
.csrf(csrf -> csrf.disable())

// Option 2: Enable with cookie-based CSRF (for SPA with cookie auth)
.csrf(csrf -> csrf
    .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
)

// Option 3: Custom CSRF token exchange (for header-based approaches)
.csrf(csrf -> csrf
    .csrfTokenRepository(new WebSessionServerCsrfTokenRepository())
)`}</code></pre>
          </div>
          <div className="info-box tip">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">When to disable CSRF</div>
              If your API is stateless (no cookies, authentication via JWT in the Authorization header),
              CSRF attacks are not possible. It is safe and recommended to disable CSRF in this case.
              See the next chapter on JWT Authentication for the complete setup.
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
