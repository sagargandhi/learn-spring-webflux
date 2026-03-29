import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/spring-data-reactive-mongodb-with-spring-webflux';

export default function ReactiveMongoDB() {
  return (
    <>
      <SEO
        title="Spring Data Reactive MongoDB with Spring WebFlux"
        description="Complete guide to integrating MongoDB into a Spring WebFlux application using Spring Data Reactive MongoDB: entities, repositories, ReactiveMongoTemplate, aggregation pipelines, and change streams."
        path={PATH}
        keywords="Spring Data MongoDB reactive, ReactiveMongoRepository, ReactiveMongoTemplate, MongoDB WebFlux, change streams"
      />
      <PageLayout
        breadcrumb="Reactive Data Access"
        title="Spring Data Reactive MongoDB with Spring WebFlux"
        description="MongoDB's document model pairs naturally with reactive programming. This chapter covers the full stack: setting up the driver, defining documents, querying with repositories and ReactiveMongoTemplate, building aggregation pipelines, and listening to real-time change streams."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="28 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#dependencies">Dependencies</a></li>
            <li><a href="#configuration">Configuration</a></li>
            <li><a href="#documents">Defining Documents</a></li>
            <li><a href="#repositories">ReactiveMongoRepository</a></li>
            <li><a href="#custom-queries">Custom Queries</a></li>
            <li><a href="#mongo-template">ReactiveMongoTemplate</a></li>
            <li><a href="#aggregation">Aggregation Pipelines</a></li>
            <li><a href="#change-streams">Change Streams (Real-Time Events)</a></li>
            <li><a href="#indexing">Indexing</a></li>
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
            <pre><code>{`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb-reactive</artifactId>
</dependency>

<!-- Versions provided by Spring Boot BOM:
     - org.mongodb:mongodb-driver-reactivestreams (Reactor-compatible async driver)
     - org.springframework.data:spring-data-mongodb
     - io.projectreactor:reactor-core -->`}</code></pre>
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
    mongodb:
      uri: mongodb://localhost:27017/mydb
      # For Atlas:
      # uri: mongodb+srv://user:pass@cluster.mongodb.net/mydb
      auto-index-creation: true   # creates @Indexed indexes on startup (disable in prod)`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">MongoConfig.java — advanced settings</span>
            </div>
            <pre><code>{`@Configuration
public class MongoConfig extends AbstractReactiveMongoConfiguration {

    @Override
    protected String getDatabaseName() {
        return "mydb";
    }

    @Bean
    @Override
    public MongoClient reactiveMongoClient() {
        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(new ConnectionString("mongodb://localhost:27017"))
            .applyToConnectionPoolSettings(builder -> builder
                .minSize(5)
                .maxSize(20)
                .maxWaitTime(3000, TimeUnit.MILLISECONDS))
            .codecRegistry(MongoClientSettings.getDefaultCodecRegistry())
            .build();
        return MongoClients.create(settings);
    }
}`}</code></pre>
          </div>
        </div>

        {/* Documents */}
        <div className="section" id="documents">
          <h2 className="section-title">Defining Documents</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Product.java — MongoDB document</span>
            </div>
            <pre><code>{`package com.example.webfluxdemo.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Document(collection = "products")
public class Product {

    @Id
    private String id;  // MongoDB uses String for ObjectId

    @Indexed(unique = true)
    private String sku;

    @TextIndexed
    private String name;

    @TextIndexed
    private String description;

    private BigDecimal price;
    private int stock;

    @Field("category_id")
    private String categoryId;

    private List<String> tags;

    // Embedded subdocument
    private ProductDimensions dimensions;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

// Embedded document (no @Document needed)
public record ProductDimensions(
    double weightKg,
    double lengthCm,
    double widthCm,
    double heightCm
) {}`}</code></pre>
          </div>
        </div>

        {/* Repository */}
        <div className="section" id="repositories">
          <h2 className="section-title">ReactiveMongoRepository</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">ProductRepository.java</span>
            </div>
            <pre><code>{`@Repository
public interface ProductRepository extends ReactiveMongoRepository<Product, String> {

    // Derived query methods
    Flux<Product> findByCategoryId(String categoryId);
    Flux<Product> findByTagsContaining(String tag);
    Flux<Product> findByPriceBetween(BigDecimal min, BigDecimal max);
    Mono<Product> findBySku(String sku);
    Mono<Long> countByCategoryId(String categoryId);

    // Sort and paginate
    Flux<Product> findByCategoryIdOrderByCreatedAtDesc(String categoryId, Pageable pageable);

    // Exists check
    Mono<Boolean> existsBySku(String sku);
}`}</code></pre>
          </div>
        </div>

        {/* Custom Queries */}
        <div className="section" id="custom-queries">
          <h2 className="section-title">Custom Queries</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Custom @Query with MongoDB JSON syntax</span>
            </div>
            <pre><code>{`public interface ProductRepository extends ReactiveMongoRepository<Product, String> {

    // JSON query syntax
    @Query("{ 'price': { $gte: ?0, $lte: ?1 }, 'stock': { $gt: 0 } }")
    Flux<Product> findAvailableInPriceRange(BigDecimal min, BigDecimal max);

    // $regex for case-insensitive search
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    Flux<Product> searchByName(String keyword);

    // Projection — return only specific fields
    @Query(value = "{ 'categoryId': ?0 }", fields = "{ 'name': 1, 'price': 1, 'sku': 1 }")
    Flux<ProductSummary> findSummaryByCategoryId(String categoryId);

    // Update with @Update  
    @Update("{ $inc: { stock: ?1 } }")
    @Query("{ '_id': ?0 }")
    Mono<Long> incrementStock(String productId, int amount);
}`}</code></pre>
          </div>
        </div>

        {/* Mongo Template */}
        <div className="section" id="mongo-template">
          <h2 className="section-title">ReactiveMongoTemplate</h2>
          <div className="step-content">
            <p>
              For dynamic queries that can't be expressed with derived methods or <code>@Query</code>,
              use <code>ReactiveMongoTemplate</code> with the Spring Data Criteria API.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Dynamic queries with ReactiveMongoTemplate</span>
            </div>
            <pre><code>{`@Service
public class ProductSearchService {

    private final ReactiveMongoTemplate mongoTemplate;

    public ProductSearchService(ReactiveMongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Flux<Product> search(ProductSearchFilter filter) {
        // Build query dynamically based on optional filters
        Query query = new Query();

        if (filter.keyword() != null) {
            query.addCriteria(Criteria.where("name")
                .regex(filter.keyword(), "i"));
        }
        if (filter.categoryId() != null) {
            query.addCriteria(Criteria.where("categoryId")
                .is(filter.categoryId()));
        }
        if (filter.minPrice() != null && filter.maxPrice() != null) {
            query.addCriteria(Criteria.where("price")
                .gte(filter.minPrice()).lte(filter.maxPrice()));
        }
        if (filter.inStockOnly()) {
            query.addCriteria(Criteria.where("stock").gt(0));
        }

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.limit(filter.limit());

        return mongoTemplate.find(query, Product.class);
    }

    // Upsert example
    public Mono<UpdateResult> upsertProductStock(String sku, int newStock) {
        Query query = new Query(Criteria.where("sku").is(sku));
        Update update = new Update()
            .set("stock", newStock)
            .currentDate("updatedAt");
        return mongoTemplate.upsert(query, update, Product.class);
    }
}`}</code></pre>
          </div>
        </div>

        {/* Aggregation */}
        <div className="section" id="aggregation">
          <h2 className="section-title">Aggregation Pipelines</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">MongoDB aggregation with ReactiveMongoTemplate</span>
            </div>
            <pre><code>{`public Flux<CategoryStats> getCategoryStats() {
    TypedAggregation<Product> aggregation = Aggregation.newAggregation(
        Product.class,
        // Stage 1: Filter only in-stock products
        Aggregation.match(Criteria.where("stock").gt(0)),
        // Stage 2: Group by category
        Aggregation.group("categoryId")
            .count().as("productCount")
            .avg("price").as("averagePrice")
            .sum("stock").as("totalStock"),
        // Stage 3: Sort by product count descending
        Aggregation.sort(Sort.by(Sort.Direction.DESC, "productCount")),
        // Stage 4: Rename _id to categoryId in output
        Aggregation.project()
            .and("_id").as("categoryId")
            .andInclude("productCount", "averagePrice", "totalStock")
            .andExclude("_id")
    );

    return mongoTemplate.aggregate(aggregation, CategoryStats.class);
}`}</code></pre>
          </div>
        </div>

        {/* Change Streams */}
        <div className="section" id="change-streams">
          <h2 className="section-title">Change Streams (Real-Time Events)</h2>
          <div className="step-content">
            <p>
              MongoDB change streams let you listen to real-time database events (insert, update, delete).
              Combined with WebFlux, you can push changes to clients via Server-Sent Events or WebSockets.
              Requires a replica set or cloud cluster (not a standalone MongoDB instance).
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Listening to product changes</span>
            </div>
            <pre><code>{`@Service
public class ProductChangeStreamService {

    private final ReactiveMongoTemplate mongoTemplate;

    public Flux<ChangeStreamEvent<Product>> watchProductChanges() {
        ChangeStreamOptions options = ChangeStreamOptions.builder()
            .filter(Aggregation.newAggregation(
                Aggregation.match(Criteria.where("operationType")
                    .in("insert", "update", "replace"))
            ))
            .returnFullDocumentOnUpdate()  // include the full updated document
            .build();

        return mongoTemplate.changeStream("products", options, Product.class);
    }
}

// Expose as SSE endpoint
@GetMapping(value = "/products/live", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<Product>> streamProductChanges() {
    return changeStreamService.watchProductChanges()
        .map(event -> ServerSentEvent.<Product>builder()
            .event(event.getOperationType().getValue())
            .data(event.getBody())
            .build());
}`}</code></pre>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Change streams require a replica set</div>
              Change streams are only available on replica sets and sharded clusters — not standalone
              mongod instances. For local development, use <code>docker run -d -p 27017:27017 mongo --replSet rs0</code>
              and then run <code>rs.initiate()</code> in the mongo shell.
            </div>
          </div>
        </div>

        {/* Indexing */}
        <div className="section" id="indexing">
          <h2 className="section-title">Indexing</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Programmatic index creation</span>
            </div>
            <pre><code>{`@Component
public class MongoIndexInitializer implements ApplicationRunner {

    private final ReactiveMongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        // Compound index
        mongoTemplate.indexOps("products")
            .ensureIndex(new Index()
                .on("categoryId", Sort.Direction.ASC)
                .on("price", Sort.Direction.ASC)
                .named("idx_category_price"))
            .subscribe();

        // Text index for full-text search
        mongoTemplate.indexOps("products")
            .ensureIndex(new TextIndexDefinition.TextIndexDefinitionBuilder()
                .onField("name", 2.0f)   // name has weight 2 (more relevant)
                .onField("description", 1.0f)
                .build())
            .subscribe();

        // TTL index (auto-delete documents after 30 days)
        mongoTemplate.indexOps("sessions")
            .ensureIndex(new Index()
                .on("createdAt", Sort.Direction.ASC)
                .expire(Duration.ofDays(30)))
            .subscribe();
    }
}`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
