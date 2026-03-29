import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/server-sent-events-and-websockets-in-spring-webflux';

export default function ServerSentEventsWebSockets() {
  return (
    <>
      <SEO
        title="Server-Sent Events and WebSockets in Spring WebFlux"
        description="Build real-time applications with Spring WebFlux: Server-Sent Events using Flux and TEXT_EVENT_STREAM, ServerSentEvent builder, WebSocket handlers, bidirectional messaging, and heartbeat pings."
        path={PATH}
        keywords="SSE Spring WebFlux, Server-Sent Events, WebSocket Spring WebFlux, TEXT_EVENT_STREAM, reactive real-time"
      />
      <PageLayout
        breadcrumb="Advanced Topics"
        title="Server-Sent Events and WebSockets in Spring WebFlux"
        description="Spring WebFlux has first-class support for real-time streaming via Server-Sent Events (SSE) and WebSockets. SSE is ideal for one-way server-to-client streams; WebSockets enable full bidirectional communication. Both are naturally expressed as reactive streams."
        badge={{ text: 'Advanced', level: 'advanced' }}
        readTime="22 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#sse-basics">SSE — Basic Flux Streaming</a></li>
            <li><a href="#sse-builder">Using the ServerSentEvent Builder</a></li>
            <li><a href="#sse-broadcast">Broadcasting to Multiple Clients</a></li>
            <li><a href="#sse-heartbeat">Heartbeat / Keep-Alive</a></li>
            <li><a href="#ws-handler">WebSocket Handler</a></li>
            <li><a href="#ws-config">Registering WebSocket Handlers</a></li>
            <li><a href="#ws-bidirectional">Bidirectional Messaging</a></li>
            <li><a href="#ws-security">Securing WebSocket Endpoints</a></li>
            <li><a href="#client-reconnect">Client Reconnection (JavaScript)</a></li>
          </ol>
        </div>

        {/* SSE Basics */}
        <div className="section" id="sse-basics">
          <h2 className="section-title">SSE — Basic Flux Streaming</h2>
          <div className="step-content">
            <p>
              Server-Sent Events (SSE) is an HTTP-based protocol where the server sends a stream of
              events to the client over a single long-lived connection. In Spring WebFlux, returning
              a <code>Flux&lt;T&gt;</code> with <code>MediaType.TEXT_EVENT_STREAM_VALUE</code> produces
              an SSE stream automatically.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">StockPriceController.java — SSE endpoint</span>
            </div>
            <pre><code>{`@RestController
@RequestMapping("/api/stocks")
public class StockPriceController {

    private final StockPriceService priceService;

    // Simple Flux<T> stream — each item becomes "data: <json>\n\n"
    @GetMapping(value = "/prices", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<StockPrice> streamPrices() {
        return priceService.getPriceStream();
    }

    // Stream of a single stock with path variable
    @GetMapping(value = "/{symbol}/price", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<StockPrice> streamStockPrice(@PathVariable String symbol) {
        return priceService.getPriceStream(symbol)
            .delayElements(Duration.ofMillis(500));  // Throttle to 2 events/sec
    }
}

// Simulated price stream using Flux.interval
@Service
public class StockPriceService {
    private final Random rng = new Random();

    public Flux<StockPrice> getPriceStream(String symbol) {
        double basePrice = 100.0;
        return Flux.interval(Duration.ofMillis(500))
            .map(tick -> new StockPrice(
                symbol,
                Math.round((basePrice + rng.nextGaussian() * 2) * 100.0) / 100.0,
                Instant.now()));
    }
}`}</code></pre>
          </div>
        </div>

        {/* SSE Builder */}
        <div className="section" id="sse-builder">
          <h2 className="section-title">Using the ServerSentEvent Builder</h2>
          <div className="step-content">
            <p>
              For full SSE protocol control — including event ID, event name, and retry interval —
              use <code>ServerSentEvent&lt;T&gt;</code> as the return type.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">ServerSentEvent with metadata</span>
            </div>
            <pre><code>{`@GetMapping(value = "/live-feed", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<StockPrice>> streamFeed() {
    AtomicLong idCounter = new AtomicLong(0);

    return priceService.getPriceStream("AAPL")
        .map(price -> ServerSentEvent.<StockPrice>builder()
            .id(String.valueOf(idCounter.incrementAndGet()))  // Event ID
            .event("price-update")       // Event type (client uses addEventListener)
            .data(price)                 // Payload — serialized to JSON
            .retry(Duration.ofSeconds(5))  // Tell client to reconnect after 5s
            .comment("AAPL live price update")
            .build());
}

// Error and completion events
@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> streamWithControl() {
    return Flux.interval(Duration.ofSeconds(1))
        .take(30)
        .map(tick -> ServerSentEvent.<String>builder()
            .event("tick")
            .data("Tick " + tick)
            .build())
        .concatWith(Mono.just(ServerSentEvent.<String>builder()
            .event("done")
            .data("Stream completed")
            .build()));
}`}</code></pre>
          </div>
        </div>

        {/* Broadcast */}
        <div className="section" id="sse-broadcast">
          <h2 className="section-title">Broadcasting to Multiple Clients</h2>
          <div className="step-content">
            <p>
              Use <code>Sinks.Many</code> from Reactor to create a shared, multicast hot publisher.
              Every SSE subscriber receives the same events.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Multicast SSE with Sinks.Many</span>
            </div>
            <pre><code>{`@Service
public class NotificationSink {

    // multicast() allows multiple subscribers, replays nothing to late subscribers
    private final Sinks.Many<Notification> sink = Sinks.many()
        .multicast()
        .onBackpressureBuffer(1024);

    // Push events (called from your business logic)
    public void publish(Notification notification) {
        sink.tryEmitNext(notification);
    }

    // Expose as a cold Flux for SSE endpoints
    public Flux<Notification> getStream() {
        return sink.asFlux()
            .onBackpressureDrop();  // Drop events if a slow client can't keep up
    }
}

@RestController
public class NotificationController {

    private final NotificationSink notificationSink;

    @GetMapping(value = "/notifications/stream",
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Notification>> streamNotifications() {
        return notificationSink.getStream()
            .map(n -> ServerSentEvent.<Notification>builder()
                .event("notification")
                .data(n)
                .build());
    }
}`}</code></pre>
          </div>
        </div>

        {/* WebSocket Handler */}
        <div className="section" id="ws-handler">
          <h2 className="section-title">WebSocket Handler</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">EchoWebSocketHandler.java</span>
            </div>
            <pre><code>{`@Component
public class EchoWebSocketHandler implements WebSocketHandler {

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        // session.receive() — Flux of incoming messages
        // session.send()    — Mono<Void> that drains a Flux of outgoing messages

        // Echo handler: receive each message and send it back
        Flux<WebSocketMessage> output = session.receive()
            .map(msg -> {
                String text = msg.getPayloadAsText();
                return session.textMessage("Echo: " + text);
            });

        return session.send(output)
            .doOnSubscribe(s -> log.info("WebSocket connected: {}", session.getId()))
            .doFinally(signal -> log.info("WebSocket closed: {}", session.getId()));
    }
}`}</code></pre>
          </div>
        </div>

        {/* WS Config */}
        <div className="section" id="ws-config">
          <h2 className="section-title">Registering WebSocket Handlers</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">WebSocketConfig.java</span>
            </div>
            <pre><code>{`@Configuration
public class WebSocketConfig {

    private final EchoWebSocketHandler echoHandler;
    private final ChatWebSocketHandler chatHandler;

    @Bean
    public HandlerMapping webSocketHandlerMapping() {
        Map<String, WebSocketHandler> handlersMap = new HashMap<>();
        handlersMap.put("/ws/echo", echoHandler);
        handlersMap.put("/ws/chat/{room}", chatHandler);

        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
        mapping.setUrlMap(handlersMap);
        mapping.setOrder(-1);   // Higher priority than @RequestMapping handlers
        return mapping;
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}`}</code></pre>
          </div>
        </div>

        {/* Bidirectional */}
        <div className="section" id="ws-bidirectional">
          <h2 className="section-title">Bidirectional Messaging</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Chat room WebSocket handler</span>
            </div>
            <pre><code>{`@Component
public class ChatWebSocketHandler implements WebSocketHandler {

    // One Sink per chat room — stored in a concurrent map
    private final Map<String, Sinks.Many<String>> rooms = new ConcurrentHashMap<>();

    private Sinks.Many<String> getRoomSink(String roomId) {
        return rooms.computeIfAbsent(roomId, id ->
            Sinks.many().multicast().onBackpressureBuffer(256));
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String roomId = extractRoomId(session.getHandshakeInfo().getUri());
        Sinks.Many<String> roomSink = getRoomSink(roomId);

        // Receive: publish each incoming message to the room sink
        Mono<Void> receive = session.receive()
            .map(WebSocketMessage::getPayloadAsText)
            .doOnNext(message -> roomSink.tryEmitNext(message))
            .then();

        // Send: subscribe to the room sink and forward messages to this session
        Flux<WebSocketMessage> outbound = roomSink.asFlux()
            .map(session::textMessage);

        Mono<Void> send = session.send(outbound);

        // Run receive and send concurrently — session ends when either completes
        return Mono.zip(receive, send).then();
    }

    private String extractRoomId(java.net.URI uri) {
        String path = uri.getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }
}`}</code></pre>
          </div>
        </div>

        {/* Client reconnect */}
        <div className="section" id="client-reconnect">
          <h2 className="section-title">Client Reconnection (JavaScript)</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">javascript</span>
              <span className="code-block-filename">Browser client — SSE and WebSocket</span>
            </div>
            <pre><code>{`// --- SSE client with auto-reconnect ---
const eventSource = new EventSource('/api/stocks/live-feed', { withCredentials: true });

eventSource.addEventListener('price-update', (event) => {
    const price = JSON.parse(event.data);
    console.log('Price update:', price);
});

eventSource.addEventListener('error', (event) => {
    console.error('SSE error, browser will auto-reconnect');
    // EventSource reconnects automatically using the 'retry' field sent by the server
});

// --- WebSocket client ---
let ws;
function connectWebSocket() {
    ws = new WebSocket('ws://localhost:8080/ws/chat/room1');

    ws.onopen = () => console.log('Connected');
    ws.onmessage = (event) => console.log('Received:', event.data);
    ws.onclose = (event) => {
        console.log('Disconnected. Reconnecting in 3s...');
        setTimeout(connectWebSocket, 3000);   // Manual reconnect
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);
}

connectWebSocket();

// Send a message
ws.send(JSON.stringify({ text: 'Hello, room!' }));`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
