import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/reactive-redis-caching-with-lettuce-and-spring-webflux';

export default function ReactiveRedis() {
  return (
    <>
      <SEO
        title="Reactive Redis Caching with Lettuce and Spring WebFlux"
        description="Learn how to use Redis reactively in Spring WebFlux using Spring Data Redis with the Lettuce driver: ReactiveRedisTemplate, reactive caching, pub/sub, and session storage."
        path={PATH}
        keywords="Spring Data Redis reactive, Lettuce, ReactiveRedisTemplate, Redis caching WebFlux, reactive pub/sub"
      />
      <PageLayout
        breadcrumb="Reactive Data Access"
        title="Reactive Redis Caching with Lettuce and Spring WebFlux"
        description="Redis is the go-to cache and message broker in reactive Spring stacks. This chapter covers adding Spring Data Redis with the Lettuce driver, using ReactiveRedisTemplate for CRUD operations, implementing cache-aside patterns, reactive pub/sub, and storing HTTP sessions in Redis."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="25 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#dependencies">Dependencies</a></li>
            <li><a href="#configuration">Configuration</a></li>
            <li><a href="#template">ReactiveRedisTemplate</a></li>
            <li><a href="#cache-aside">Cache-Aside Pattern</a></li>
            <li><a href="#hash-ops">Hash Operations</a></li>
            <li><a href="#list-ops">List Operations (Queue &amp; Stack)</a></li>
            <li><a href="#set-ops">Set and Sorted Set Operations</a></li>
            <li><a href="#pubsub">Reactive Pub/Sub</a></li>
            <li><a href="#ttl">TTL and Key Expiry</a></li>
            <li><a href="#session">Redis Session Storage</a></li>
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
            <pre><code>{`<!-- Spring Data Redis (includes Lettuce reactive client) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>

<!-- For Redis-backed HTTP session storage -->
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>

<!-- Versions provided by Spring Boot BOM:
     - io.lettuce:lettuce-core (reactive Redis client)
     - org.springframework.data:spring-data-redis -->`}</code></pre>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">Why Lettuce (not Jedis)?</div>
              Jedis is a synchronous, blocking Redis client. Lettuce is the reactive/async Redis client
              built on Netty. Spring Boot auto-configures Lettuce when
              <code> spring-boot-starter-data-redis-reactive</code> is on the classpath.
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="section" id="configuration">
          <h2 className="section-title">Configuration</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">application.yml</span>
            </div>
            <pre><code>{`spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: ""         # leave blank if no auth
      database: 0
      lettuce:
        pool:
          max-active: 10
          max-idle: 5
          min-idle: 2
          max-wait: 1000ms  # wait up to 1s for a connection`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">RedisConfig.java — JSON serialization</span>
            </div>
            <pre><code>{`@Configuration
public class RedisConfig {

    @Bean
    public ReactiveRedisTemplate<String, Object> reactiveRedisTemplate(
            ReactiveRedisConnectionFactory factory,
            ObjectMapper objectMapper) {

        // Use Jackson JSON serialization for values
        Jackson2JsonRedisSerializer<Object> serializer =
            new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);

        RedisSerializationContext<String, Object> context =
            RedisSerializationContext.<String, Object>newSerializationContext(
                new StringRedisSerializer())   // keys as plain strings
                .value(serializer)             // values as JSON
                .hashValue(serializer)         // hash values as JSON
                .build();

        return new ReactiveRedisTemplate<>(factory, context);
    }
}`}</code></pre>
          </div>
        </div>

        {/* Template */}
        <div className="section" id="template">
          <h2 className="section-title">ReactiveRedisTemplate</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Basic string operations</span>
            </div>
            <pre><code>{`@Service
public class RedisService {

    private final ReactiveRedisTemplate<String, Object> redisTemplate;
    private final ReactiveValueOperations<String, Object> valueOps;

    public RedisService(ReactiveRedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.valueOps = redisTemplate.opsForValue();
    }

    // SET key value
    public Mono<Boolean> set(String key, Object value) {
        return valueOps.set(key, value);
    }

    // SET key value EX seconds
    public Mono<Boolean> setWithTtl(String key, Object value, Duration ttl) {
        return valueOps.set(key, value, ttl);
    }

    // GET key
    public Mono<Object> get(String key) {
        return valueOps.get(key);
    }

    // DEL key
    public Mono<Boolean> delete(String key) {
        return redisTemplate.delete(key).map(count -> count > 0);
    }

    // Check existence
    public Mono<Boolean> exists(String key) {
        return redisTemplate.hasKey(key);
    }
}`}</code></pre>
          </div>
        </div>

        {/* Cache Aside */}
        <div className="section" id="cache-aside">
          <h2 className="section-title">Cache-Aside Pattern</h2>
          <div className="step-content">
            <p>
              The cache-aside pattern: check Redis first → if found, return cached value → if not found,
              fetch from the origin (database/API) → store in Redis → return result.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Cache-aside with reactive Redis</span>
            </div>
            <pre><code>{`@Service
public class ProductService {

    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final String CACHE_PREFIX = "product:";

    private final ProductRepository productRepository;
    private final ReactiveRedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public Mono<Product> findById(String id) {
        String cacheKey = CACHE_PREFIX + id;
        ReactiveValueOperations<String, Object> ops = redisTemplate.opsForValue();

        return ops.get(cacheKey)
            // Cache hit — deserialize and return
            .map(cached -> objectMapper.convertValue(cached, Product.class))
            // Cache miss — fetch from DB and cache the result
            .switchIfEmpty(
                productRepository.findById(id)
                    .flatMap(product ->
                        ops.set(cacheKey, product, CACHE_TTL)
                            .thenReturn(product))
            );
    }

    // Invalidate cache on update
    @Transactional
    public Mono<Product> update(String id, UpdateProductRequest request) {
        return productRepository.findById(id)
            .map(p -> applyUpdate(p, request))
            .flatMap(productRepository::save)
            .flatMap(saved ->
                redisTemplate.delete(CACHE_PREFIX + id)
                    .thenReturn(saved));
    }
}`}</code></pre>
          </div>
        </div>

        {/* Hash ops */}
        <div className="section" id="hash-ops">
          <h2 className="section-title">Hash Operations</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Redis Hash operations</span>
            </div>
            <pre><code>{`ReactiveHashOperations<String, String, String> hashOps =
    redisTemplate.opsForHash();

// HSET user:123 name Alice age 30
hashOps.put("user:123", "name", "Alice").subscribe();
hashOps.put("user:123", "age", "30").subscribe();

// HMSET — set multiple fields at once
Map<String, String> fields = Map.of("name", "Bob", "email", "bob@example.com");
hashOps.putAll("user:456", fields).subscribe();

// HGET
Mono<String> name = hashOps.get("user:123", "name");

// HGETALL
Mono<Map<String, String>> allFields = hashOps.entries("user:123").collectMap(
    Map.Entry::getKey, Map.Entry::getValue);

// HDEL
hashOps.remove("user:123", "age").subscribe();`}</code></pre>
          </div>
        </div>

        {/* Pub/Sub */}
        <div className="section" id="pubsub">
          <h2 className="section-title">Reactive Pub/Sub</h2>
          <div className="step-content">
            <p>
              Redis pub/sub is useful for broadcasting events across multiple service instances — for
              example, invalidating caches cluster-wide or fanout notifications.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Pub/Sub with ReactiveRedisMessageListenerContainer</span>
            </div>
            <pre><code>{`@Configuration
public class RedisPubSubConfig {

    @Bean
    public ReactiveRedisMessageListenerContainer messageListener(
            ReactiveRedisConnectionFactory factory) {
        return new ReactiveRedisMessageListenerContainer(factory);
    }
}

@Service
public class CacheInvalidationService {

    private final ReactiveRedisTemplate<String, Object> template;
    private final ReactiveRedisMessageListenerContainer listener;

    // Subscribe to cache-invalidation channel
    public Flux<String> subscribeToInvalidations() {
        return listener
            .receive(ChannelTopic.of("cache:invalidate"))
            .map(message -> (String) message.getMessage())
            .doOnNext(key -> log.info("Invalidating cache key: {}", key));
    }

    // Publish invalidation event
    public Mono<Long> publishInvalidation(String cacheKey) {
        return template.convertAndSend("cache:invalidate", cacheKey);
    }
}`}</code></pre>
          </div>
        </div>

        {/* TTL */}
        <div className="section" id="ttl">
          <h2 className="section-title">TTL and Key Expiry</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Setting and querying TTL</span>
            </div>
            <pre><code>{`// Set a TTL on an existing key
redisTemplate.expire("session:abc123", Duration.ofHours(24)).subscribe();

// Get remaining TTL
redisTemplate.getExpire("session:abc123")
    .subscribe(ttl -> System.out.println("Remaining: " + ttl.toMinutes() + " min"));

// Atomic set-with-TTL (SET NX EX) — for distributed locks
ReactiveValueOperations<String, Object> valueOps = redisTemplate.opsForValue();

Mono<Boolean> acquired = valueOps.setIfAbsent(
    "lock:resource-123",
    "LOCKED",
    Duration.ofSeconds(30));  // lock expires after 30s to prevent deadlocks`}</code></pre>
          </div>
        </div>

        {/* Session */}
        <div className="section" id="session">
          <h2 className="section-title">Redis Session Storage</h2>
          <div className="step-content">
            <p>
              Store HTTP sessions in Redis for horizontally scalable, stateless application instances.
              Requires <code>spring-session-data-redis</code>.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Enable Redis session</span>
            </div>
            <pre><code>{`// Enable reactive Redis session management
@SpringBootApplication
@EnableRedisWebSession(maxInactiveIntervalInSeconds = 3600)
public class WebfluxDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebfluxDemoApplication.class, args);
    }
}

// Accessing the session in a handler
@GetMapping("/session-demo")
public Mono<String> sessionDemo(WebSession session) {
    String visitCount = session.getAttributes()
        .compute("visitCount",
            (k, v) -> v == null ? "1" : String.valueOf(Integer.parseInt((String) v) + 1))
        .toString();

    return session.save().thenReturn("Visit count: " + visitCount);
}`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
