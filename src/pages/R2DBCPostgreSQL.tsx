import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/reactive-database-access-using-r2dbc-and-postgresql';

export default function R2DBCPostgreSQL() {
  return (
    <>
      <SEO
        title="Reactive Database Access Using R2DBC and PostgreSQL"
        description="Step-by-step guide to connecting Spring WebFlux to PostgreSQL reactively using R2DBC, Spring Data R2DBC, reactive repositories, custom queries, and database migrations with Flyway."
        path={PATH}
        keywords="R2DBC, Spring Data R2DBC, reactive PostgreSQL, reactive database, R2DBC driver, ReactiveCrudRepository"
      />
      <PageLayout
        breadcrumb="Reactive Data Access"
        title="Reactive Database Access Using R2DBC and PostgreSQL"
        description="R2DBC (Reactive Relational Database Connectivity) is the reactive counterpart of JDBC. This chapter walks through every step: adding dependencies, configuring the connection pool, defining entities, writing reactive repositories, and executing custom SQL queries."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="30 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#what-is-r2dbc">What is R2DBC?</a></li>
            <li><a href="#dependencies">Dependencies</a></li>
            <li><a href="#configuration">Database Configuration</a></li>
            <li><a href="#entities">Defining Entities</a></li>
            <li><a href="#repositories">Reactive Repositories</a></li>
            <li><a href="#custom-queries">Custom Queries with @Query</a></li>
            <li><a href="#r2dbc-template">DatabaseClient for Complex Queries</a></li>
            <li><a href="#transactions">Reactive Transactions</a></li>
            <li><a href="#migrations">Database Migrations with Flyway</a></li>
            <li><a href="#pagination">Pagination with R2DBC</a></li>
          </ol>
        </div>

        {/* What is R2DBC */}
        <div className="section" id="what-is-r2dbc">
          <h2 className="section-title">What is R2DBC?</h2>
          <div className="step-content">
            <p>
              <strong>R2DBC</strong> (Reactive Relational Database Connectivity) is a specification for
              non-blocking database drivers for relational databases. It is to reactive programming what
              JDBC is to traditional blocking code — but fully non-blocking and based on Reactive Streams.
            </p>
            <p>
              Without R2DBC, accessing a relational database from a Spring WebFlux application would
              block an event loop thread (via JDBC), eliminating the scalability benefits of reactive programming.
            </p>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">JPA / Hibernate is NOT compatible with WebFlux</div>
              Hibernate ORM (used by Spring Data JPA) is built on JDBC and is fundamentally blocking.
              Do not use <code>spring-boot-starter-data-jpa</code> with <code>spring-boot-starter-webflux</code>.
              Use R2DBC instead.
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div className="section" id="dependencies">
          <h2 className="section-title">Dependencies</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml</span>
            </div>
            <pre><code>{`<!-- Spring Data R2DBC -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-r2dbc</artifactId>
</dependency>

<!-- PostgreSQL R2DBC driver (r2dbc-postgresql) -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>r2dbc-postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Flyway for migrations (uses JDBC for schema, not runtime) -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<!-- Flyway still needs a JDBC connection for migrations only -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>`}</code></pre>
          </div>
          <table className="dep-table">
            <thead>
              <tr>
                <th>Dependency</th>
                <th>Group ID</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="dep-name">spring-boot-starter-data-r2dbc</span></td>
                <td>org.springframework.boot</td>
                <td>Spring Data R2DBC auto-config, repositories, R2dbcEntityTemplate</td>
              </tr>
              <tr>
                <td><span className="dep-name">r2dbc-postgresql</span></td>
                <td>org.postgresql</td>
                <td>Official PostgreSQL R2DBC driver (replaces r2dbc-spi)</td>
              </tr>
              <tr>
                <td><span className="dep-name">flyway-core</span></td>
                <td>org.flywaydb</td>
                <td>SQL schema migration management</td>
              </tr>
              <tr>
                <td><span className="dep-name">postgresql</span></td>
                <td>org.postgresql</td>
                <td>JDBC driver (Flyway only — not used at runtime)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Configuration */}
        <div className="section" id="configuration">
          <h2 className="section-title">Database Configuration</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">application.yml</span>
            </div>
            <pre><code>{`spring:
  r2dbc:
    url: r2dbc:postgresql://localhost:5432/mydb
    username: myuser
    password: mypassword
    pool:
      initial-size: 5
      max-size: 20
      max-idle-time: 30m
      validation-query: SELECT 1

  # Flyway configuration (uses JDBC)
  flyway:
    url: jdbc:postgresql://localhost:5432/mydb
    user: myuser
    password: mypassword
    locations: classpath:db/migration`}</code></pre>
          </div>
        </div>

        {/* Entities */}
        <div className="section" id="entities">
          <h2 className="section-title">Defining Entities</h2>
          <div className="step-content">
            <p>
              R2DBC entities use Spring Data annotations. They are simpler than JPA entities —
              no <code>@Entity</code>, no lazy loading, no proxies. Just plain Java objects with
              column mappings.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">User.java — R2DBC entity</span>
            </div>
            <pre><code>{`package com.example.webfluxdemo.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("users")   // maps to the "users" table
public class User {

    @Id
    private Long id;

    @Column("username")
    private String username;

    @Column("email")
    private String email;

    @Column("role")
    private String role;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;

    // constructors, getters, setters (or use Lombok @Data)
}

// Corresponding Flyway migration: V1__create_users.sql
// CREATE TABLE users (
//     id         BIGSERIAL PRIMARY KEY,
//     username   VARCHAR(50)  NOT NULL UNIQUE,
//     email      VARCHAR(255) NOT NULL UNIQUE,
//     role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
//     created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
//     updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
// );`}</code></pre>
          </div>
        </div>

        {/* Repositories */}
        <div className="section" id="repositories">
          <h2 className="section-title">Reactive Repositories</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">UserRepository.java</span>
            </div>
            <pre><code>{`package com.example.webfluxdemo.repository;

import com.example.webfluxdemo.model.User;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface UserRepository extends R2dbcRepository<User, Long> {

    // Derived query methods — generated automatically from method name
    Mono<User> findByUsername(String username);
    Mono<User> findByEmail(String email);
    Flux<User> findAllByRole(String role);
    Mono<Boolean> existsByEmail(String email);
    Mono<Long> countByRole(String role);

    // Derived delete
    Mono<Void> deleteByUsername(String username);
}`}</code></pre>
          </div>
        </div>

        {/* Custom Queries */}
        <div className="section" id="custom-queries">
          <h2 className="section-title">Custom Queries with @Query</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Custom @Query examples</span>
            </div>
            <pre><code>{`public interface UserRepository extends R2dbcRepository<User, Long> {

    // Named parameter
    @Query("SELECT * FROM users WHERE email = :email")
    Mono<User> findByEmailCustom(@Param("email") String email);

    // Modifying query (UPDATE, DELETE)
    @Modifying
    @Query("UPDATE users SET role = :role WHERE id = :id")
    Mono<Integer> updateRole(@Param("id") Long id, @Param("role") String role);

    // Pagination (Spring Data Pageable support)
    @Query("SELECT * FROM users ORDER BY created_at DESC LIMIT :#{#pageable.pageSize} OFFSET :#{#pageable.offset}")
    Flux<User> findAllPaged(Pageable pageable);

    // Native SQL with complex joins
    @Query("""
        SELECT u.*, COUNT(o.id) AS order_count
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE u.role = :role
        GROUP BY u.id
        ORDER BY order_count DESC
        LIMIT :limit
        """)
    Flux<UserOrderSummary> findTopUsersByOrderCount(
        @Param("role") String role,
        @Param("limit") int limit);
}`}</code></pre>
          </div>
        </div>

        {/* DatabaseClient */}
        <div className="section" id="r2dbc-template">
          <h2 className="section-title">DatabaseClient for Complex Queries</h2>
          <div className="step-content">
            <p>
              For queries that don't fit the repository pattern — dynamic queries, multi-table joins,
              stored procedures — use <code>DatabaseClient</code> directly.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">DatabaseClient usage</span>
            </div>
            <pre><code>{`@Service
public class UserQueryService {

    private final DatabaseClient client;

    public UserQueryService(DatabaseClient client) {
        this.client = client;
    }

    public Flux<User> findActiveUsersInCity(String city, int limit) {
        return client.sql("""
                SELECT u.*
                FROM users u
                JOIN addresses a ON a.user_id = u.id
                WHERE a.city = :city
                  AND u.active = true
                ORDER BY u.created_at DESC
                LIMIT :limit
                """)
            .bind("city", city)
            .bind("limit", limit)
            .map((row, meta) -> new User(
                row.get("id", Long.class),
                row.get("username", String.class),
                row.get("email", String.class)
            ))
            .all();
    }

    public Mono<Long> countUsersCreatedAfter(Instant since) {
        return client.sql("SELECT COUNT(*) FROM users WHERE created_at > :since")
            .bind("since", since)
            .map(row -> row.get(0, Long.class))
            .one();
    }
}`}</code></pre>
          </div>
        </div>

        {/* Transactions */}
        <div className="section" id="transactions">
          <h2 className="section-title">Reactive Transactions</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">@Transactional in reactive services</span>
            </div>
            <pre><code>{`@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // @Transactional works with Spring Data R2DBC
    // Uses ReactiveTransactionManager under the hood
    @Transactional
    public Mono<Order> placeOrder(CreateOrderRequest request) {
        return productRepository.findById(request.productId())
            .switchIfEmpty(Mono.error(new ProductNotFoundException(request.productId())))
            .flatMap(product -> {
                if (product.getStock() < request.quantity()) {
                    return Mono.error(new InsufficientStockException());
                }
                // Decrease stock
                product.setStock(product.getStock() - request.quantity());
                return productRepository.save(product);
            })
            .flatMap(product -> {
                Order order = new Order(request.userId(), product.getId(), request.quantity());
                return orderRepository.save(order);
            });
        // If ANY step throws, the entire transaction is rolled back
    }
}

// Enable transaction manager in config
@Configuration
@EnableTransactionManagement
public class R2dbcConfig extends AbstractR2dbcConfiguration {
    // ConnectionFactory @Bean defined by spring-boot auto-config
    // ReactiveTransactionManager is auto-configured by Boot
}`}</code></pre>
          </div>
        </div>

        {/* Migrations */}
        <div className="section" id="migrations">
          <h2 className="section-title">Database Migrations with Flyway</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">sql</span>
              <span className="code-block-filename">src/main/resources/db/migration/V1__init.sql</span>
            </div>
            <pre><code>{`-- V1__init.sql
CREATE TABLE users (
    id         BIGSERIAL    PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- V2__add_products.sql
CREATE TABLE products (
    id          BIGSERIAL     PRIMARY KEY,
    name        VARCHAR(200)  NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL,
    stock       INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);`}</code></pre>
          </div>
        </div>

        {/* Pagination */}
        <div className="section" id="pagination">
          <h2 className="section-title">Pagination with R2DBC</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Paginated endpoint with R2DBC</span>
            </div>
            <pre><code>{`// Controller
@GetMapping
public Mono<Map<String, Object>> getUsers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {

    PageRequest pageRequest = PageRequest.of(page, size, Sort.by("created_at").descending());

    Mono<Long> total = userRepository.count();
    Flux<User> users = userRepository.findAllBy(pageRequest);

    return Mono.zip(total, users.collectList())
        .map(tuple -> Map.of(
            "content", tuple.getT2(),
            "totalElements", tuple.getT1(),
            "page", page,
            "size", size,
            "totalPages", (int) Math.ceil((double) tuple.getT1() / size)
        ));
}

// Repository with Pageable
public interface UserRepository extends ReactiveSortingRepository<User, Long>,
                                        ReactiveCrudRepository<User, Long> {
    Flux<User> findAllBy(Pageable pageable);
}`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
