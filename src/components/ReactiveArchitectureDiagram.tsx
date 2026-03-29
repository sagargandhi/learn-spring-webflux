export default function ReactiveArchitectureDiagram() {
  return (
    <div className="arch-diagram" aria-label="Spring WebFlux reactive architecture diagram">
      <svg
        viewBox="0 0 860 220"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gradClient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <linearGradient id="gradNetty" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
          <linearGradient id="gradReactor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
          <linearGradient id="gradData" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
          </marker>
          <filter id="shadow" x="-5%" y="-5%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000015" />
          </filter>
        </defs>

        {/* ── Connecting arrows ── */}
        <line x1="148" y1="110" x2="190" y2="110" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
        <line x1="348" y1="110" x2="390" y2="110" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
        <line x1="548" y1="110" x2="590" y2="110" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />

        {/* ── Return arrows (dotted) ── */}
        <line x1="190" y1="122" x2="148" y2="122" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow)" />
        <line x1="390" y1="122" x2="348" y2="122" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow)" />
        <line x1="590" y1="122" x2="548" y2="122" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow)" />

        {/* ── BOX 1: Client ── */}
        <rect x="12" y="62" width="136" height="96" rx="12" fill="url(#gradClient)" stroke="#93c5fd" strokeWidth="1.5" filter="url(#shadow)" />
        <text x="80" y="95" textAnchor="middle" fontSize="22">🌐</text>
        <text x="80" y="118" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e40af">HTTP Client</text>
        <text x="80" y="134" textAnchor="middle" fontSize="10" fill="#3b82f6">Browser · Mobile · API</text>
        <text x="80" y="148" textAnchor="middle" fontSize="10" fill="#3b82f6">HTTP / WebSocket / SSE</text>

        {/* ── BOX 2: Netty + WebFlux ── */}
        <rect x="198" y="38" width="150" height="144" rx="12" fill="url(#gradNetty)" stroke="#c4b5fd" strokeWidth="1.5" filter="url(#shadow)" />
        <text x="273" y="72" textAnchor="middle" fontSize="22">⚡</text>
        <text x="273" y="95" textAnchor="middle" fontSize="12" fontWeight="700" fill="#5b21b6">Spring WebFlux</text>
        <text x="273" y="111" textAnchor="middle" fontSize="10" fill="#7c3aed">Netty Event Loop</text>
        <rect x="214" y="120" width="118" height="18" rx="4" fill="rgba(139,92,246,0.12)" />
        <text x="273" y="133" textAnchor="middle" fontSize="9.5" fill="#6d28d9">@RestController / RouterFunction</text>
        <rect x="214" y="144" width="118" height="18" rx="4" fill="rgba(139,92,246,0.12)" />
        <text x="273" y="157" textAnchor="middle" fontSize="9.5" fill="#6d28d9">WebFilterChain · Security</text>

        {/* ── BOX 3: Project Reactor ── */}
        <rect x="398" y="38" width="150" height="144" rx="12" fill="url(#gradReactor)" stroke="#6ee7b7" strokeWidth="1.5" filter="url(#shadow)" />
        <text x="473" y="72" textAnchor="middle" fontSize="22">🔄</text>
        <text x="473" y="95" textAnchor="middle" fontSize="12" fontWeight="700" fill="#14532d">Project Reactor</text>
        <text x="473" y="111" textAnchor="middle" fontSize="10" fill="#15803d">Non-blocking Pipelines</text>
        <rect x="414" y="120" width="118" height="18" rx="4" fill="rgba(34,197,94,0.12)" />
        <text x="473" y="133" textAnchor="middle" fontSize="9.5" fill="#166534">Mono&lt;T&gt; · Flux&lt;T&gt;</text>
        <rect x="414" y="144" width="118" height="18" rx="4" fill="rgba(34,197,94,0.12)" />
        <text x="473" y="157" textAnchor="middle" fontSize="9.5" fill="#166534">map · flatMap · filter · zip</text>

        {/* ── BOX 4: Data Layer ── */}
        <rect x="598" y="38" width="250" height="144" rx="12" fill="url(#gradData)" stroke="#fcd34d" strokeWidth="1.5" filter="url(#shadow)" />
        <text x="723" y="72" textAnchor="middle" fontSize="22">🗄️</text>
        <text x="723" y="95" textAnchor="middle" fontSize="12" fontWeight="700" fill="#78350f">Reactive Data Layer</text>
        <text x="723" y="111" textAnchor="middle" fontSize="10" fill="#92400e">Backpressure-aware sources</text>

        {/* Three data source tags */}
        <rect x="614" y="122" width="68" height="18" rx="4" fill="rgba(234,179,8,0.18)" />
        <text x="648" y="135" textAnchor="middle" fontSize="9.5" fill="#854d0e">R2DBC / PG</text>

        <rect x="689" y="122" width="68" height="18" rx="4" fill="rgba(234,179,8,0.18)" />
        <text x="723" y="135" textAnchor="middle" fontSize="9.5" fill="#854d0e">MongoDB</text>

        <rect x="764" y="122" width="68" height="18" rx="4" fill="rgba(234,179,8,0.18)" />
        <text x="798" y="135" textAnchor="middle" fontSize="9.5" fill="#854d0e">Redis (Lettuce)</text>

        <rect x="614" y="146" width="218" height="18" rx="4" fill="rgba(234,179,8,0.18)" />
        <text x="723" y="159" textAnchor="middle" fontSize="9.5" fill="#854d0e">WebClient · Kafka · Spring Data Reactive</text>

        {/* ── Arrow labels ── */}
        <text x="169" y="107" textAnchor="middle" fontSize="9" fill="#64748b">request</text>
        <text x="369" y="107" textAnchor="middle" fontSize="9" fill="#64748b">Mono/Flux</text>
        <text x="569" y="107" textAnchor="middle" fontSize="9" fill="#64748b">query</text>
        <text x="169" y="133" textAnchor="middle" fontSize="9" fill="#94a3b8">response</text>
        <text x="369" y="133" textAnchor="middle" fontSize="9" fill="#94a3b8">stream</text>
        <text x="569" y="133" textAnchor="middle" fontSize="9" fill="#94a3b8">publisher</text>
      </svg>

      <p className="arch-caption">
        Reactive request flow — non-blocking end to end, from HTTP client to data source
      </p>
    </div>
  );
}
