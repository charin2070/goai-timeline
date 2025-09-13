// lib/log-parser.ts
import crypto from "crypto";

export enum FilterLevel {
  ALL = "all",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical"
}

/**
 * Уровни аномалий, которые ожидает UI (event-viewer-modal).
 */
export enum AnomalyLevel {
  NONE = "none",
  INFO = "none",
  HIGH = "high",
  MEDIUM = "medium",
  NORMAL = "normal",
  ERROR = "high",
  CRITICAL = "high",
  WARNING = "warning"
}

/**
 * severity (внутренний) — мапим в AnomalyLevel
 */
export type Severity = "debug" | "info" | "warning" | "error" | "critical";

export interface LogEvent {
  // базовые
  id: string;
  type: string;           // machine-friendly (например "message_stats.publish")
  event_type?: string;    // legacy / UI-friendly (часто ждут именно event_type)
  message: string;
  severity: Severity;
  anomalyLevel?: AnomalyLevel;

  // временные метки / source
  timestamp?: string;     // ISO
  created_at?: string;    // иногда UI ожидает created_at
  source?: { raw?: string; node?: string; file?: string; [k: string]: any };

  // payload / данные
  data?: Record<string, any>; // оригинальный объект
  payload?: any;              // alias для compatibility

  // дополнительные поля, которые UI запрашивал
  status?: string;        // e.g. "ok" | "warning" | "failed"
  host?: string;
  service?: string;
  application?: string;

  // extensible
  [k: string]: any;
}

/**
 * Parser config (наиболее важные настройки вынесены)
 */
export interface ParserConfig {
  maskFields?: string[];
  thresholds?: {
    messagesUnacknowledgedWarning?: number;
    messagesUnacknowledgedCritical?: number;
    dropUnroutableWarning?: number;
    dropUnroutableCritical?: number;
    publishRateWarning?: number;
  };
  emitEvents?: boolean;
  maxDepth?: number;
}

/**
 * Простой LogParser
 */
export class LogParser {
  config: ParserConfig;

  constructor(config?: Partial<ParserConfig>) {
    this.config = {
      maskFields: ["keyfile", "certfile", "cacertfile", "ip"],
      thresholds: {
        messagesUnacknowledgedWarning: 100,
        messagesUnacknowledgedCritical: 1000,
        dropUnroutableWarning: 10,
        dropUnroutableCritical: 100,
        publishRateWarning: 1000,
      },
      maxDepth: 10,
      ...config,
    };
  }

