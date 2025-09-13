import { LogEvent, AnomalyLevel } from './log-parser';

/**
 * Signature structure:
 * - pattern: RegExp to match text
 * - weight: numeric weight (higher -> more critical)
 * - note: optional description
 */
type Signature = { pattern: RegExp; weight: number; note?: string };

/**
 * Dictionary of signatures.
 * - weight >= 3 => heavy (pushes to HIGH quickly)
 * - weight == 2 => medium
 * - weight == 1 => minor signal
 *
 * This dictionary covers generic and many platform-specific cases.
 * Add/adjust items as you discover new failure patterns.
 */
const SIGNATURES: Signature[] = [
  // === Critical (weight 4) ===
  { pattern: /\b(error|failed|fail|exception|panic|fatal|crash|unhandled exception|segfault|core dumped)\b/i, weight: 4, note: 'Generic fatal keywords' },
  { pattern: /\b(oom killed|outofmemoryerror|out of memory|oom)\b/i, weight: 4, note: 'OOM / container killed' },
  { pattern: /\b(segmentation fault|SIGSEGV|stack overflow|stackoverflow)\b/i, weight: 4, note: 'native crash' },
  { pattern: /\b(connection refused|ECONNREFUSED)\b/i, weight: 4, note: 'conn refused' },
  { pattern: /\b(quorum lost|cluster partitioned|not a member of cluster|no master)\b/i, weight: 4, note: 'cluster/quorum' },
  { pattern: /\b(certificate (expired|is expired|has expired)|certificate verify failed|certificate revoked|tls: handshake failure)\b/i, weight: 4, note: 'cert/ TLS critical' },
  { pattern: /\b(time\swait|timeout|timed out)\b/i, weight: 4, note: 'timeouts (network/api)' },
  { pattern: /\b(disk full|ENOSPC|no space left on device|filesystem read-only)\b/i, weight: 4, note: 'disk full' },
  { pattern: /\b(database is locked|deadlock detected|deadlock found|lock timeout|could not connect to server)\b/i, weight: 4, note: 'db deadlock/conn' },
  { pattern: /\b(http\/1\.[01]"\s5\d{2}\b|status[=:]\s?5\d{2}\b|\"status\":\s?5\d{2})/i, weight: 4, note: '5xx HTTP' },
  { pattern: /\b(auth failed|authentication failed|invalid credentials|permission denied|authorization failed|403 forbidden|status[=:]\s?401\b)/i, weight: 4, note: 'auth errors (401/403 flagged critical)' },

  // === High but less than fatal (weight 3) ===
  { pattern: /\b(rate limit|throttle|429 too many requests|quota exceeded)\b/i, weight: 3, note: 'rate limit / throttling' },
  { pattern: /\b(service unavailable|503 service unavailable|upstream error|bad gateway|502|504 gateway timeout)\b/i, weight: 3, note: 'gateway/upstream' },
  { pattern: /\b(redis.*(OOM|out of memory|busy|no memory|connection lost))\b/i, weight: 3, note: 'Redis problems' },
  { pattern: /rabbitmq|amqp|failed to fetch overview|management api|rabbit@/i, weight: 3, note: 'RabbitMQ monitoring/api issues' },
  { pattern: /\b(node .* down|node down|node unavailable)\b/i, weight: 3, note: 'node down' },
  { pattern: /\b(io error|i\/o error|I\/O error|disk I\/O)\b/i, weight: 3, note: 'I/O errors' },

  // === Medium (weight 2) ===
  { pattern: /\b(warn|warning|slow|latency|degraded|unhealthy)\b/i, weight: 2, note: 'generic warning / degraded performance' },
  { pattern: /\b(timeout while connecting|connect timeout|request timeout)\b/i, weight: 2, note: 'timeouts (medium)' },
  { pattern: /\b(authz required|forbidden|403)\b/i, weight: 2, note: '403 forbidden (medium)' },
  { pattern: /\b(cache miss|cache invalidation|cache exceeded|cache error)\b/i, weight: 2, note: 'cache issues' },
  { pattern: /\b(throttled|backpressure|too many open files|EMFILE)\b/i, weight: 2, note: 'resource / backpressure' },
  { pattern: /\b(deprecation warning|deprecated api)\b/i, weight: 2, note: 'deprecation' },

  // === Low / signals (weight 1) ===
  { pattern: /\b(info|ok|started|listening|connected)\b/i, weight: 1, note: 'informational / normal' },
  { pattern: /\b(retry|retries|redeliver|requeue)\b/i, weight: 1, note: 'retry/redelivery indicators' },
  { pattern: /\b(rate:\s?\d+(\.\d+)?|details)\b/i, weight: 1, note: 'metrics present' },

  // === Special: HTTP codes by numeric check will be handled separately ===
];

/**
 * Additional numeric metric heuristics for certain platforms (optional).
 * If these thresholds exceeded -> add weight influence.
 */
const METRIC_HEURISTICS = [
  { path: ['message_stats', 'drop_unroutable'], threshold: 10000, weight: 3, note: 'lots of unroutable messages (RabbitMQ)' },
  { path: ['queue_totals', 'messages'], threshold: 100000, weight: 3, note: 'huge backlog' },
  { path: ['disk_writes'], threshold: 1e9, weight: 2, note: 'extensive disk writes' }, // example
];

/**
 * Extracts text blobs from an event to be checked with regexes.
 * We include: event_type, status, host, service, application, correlation_id,
 * payload.message, payload.rawOperationalData, payload.operationalData (stringified),
 * entire payload JSON.
 */
function flattenEventToText(event: LogEvent): string {
  const parts: string[] = [];

  if (event.event_type) parts.push(String(event.event_type));
  if (event.status) parts.push(String(event.status));
  if (event.host) parts.push(String(event.host));
  if (event.service) parts.push(String(event.service));
  if (event.application) parts.push(String(event.application));
  if (event.correlation_id) parts.push(String(event.correlation_id));
  if (event.payload) {
    // common fields
    const p = event.payload;
    if (typeof p['message'] === 'string') parts.push(p['message']);
    if (typeof p['rawOperationalData'] === 'string') parts.push(p['rawOperationalData']);
    if (typeof p['error'] === 'string') parts.push(p['error']);
    if (typeof p['stack'] === 'string') parts.push(p['stack']);
    // stringify remainder (safe)
    try {
      parts.push(JSON.stringify(p));
    } catch {
      // ignore
    }
  }

  return parts.join(' \n ').toLowerCase();
}

/** Helper to safe-get nested metric */
function getNested(obj: any, path: string[]) {
  let cur = obj;
  for (const p of path) {
    if (!cur) return undefined;
    cur = cur[p];
  }
  return cur;
}

/**
 * Main function: returns 'high' | 'medium' | 'normal'
 */
export function getAnomalyLevel(event: LogEvent): AnomalyLevel {
  // score accumulates weights from matches
  let score = 0;

  const text = flattenEventToText(event);

  // 1) Quick numeric HTTP/status checks in payload (common patterns)
  // Look for typical fields: status, statusCode, httpStatus, responseCode
  const statusCandidates = [
    event.status,
    event.payload && (event.payload['status'] ?? event.payload['statusCode'] ?? event.payload['httpStatus'] ?? event.payload['responseCode']),
  ];

  for (const s of statusCandidates) {
    if (!s) continue;
    const sn = String(s).toLowerCase();
    const num = parseInt(String(s).replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      if (num >= 500 && num < 600) {
        score += 4; // 5xx critical
      } else if (num === 401 || num === 403) {
        score += 4; // treat auth problems as critical per requirement
      } else if (num >= 400 && num < 500) {
        score += 2; // other 4xx -> medium
      } else if (num >= 300 && num < 400) {
        score += 1; // redirects = low
      }
    } else {
      // textual status like "warning" / "error"
      if (sn.includes('error') || sn.includes('fail') || sn.includes('exception')) score += 4;
      else if (sn.includes('warn')) score += 2;
    }
  }

  // 2) Regex signatures
  for (const sig of SIGNATURES) {
    if (sig.pattern.test(text)) {
      score += sig.weight;
      // small optimization: if already super-high, can break early
      if (score >= 7) break;
    }
  }

  // 3) Metric heuristics from payload.operationalData (if present)
  if (event.payload && typeof event.payload === 'object') {
    for (const h of METRIC_HEURISTICS) {
      const val = getNested(event.payload, h.path);
      if (typeof val === 'number' && val >= h.threshold) {
        score += h.weight;
      }
    }
  }

  // 4) Thresholds -> map to levels
  // Tune these thresholds as you collect real incidents.
  if (score >= 6) return AnomalyLevel.HIGH;
  if (score >= 3) return AnomalyLevel.MEDIUM;
  console.log('Anomaly score:', score, '-> normal');
  return AnomalyLevel.NORMAL;
}