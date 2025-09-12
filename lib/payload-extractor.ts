import { LogEvent } from './log-parser';

// Добавляем надёжную функцию парсинга и генерации событий из payload
export function extractEventsFromPayload(
  payload: Record<string, any> | null | undefined,
  parentEvent?: LogEvent
): LogEvent[] {
  const out: LogEvent[] = [];
  if (!payload) return out;

  const nowIso = new Date().toISOString();

  // Helper: safe JSON parse with simple recovery attempts
  function safeParseJson(raw: string | null | undefined): any | null {
    if (!raw || typeof raw !== 'string') return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      // попытка убрать невалидные управляющие символы
      try {
        const cleaned = raw.replace(/[\u0000-\u001F]+/g, '');
        return JSON.parse(cleaned);
      } catch (err2) {
        // попытка убрать висящие запятые (примитивно)
        try {
          const maybeFixed = raw.replace(/,\s*([}\]])/g, '$1');
          return JSON.parse(maybeFixed);
        } catch {
          return null;
        }
      }
    }
  }

  // Получаем operationalData как объект (в приоритете payload.operationalData, затем rawOperationalData)
  let operationalData: any = null;
  if (payload.operationalData && typeof payload.operationalData === 'object') {
    operationalData = payload.operationalData;
  } else if (payload.rawOperationalData && typeof payload.rawOperationalData === 'string') {
    operationalData = safeParseJson(payload.rawOperationalData);
  }

  // COMMON metadata to copy from parent (if provided)
  const commonBase = {
    correlation_id: parentEvent?.correlation_id ?? payload.originalProblemId ?? null,
    created_at: parentEvent?.created_at ?? nowIso,
    processed_at: parentEvent?.processed_at ?? null,
    service: parentEvent?.service ?? (payload.product_name ?? payload.service ?? null),
    application: parentEvent?.application ?? (payload.product_name ?? null),
    user_id: parentEvent?.user_id ?? null,
    business_process: parentEvent?.business_process ?? null,
  };

  // 1) summary event: top-level snapshot
  const summaryPayload: Record<string, any> = {
    problemName: payload.problemName ?? null,
    severity: payload.severity ?? null,
    originalProblemId: payload.originalProblemId ?? null,
  };
  // Подтянем некоторые полезные поля, если есть
  if (operationalData) {
    const pick = (key: string) => operationalData[key] ?? null;
    summaryPayload.product_version = pick('product_version') ?? pick('rabbitmq_version') ?? null;
    summaryPayload.node = pick('node') ?? null;
    summaryPayload.object_totals = pick('object_totals') ?? null;
    summaryPayload.queue_totals = pick('queue_totals') ?? null;
    // краткая сводка по message_stats
    if (operationalData.message_stats) {
      const ms = operationalData.message_stats;
      summaryPayload.message_stats = {
        publish: ms.publish ?? null,
        deliver: ms.deliver ?? null,
        ack: ms.ack ?? null,
        redeliver: ms.redeliver ?? null,
        drop_unroutable: ms.drop_unroutable ?? null,
      };
    }
  } else {
    // Если нет parsed operationalData — сохраняем raw (если есть)
    if (payload.rawOperationalData) summaryPayload.rawOperationalData = payload.rawOperationalData;
  }

  out.push({
    id: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : undefined,
    event_type: (payload.problemName ?? 'Operational snapshot') as string,
    source: 'operational.summary',
    payload: summaryPayload,
    status: (payload.severity ?? 'unknown').toLowerCase(),
    correlation_id: commonBase.correlation_id,
    created_at: commonBase.created_at,
    processed_at: commonBase.processed_at,
    host: payload.host ?? parentEvent?.host ?? null,
    service: commonBase.service,
    application: commonBase.application,
    user_id: commonBase.user_id,
    business_process: commonBase.business_process,
  } as LogEvent);

  // Если есть operationalData — извлекаем конкретные под-события
  if (operationalData && typeof operationalData === 'object') {
    // Helper для создания события
    function pushEvent(evt: Partial<LogEvent>) {
      const e: LogEvent = {
        id: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : undefined,
        event_type: evt.event_type ?? 'operational.sub',
        source: evt.source ?? 'operational',
        payload: evt.payload ?? null,
        status: evt.status ?? ((payload.severity ?? 'unknown').toLowerCase()),
        correlation_id: evt.correlation_id ?? commonBase.correlation_id,
        created_at: evt.created_at ?? commonBase.created_at,
        processed_at: evt.processed_at ?? commonBase.processed_at,
        host: evt.host ?? payload.node ?? parentEvent?.host ?? null,
        service: evt.service ?? commonBase.service,
        application: evt.application ?? commonBase.application,
        user_id: evt.user_id ?? commonBase.user_id,
        business_process: evt.business_process ?? commonBase.business_process,
      } as LogEvent;
      out.push(e);
    }

    // 2) message_stats -> event (summary + anomalies)
    if (operationalData.message_stats) {
      const ms = operationalData.message_stats;
      pushEvent({
        event_type: 'rabbitmq.message_stats',
        source: 'rabbitmq.message_stats',
        payload: { ...ms },
      });

      // anomaly-specific child events
      const drop = Number(ms.drop_unroutable ?? ms.drop_unroutable_details?.rate ?? 0);
      if (drop > 0) {
        pushEvent({
          event_type: 'rabbitmq.drop_unroutable',
          source: 'rabbitmq.alert',
          payload: { drop_unroutable: drop, details: ms.drop_unroutable_details ?? null },
          status: 'warning',
        });
      }

      const unack = Number(operationalData.queue_totals?.messages_unacknowledged ?? ms.messages_unacknowledged ?? 0);
      if (unack > 0) {
        pushEvent({
          event_type: 'rabbitmq.unacknowledged_messages',
          source: 'rabbitmq.alert',
          payload: { messages_unacknowledged: unack },
          status: 'warning',
        });
      }

      // large disk writes example
      const diskWrites = Number(ms.disk_writes ?? operationalData.disk_writes ?? 0);
      if (!isNaN(diskWrites) && diskWrites > 1e8) {
        pushEvent({
          event_type: 'rabbitmq.disk_writes_high',
          source: 'rabbitmq.metrics',
          payload: { disk_writes: diskWrites },
          status: 'warning',
        });
      }
    }

    // 3) queue_totals -> snapshot / backlog alert
    if (operationalData.queue_totals) {
      const qt = operationalData.queue_totals;
      pushEvent({
        event_type: 'rabbitmq.queue_totals',
        source: 'rabbitmq.metrics',
        payload: { ...qt },
      });

      const messages = Number(qt.messages ?? 0);
      if (messages > 10000) {
        pushEvent({
          event_type: 'rabbitmq.queue_backlog',
          source: 'rabbitmq.alert',
          payload: { messages },
          status: 'warning',
        });
      }
    }

    // 4) object_totals -> capacities
    if (operationalData.object_totals) {
      pushEvent({
        event_type: 'rabbitmq.object_totals',
        source: 'rabbitmq.metrics',
        payload: { ...operationalData.object_totals },
      });
    }

    // 5) listeners -> create event per listener (protocol/port/cert info)
    if (Array.isArray(operationalData.listeners)) {
      for (const lst of operationalData.listeners) {
        const listenerPayload: any = {
          node: lst.node ?? null,
          protocol: lst.protocol ?? null,
          ip_address: lst.ip_address ?? null,
          port: lst.port ?? null,
          socket_opts: lst.socket_opts ?? null,
        };
        // check TLS/cert clues
        if (lst.socket_opts && typeof lst.socket_opts === 'object') {
          if (lst.socket_opts.certfile || lst.socket_opts.cacertfile) {
            listenerPayload.tls = {
              certfile: lst.socket_opts.certfile ?? null,
              cacertfile: lst.socket_opts.cacertfile ?? null,
              verify: lst.socket_opts.verify ?? null,
            };
          }
        }
        pushEvent({
          event_type: `rabbitmq.listener:${listenerPayload.protocol ?? 'unknown'}`,
          source: 'rabbitmq.listener',
          payload: listenerPayload,
          status: 'normal',
        });
      }
    }

    // 6) contexts -> events
    if (Array.isArray(operationalData.contexts)) {
      for (const ctx of operationalData.contexts) {
        pushEvent({
          event_type: `rabbitmq.context:${ctx.node ?? 'unknown'}`,
          source: 'rabbitmq.context',
          payload: { node: ctx.node ?? null, description: ctx.description ?? null, ssl_opts: ctx.ssl_opts ?? null },
        });
      }
    }

    // 7) listeners/contexts for ssl cert validation clues
    // If any ssl_opts shows verify !== 'verify_peer' or fail_if_no_peer_cert true -> create alert
    const checkSslProblems = () => {
      const sslCandidates: any[] = [];
      if (Array.isArray(operationalData.listeners)) {
        operationalData.listeners.forEach((l: any) => l && l.socket_opts && l.socket_opts['verify'] && sslCandidates.push(l.socket_opts));
      }
      if (Array.isArray(operationalData.contexts)) {
        operationalData.contexts.forEach((c: any) => c && c.ssl_opts && sslCandidates.push(c.ssl_opts));
      }
      for (const s of sslCandidates) {
        // if verify is missing or set to something permissive, create info event
        const verify = s['verify'];
        const failIfNoPeer = s['fail_if_no_peer_cert'] || s['fail_if_no_peer_cert'] === 'true';
        if (verify && String(verify).toLowerCase() !== 'verify_peer') {
          pushEvent({
            event_type: 'rabbitmq.tls_verify_warning',
            source: 'rabbitmq.tls',
            payload: { verify, failIfNoPeer, raw: s },
            status: 'warning',
          });
        }
        if (failIfNoPeer) {
          pushEvent({
            event_type: 'rabbitmq.tls_require_peer_cert',
            source: 'rabbitmq.tls',
            payload: { failIfNoPeer, raw: s },
            status: 'normal',
          });
        }
      }
    };
    try {
      checkSslProblems();
    } catch {
      // noop
    }

    // 8) Raw operationalData fallback: if parsed absent but raw exists => attach raw chunk event
  } else if (payload.rawOperationalData) {
    out.push({
      id: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : undefined,
      event_type: 'operational.raw',
      source: 'operational.raw',
      payload: { rawOperationalData: payload.rawOperationalData },
      status: (payload.severity ?? 'unknown').toLowerCase(),
      correlation_id: commonBase.correlation_id,
      created_at: commonBase.created_at,
      processed_at: commonBase.processed_at,
      host: payload.host ?? parentEvent?.host ?? null,
      service: commonBase.service,
      application: commonBase.application,
      user_id: commonBase.user_id,
      business_process: commonBase.business_process,
    } as LogEvent);
  }

  return out;
}