  /**
   * Точка входа: принимает строку operationDataString и возвращает LogEvent[]
   */
  public getEventsFromOperationData(operationDataString: string): LogEvent[] {
    let jsonString = operationDataString;
    let parsedJsonSuccessfully = false;

    const opIndex = operationDataString.search(/Operational data:\s*/i);
    if (opIndex !== -1) {
      const firstBrace = operationDataString.indexOf('{', opIndex);
      if (firstBrace !== -1) {
        let braceCount = 0;
        let jsonEnd = -1;
        for (let i = firstBrace; i < operationDataString.length; i++) {
          const ch = operationDataString[i];
          if (ch === '{') braceCount++;
          else if (ch === '}') braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
        if (jsonEnd !== -1) {
          jsonString = operationDataString.slice(firstBrace, jsonEnd + 1);
          const parsed = this.safeParseOperationData(jsonString);
          if (!parsed.error) {
            parsedJsonSuccessfully = true;
            return this.getEventsFromOperationDataObj(parsed.value);
          }
        }
      }
    }

    // If JSON extraction failed or was not found, try parsing as plain text lines
    if (!parsedJsonSuccessfully) {
      const events: LogEvent[] = [];
      const lines = operationDataString.split(/\r?\n/);
      lines.forEach(line => {
        const parsedEvent = this.parseLogLine(line);
        if (parsedEvent) {
          events.push(parsedEvent);
        } else if (line.trim() !== '') {
          // If a line cannot be parsed by regex, treat it as a generic log message
          events.push(this.makeEvent({
            type: "log.message",
            message: line,
            severity: "info",
            data: { rawLine: line },
          }));
        }
      });
      return events;
    }

    // Fallback if something unexpected happens (should not be reached with the above logic)
    return [this.makeEvent({
      type: "parse.error",
      message: "Unknown parsing error",
      severity: "error",
      data: { originalSnippet: operationDataString?.slice(0, 1000) },
    })];
  }

  /***********************
   * Internal helpers
   ***********************/
  private makeEvent(partial: Partial<LogEvent>): LogEvent {
    const severity = partial.severity || "info";
    const anomalyLevel = this.mapSeverityToAnomaly(severity);
    const msg = partial.message || "";
    const id = partial.id || crypto.createHash("md5").update(msg + Date.now().toString()).digest("hex");
    const timestamp = partial.timestamp || new Date().toISOString();

    const ev: LogEvent = {
      id,
      type: partial.type || partial.event_type || "unknown",
      event_type: partial.event_type || partial.type || "unknown",
      message: msg,
      severity,
      anomalyLevel,
      timestamp,
      created_at: partial.created_at || timestamp,
      source: partial.source,
      data: partial.data,
      payload: partial.payload ?? partial.data,
      status: partial.status,
      host: partial.host,
      service: partial.service,
      application: partial.application,
      ...partial,
    };
    return ev;
  }

  private mapSeverityToAnomaly(s: Severity): AnomalyLevel {
    switch (s) {
      case "debug":
      case "info":
        return AnomalyLevel.INFO;
      case "warning":
        return AnomalyLevel.WARNING;
      case "error":
        return AnomalyLevel.ERROR;
      case "critical":
        return AnomalyLevel.CRITICAL;
      default:
        return AnomalyLevel.NONE;
    }
  }

  public parse(content: string, mode: string = "auto"): LogEvent[] {
  return this.getEventsFromOperationData(content);
}

  /**
   * Основная логика: превращаем parsed object в LogEvent[]
   */
  private getEventsFromOperationDataObj(parsed: any): LogEvent[] {
    const evts: LogEvent[] = [];

    // system summary
    if (parsed.product_name || parsed.product_version) {
      evts.push(this.makeEvent({
        type: "system.summary",
        message: `${parsed.product_name || "product"} v${parsed.product_version || "?"}`,
        severity: "info",
        data: { product_name: parsed.product_name, product_version: parsed.product_version },
        host: parsed.node,
        service: parsed.product_name,
        application: parsed.product_name,
        source: { node: parsed.node },
      }));
    }

    // message_stats -> детализируем
    if (parsed.message_stats && typeof parsed.message_stats === "object") {
      const ms = parsed.message_stats;
      for (const [k, v] of Object.entries(ms)) {
        if (k.endsWith("_details") && v && typeof v === "object") {
          const rate = (v as any).rate;
          evts.push(this.makeEvent({
            type: `message_stats.${k}`,
            message: `message_stats.${k} rate=${String(rate)}`,
            severity: typeof rate === "number" && rate > (this.config.thresholds?.publishRateWarning || 1000) ? "warning" : "info",
            data: { key: k, value: v },
            payload: v,
          }));
        } else if (typeof v === "number") {
          evts.push(this.makeEvent({
            type: `message_stats.${k}`,
            message: `message_stats.${k}=${v}`,
            severity: "info",
            data: { key: k, value: v },
            payload: v,
          }));
        } else {
          evts.push(this.makeEvent({
            type: `message_stats.${k}`,
            message: `message_stats.${k}`,
            severity: "debug",
            data: v as any,
            payload: v,
          }));
        }
      }

      // quick anomaly: drop_unroutable
      const du = (parsed.message_stats as any).drop_unroutable;
      if (typeof du === "number") {
        const sev: Severity = du >= (this.config.thresholds?.dropUnroutableCritical || 100) ? "critical" :
                              du >= (this.config.thresholds?.dropUnroutableWarning || 10) ? "warning" : "info";
        evts.push(this.makeEvent({
          type: "anomaly.drop_unroutable",
          message: `drop_unroutable=${du}`,
          severity: sev,
          data: { value: du },
        }));
      }
    }

    // queue_totals
    if (parsed.queue_totals && typeof parsed.queue_totals === "object") {
      const qt = parsed.queue_totals;
      for (const [k, v] of Object.entries(qt)) {
        if (k === "messages_unacknowledged" && typeof v === "number") {
          const sev: Severity =
            v >= (this.config.thresholds?.messagesUnacknowledgedCritical || 1000) ? "critical" :
            v >= (this.config.thresholds?.messagesUnacknowledgedWarning || 100) ? "warning" : "info";
          evts.push(this.makeEvent({
            type: `queue_totals.${k}`,
            message: `${k}=${v}`,
            severity: sev,
            data: { key: k, value: v },
          }));
        } else {
          evts.push(this.makeEvent({
            type: `queue_totals.${k}`,
            message: `${k}=${String(v)}`,
            severity: "info",
            data: { key: k, value: v },
          }));
        }
      }
    }

    // listeners
    if (Array.isArray(parsed.listeners)) {
      parsed.listeners.forEach((l: any, idx: number) => {
        evts.push(this.makeEvent({
          type: `listener.${idx}`,
          message: `listener ${l.protocol || "?"} ${l.ip_address || ""}:${l.port || ""}`,
          severity: "debug",
          data: l,
        }));
      });
    }

    // contexts
    if (Array.isArray(parsed.contexts)) {
      parsed.contexts.forEach((c: any, idx: number) => {
        evts.push(this.makeEvent({
          type: `context.${idx}`,
          message: `context ${c.description || "?"} node=${c.node || "?"}`,
          severity: "debug",
          data: c,
        }));
      });
    }

    return evts;
  }

  private parseLogLine(line: string): LogEvent | null {
    const logRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\s+([A-Z]+)\s+\[([^\]]+)\]\s+(.*)$/;
    const match = line.match(logRegex);

    if (!match) {
      return null;
    }

    const [, timestampStr, levelStr, sourceStr, message] = match;

    let severity: Severity = "info";
    switch (levelStr.toLowerCase()) {
      case "debug":
        severity = "debug";
        break;
      case "info":
        severity = "info";
        break;
      case "warn":
      case "warning":
        severity = "warning";
        break;
      case "error":
        severity = "error";
        break;
      case "crit":
      case "critical":
        severity = "critical";
        break;
    }

    return this.makeEvent({
      type: "log.line",
      event_type: "log.message",
      message: message.trim(),
      severity: severity,
      timestamp: new Date(timestampStr).toISOString(),
      source: { raw: sourceStr.trim() },
      data: { rawLine: line },
    });
  }

