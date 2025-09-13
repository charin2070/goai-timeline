import { LogEvent, Severity } from './log-parser';
// Добавляем надёжную функцию парсинга и генерации событий из payload
export function extractEventsFromPayload(
  payload: Record<string, any> | null | undefined,
  parentEvent?: LogEvent
): LogEvent[] {
  const out: LogEvent[] = [];
  const nowIso = new Date().toISOString();

  const commonBase = {
    correlation_id: parentEvent?.correlation_id ?? undefined,
    created_at: nowIso,
    processed_at: nowIso,
    service: parentEvent?.service ?? null,
    application: parentEvent?.application ?? null,
    user_id: parentEvent?.user_id ?? null,
    business_process: parentEvent?.business_process ?? null,
  };

  // Helper для создания события
  function pushEvent(evt: Partial<LogEvent>) {
    const e: LogEvent = {
      id: typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : undefined,
      type: evt.type ?? evt.event_type ?? "operational.sub",
      message: evt.message ?? evt.event_type ?? "Operational sub-event",
      severity: (evt.severity ??
        (payload?.severity ?? "info")).toLowerCase() as Severity,
      event_type: evt.event_type ?? "operational.sub",
      source:
        typeof evt.source === "string"
          ? { raw: evt.source }
          : evt.source ?? { raw: "operational" },
      payload: evt.payload ?? null,
      status: evt.status ?? (payload?.severity ?? "unknown").toLowerCase(),
      correlation_id: evt.correlation_id ?? commonBase.correlation_id,
      created_at: evt.created_at ?? commonBase.created_at,
      processed_at: evt.processed_at ?? commonBase.processed_at,
      host: evt.host ?? payload?.node ?? parentEvent?.host ?? null,
      service: evt.service ?? commonBase.service,
      application: evt.application ?? commonBase.application,
      user_id: evt.user_id ?? commonBase.user_id,
      business_process: evt.business_process ?? commonBase.business_process,
    } as LogEvent;
    out.push(e);
  }

  // Если payload пустой — вернуть пустой массив
  if (!payload) return [];

  // 🔧 Тут можно распаковать payload и пушить события
  // например:
  if (Array.isArray(payload.events)) {
    for (const evt of payload.events) {
      pushEvent(evt);
    }
  } else {
    pushEvent({ payload });
  }

  // 🚀 Возвращаем ВСЕГДА
  return out;
}