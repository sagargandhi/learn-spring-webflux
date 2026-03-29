import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/request-and-response-handling-in-spring-webflux';

export default function RequestAndResponseHandling() {
  return (
    <>
      <SEO
        title="Request and Response Handling in Spring WebFlux"
        description="Deep dive into how Spring WebFlux handles HTTP requests and responses: content negotiation, multipart uploads, file downloads, compression, and codec configuration."
        path={PATH}
        keywords="Spring WebFlux request handling, response handling, content negotiation, multipart, codec, file download"
      />
      <PageLayout
        breadcrumb="Building REST APIs"
        title="Request and Response Handling in Spring WebFlux"
        description="A comprehensive guide to everything involved in handling HTTP requests and building responses in Spring WebFlux — content negotiation, multipart uploads, file downloads, custom codecs, and response compression."
        badge={{ text: 'Intermediate', level: 'intermediate' }}
        readTime="20 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#codecs">HTTP Message Codecs</a></li>
            <li><a href="#content-negotiation">Content Negotiation</a></li>
            <li><a href="#multipart">Multipart File Upload</a></li>
            <li><a href="#file-download">File Download &amp; Streaming</a></li>
            <li><a href="#headers">Reading &amp; Writing Headers</a></li>
            <li><a href="#cookies">Cookies</a></li>
            <li><a href="#compression">Response Compression</a></li>
            <li><a href="#max-body-size">Max In-Memory Buffer Size</a></li>
          </ol>
        </div>

        {/* Codecs */}
        <div className="section" id="codecs">
          <h2 className="section-title">HTTP Message Codecs</h2>
          <div className="step-content">
            <p>
              Spring WebFlux uses <strong>codecs</strong> (implementations of <code>HttpMessageReader</code>
              and <code>HttpMessageWriter</code>) to serialize and deserialize HTTP bodies. Built-in codecs include:
            </p>
            <ul>
              <li><strong>Jackson 2</strong> — JSON and JSON-stream (NDJSON)</li>
              <li><strong>JAXB 2</strong> — XML</li>
              <li><strong>Protobuf</strong> — Protocol Buffers</li>
              <li><strong>String</strong> — plain text</li>
              <li><strong>Form data</strong> — <code>application/x-www-form-urlencoded</code></li>
              <li><strong>Multipart</strong> — <code>multipart/form-data</code></li>
              <li><strong>ByteBuffer / DataBuffer</strong> — raw bytes</li>
            </ul>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Customise codecs in application configuration</span>
            </div>
            <pre><code>{`@Configuration
public class WebFluxConfig implements WebFluxConfigurer {

    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        // Increase the in-memory buffer limit to 10MB (default: 256KB)
        configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024);

        // Enable Jackson's strict null handling
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder()
            .serializationInclusion(JsonInclude.Include.NON_NULL)
            .failOnUnknownProperties(false);

        configurer.defaultCodecs()
            .jackson2JsonEncoder(new Jackson2JsonEncoder(builder.build()));
        configurer.defaultCodecs()
            .jackson2JsonDecoder(new Jackson2JsonDecoder(builder.build()));
    }
}`}</code></pre>
          </div>
        </div>

        {/* Content Negotiation */}
        <div className="section" id="content-negotiation">
          <h2 className="section-title">Content Negotiation</h2>
          <div className="step-content">
            <p>
              Spring WebFlux selects the response codec based on the client's <code>Accept</code> header.
              You declare acceptable produces types on the handler method.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Content negotiation example</span>
            </div>
            <pre><code>{`// Returns JSON or XML depending on Accept header
@GetMapping(value = "/users/{id}",
    produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE })
public Mono<User> getUser(@PathVariable Long id) {
    return userService.findById(id);
}

// Only accepts JSON request body
@PostMapping(value = "/users",
    consumes = MediaType.APPLICATION_JSON_VALUE,
    produces = MediaType.APPLICATION_JSON_VALUE)
public Mono<User> createUser(@RequestBody User user) {
    return userService.save(user);
}

// Stream as NDJSON
@GetMapping(value = "/users/stream",
    produces = MediaType.APPLICATION_NDJSON_VALUE)
public Flux<User> streamUsers() {
    return userService.findAll();
}`}</code></pre>
          </div>
        </div>

        {/* Multipart */}
        <div className="section" id="multipart">
          <h2 className="section-title">Multipart File Upload</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">File upload handler</span>
            </div>
            <pre><code>{`// Single file upload
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Mono<String> uploadFile(@RequestPart("file") FilePart filePart) {
    Path destination = Paths.get("/uploads/" + filePart.filename());
    return filePart.transferTo(destination)
        .thenReturn("Uploaded: " + filePart.filename());
}

// Multiple files
@PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Flux<String> uploadFiles(@RequestPart("files") Flux<FilePart> files) {
    return files.flatMap(file -> {
        Path dest = Paths.get("/uploads/" + file.filename());
        return file.transferTo(dest).thenReturn(file.filename());
    });
}

// Mixed form data and file
@PostMapping(value = "/upload/with-meta", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Mono<String> uploadWithMetadata(
        @RequestPart("file") FilePart file,
        @RequestPart("description") String description) {
    return fileService.store(file, description)
        .map(id -> "Stored file with id: " + id);
}

// Configuration in application.yml
// spring:
//   codec:
//     max-in-memory-size: 10MB   # matches configurer setting`}</code></pre>
          </div>
        </div>

        {/* File download */}
        <div className="section" id="file-download">
          <h2 className="section-title">File Download &amp; Streaming</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">File download endpoint</span>
            </div>
            <pre><code>{`@GetMapping("/files/{filename}")
public Mono<ResponseEntity<Resource>> downloadFile(@PathVariable String filename) {
    return Mono.fromCallable(() -> {
        Path path = Paths.get("/uploads/").resolve(filename);
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return resource;
    })
    .subscribeOn(Schedulers.boundedElastic())
    .map(resource -> ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(resource));
}

// Streaming large file as DataBuffer chunks
@GetMapping("/stream/{filename}")
public Mono<ResponseEntity<Flux<DataBuffer>>> streamFile(
        @PathVariable String filename,
        DataBufferFactory bufferFactory) {
    Path path = Paths.get("/uploads/").resolve(filename);
    Flux<DataBuffer> dataStream = DataBufferUtils
        .read(path, bufferFactory, 4096);

    return Mono.just(ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(dataStream));
}`}</code></pre>
          </div>
        </div>

        {/* Headers */}
        <div className="section" id="headers">
          <h2 className="section-title">Reading &amp; Writing Headers</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Headers in annotated controllers</span>
            </div>
            <pre><code>{`// Read a header with @RequestHeader
@GetMapping("/secure")
public Mono<String> secureEndpoint(
    @RequestHeader("X-Api-Key") String apiKey) {
    return apiKeyService.validate(apiKey)
        .flatMap(valid -> valid
            ? Mono.just("Access granted")
            : Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED)));
}

// Read all headers
@GetMapping("/debug")
public Mono<Map<String, String>> debugHeaders(ServerHttpRequest request) {
    Map<String, String> headers = new HashMap<>();
    request.getHeaders().forEach((k, v) -> headers.put(k, String.join(", ", v)));
    return Mono.just(headers);
}

// Write response headers via ResponseEntity
@GetMapping("/data")
public Mono<ResponseEntity<MyData>> getData() {
    return dataService.get()
        .map(data -> ResponseEntity.ok()
            .header("X-Rate-Limit-Remaining", "99")
            .header("Cache-Control", "max-age=60")
            .body(data));
}`}</code></pre>
          </div>
        </div>

        {/* Cookies */}
        <div className="section" id="cookies">
          <h2 className="section-title">Cookies</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Reading and writing cookies</span>
            </div>
            <pre><code>{`// Read a cookie
@GetMapping("/profile")
public Mono<UserProfile> getProfile(
    @CookieValue(value = "session_id", required = false) String sessionId) {
    if (sessionId == null) {
        return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
    return sessionService.getProfile(sessionId);
}

// Write a cookie via ResponseCookie
@PostMapping("/login")
public Mono<ResponseEntity<Void>> login(@RequestBody LoginRequest req) {
    return authService.login(req)
        .map(token -> {
            ResponseCookie cookie = ResponseCookie.from("session_id", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofHours(24))
                .sameSite("Strict")
                .build();
            return ResponseEntity.ok()
                .<Void>body(null)
                .headers(h -> h.add(HttpHeaders.SET_COOKIE, cookie.toString()));
        });
}`}</code></pre>
          </div>
        </div>

        {/* Compression */}
        <div className="section" id="compression">
          <h2 className="section-title">Response Compression</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">application.yml — enable compression</span>
            </div>
            <pre><code>{`server:
  compression:
    enabled: true
    mime-types: application/json,text/html,text/xml,text/plain
    min-response-size: 2048   # compress responses larger than 2KB`}</code></pre>
          </div>
        </div>

        {/* Max body size */}
        <div className="section" id="max-body-size">
          <h2 className="section-title">Max In-Memory Buffer Size</h2>
          <div className="step-content">
            <p>
              By default Spring WebFlux buffers up to <strong>256KB</strong> of request/response body in memory.
              For larger payloads (file data, bulk requests), increase this limit — or better, stream the
              data without buffering.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">application.yml</span>
            </div>
            <pre><code>{`spring:
  codec:
    max-in-memory-size: 10MB   # increase buffer limit

# Or per-codec in Java config (see Codecs section above)`}</code></pre>
          </div>
          <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div className="info-box-content">
              <div className="info-box-title">Don't over-buffer large payloads</div>
              For large file uploads, use <code>FilePart.transferTo()</code> or stream the body as
              <code> DataBuffer</code> chunks. Increasing the buffer limit to 100MB means all of that
              data lives in heap memory simultaneously — this defeats the purpose of reactive streaming.
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