  /** Попытки "распаковать" вложенный JSON из поля message */
  private safeParseOperationData(s: string): { error?: Error; value?: any } {
    try {
      const outer = JSON.parse(s);

      // Case 1: outer.message is a string containing JSON (original assumption)
      if (typeof outer.message === "string") {
        const innerResult = this.tryParseNestedJsonString(outer.message);
        if (innerResult.error) return { error: innerResult.error };
        const merged = { ...outer, ...innerResult.value };
        return { value: merged };
      }
      // Case 2: outer.message is already an object
      else if (typeof outer.message === "object" && outer.message !== null) {
        const merged = { ...outer, ...outer.message };
        return { value: merged };
      }
      // Case 3: 's' itself is the operational data (i.e., no 'message' field, or 'message' is not a string/object)
      else {
        return { value: outer }; // Treat the outer object as the operational data
      }
    } catch (err) {
      return { error: err as Error };
    }
  }

  private tryParseNestedJsonString(s: string): { error?: Error; value?: any } {
    // 1) прямой parse
    try {
      return { value: JSON.parse(s) };
    } catch { /* continue */ }

    // 2) unescape common sequences
    try {
      const unesc = s.replace(/\"/g, '"').replace(/\\n/g, "\n");
      return { value: JSON.parse(unesc) };
    } catch { /* continue */ }

    // 3) extract first {...} block
    const first = s.indexOf("{");
    const last = s.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return { value: JSON.parse(s.slice(first, last + 1)) };
      } catch (err) {
        return { error: err as Error };
      }
    }

    return { error: new Error("Cannot parse nested JSON in message") };
  }
}

export default new LogParser();