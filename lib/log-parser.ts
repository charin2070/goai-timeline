// LogParser.ts
export type AnomalyLevel = 'high' | 'medium' | 'normal';

export interface LogEvent {
  id?: string;
  event_type: string | null;
  source: string | null;
  user_id: string | null;
  payload: Record<string, any> | null;
  status: string;
  correlation_id: string | null;
  created_at: string;
  processed_at?: string | null;
  host: string | null;
  service: string | null;
  business_process: string | null;
  application: string | null;
  anomalyLevel?: AnomalyLevel;
}

export class LogParser {
  public parse(
    logContent: string,
    fileType: 'auto' | 'dotnet' | 'nginx' | 'rabbitmq' | 'generic' = 'auto'
  ): LogEvent[] {
    if (fileType === 'auto') {
      fileType = this.detectFileType(logContent);
    }

    let events: LogEvent[] = [];
    switch (fileType) {
      case 'dotnet':
        events = this.parseDotnetLog(logContent);
        break;
      case 'nginx':
        console.warn('Nginx parser is not yet implemented.');
        events = [];
        break;
      case 'rabbitmq':
        events = this.parseRabbitMqLog(logContent);
        break;
      default:
        events = this.parseGenericLog(logContent);
        break;
    }

    const finalEvents: LogEvent[] = [];
    for (const event of events) {
      finalEvents.push(event);
      if (event.payload && typeof event.payload.message === 'string') {
        try {
          const nestedPayload = JSON.parse(event.payload.message);
          const logKeys = ['log', 'logs', 'message', 'data'];
          for (const key of logKeys) {
            if (nestedPayload[key] && typeof nestedPayload[key] === 'string') {
              if (nestedPayload[key] !== logContent) {
                const nestedEvents = this.parse(nestedPayload[key]);
                finalEvents.push(...nestedEvents);
              }
            }
          }
        } catch (e) {
          // Not a JSON string or malformed, so we ignore it.
        }
      }
    }
    
    return finalEvents;
  }

  private detectFileType(logContent: string): 'dotnet' | 'nginx' | 'rabbitmq' | 'generic' {
    if (logContent.includes('[Microsoft.Hosting.Lifetime]') || logContent.includes('System.Net.Http.HttpRequestException')) {
      return 'dotnet';
    }
    if (logContent.includes('HTTP/1.1"') && (logContent.includes('client:') || logContent.includes('server:'))) {
      return 'nginx';
    }
    if (logContent.includes('Problem name:') && logContent.includes('Operational data:')) {
      return 'rabbitmq';
    }
    return 'generic';
  }

  private parseDotnetLog(logContent: string): LogEvent[] {
    const lines = logContent.split('\n');
    const events: LogEvent[] = [];
    let currentEvent: LogEvent | null = null;

    const regex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) (INFO|ERROR|WARN|DEBUG) \[(.*?)\] \[(.*?)\] (.*)/;

    for (const line of lines) {
      const match = line.match(regex);

      if (match) {
        if (currentEvent) {
          events.push(currentEvent);
        }

        const [, timestamp, level, component, threadId, message] = match;
        currentEvent = {
          created_at: new Date(timestamp).toISOString(),
          event_type: level,
          source: component,
          payload: {
            threadId,
            message: message.trim(),
          },
          status: level === 'ERROR' ? 'error' : 'success',
          host: null,
          service: null,
          application: 'dotnet',
          user_id: null,
          correlation_id: null,
          business_process: null,
        };
      } else if (currentEvent && line.trim()) {
        // продолжение (stacktrace)
        currentEvent.payload!.message += '\n' + line.trim();
      }
    }

    if (currentEvent) events.push(currentEvent);

    return events;
  }

  private parseRabbitMqLog(logContent: string): LogEvent[] {
    const events: LogEvent[] = [];

    // Разбиваем на блоки "Problem ...", используя глобальный regex c dotAll
    const problemBlockRegex = /Problem started at[^\n]*\n(?:[\s\S]*?)(?=(?:Problem started at\s|\z))/g;
    const blocks = Array.from(logContent.matchAll(problemBlockRegex)).map(m => m[0]);

    // Если не найдено блоков по шаблону — попытаемся взять весь контент как один блок
    if (blocks.length === 0) {
      blocks.push(logContent);
    }

    for (const block of blocks) {
      // 1) created_at
      let createdAt = new Date().toISOString();
      const startedAtMatch = block.match(/Problem started at\s+(\d{2}:\d{2}:\d{2})\s+on\s+(\d{4}\.\d{2}\.\d{2})/i);
      if (startedAtMatch) {
        const time = startedAtMatch[1];
        const date = startedAtMatch[2].replace(/\./g, '-'); // 2025-09-07
        // ISO (UTC)
        try {
          createdAt = new Date(`${date}T${time}Z`).toISOString();
        } catch {
          createdAt = new Date().toISOString();
        }
      }

      // 2) Problem name
      const problemNameMatch = block.match(/Problem name:\s*(.*)/i);
      const problemName = problemNameMatch ? problemNameMatch[1].trim() : null;

      // 3) Severity
      const severityMatch = block.match(/Severity:\s*(.*)/i);
      const severityRaw = severityMatch ? severityMatch[1].trim() : null;
      const severity = severityRaw ? severityRaw.toLowerCase() : 'unknown';

      // 4) Host
      const hostMatch = block.match(/Host:\s*(.*)/i);
      const host = hostMatch ? (hostMatch[1].trim() === '' ? null : hostMatch[1].trim()) : null;

      // 5) Original problem ID (если есть)
      const originalIdMatch = block.match(/Original problem ID:\s*([0-9A-Za-z\-_]+)/i);
      const originalProblemId = originalIdMatch ? originalIdMatch[1] : null;

      // 6) Operational data JSON — аккуратный парсинг с подсчетом скобок
      let operationalDataParsed: any = undefined;
      let rawOperationalData: string | null = null;
      const opIndex = block.search(/Operational data:\s*/i);
      if (opIndex !== -1) {
        // ищем первую '{' после Operational data:
        const firstBrace = block.indexOf('{', opIndex);
        if (firstBrace !== -1) {
          let braceCount = 0;
          let jsonEnd = -1;
          for (let i = firstBrace; i < block.length; i++) {
            const ch = block[i];
            if (ch === '{') braceCount++;
            else if (ch === '}') braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
          if (jsonEnd !== -1) {
            rawOperationalData = block.slice(firstBrace, jsonEnd + 1);
            // Попытка чистого парсинга (удаляем возможные control-символы)
            try {
              operationalDataParsed = JSON.parse(rawOperationalData.replace(/[\u0000-\u001F]+/g, ''));
            } catch (err) {
              // пробуем более "мягко" — убираем возможные обрывки в конце
              try {
                const maybeFixed = rawOperationalData.replace(/,\s*([}\]])/g, '$1'); // убираем висящие запятые
                operationalDataParsed = JSON.parse(maybeFixed);
              } catch {
                operationalDataParsed = undefined;
              }
            }
          } else {
            // нет закрывающей скобки — сохраняем всё до конца блока как сырые данные
            rawOperationalData = block.slice(firstBrace);
            operationalDataParsed = undefined;
          }
        }
      }

      // 7) Формируем payload
      const payload: Record<string, any> = {
        problemName: problemName ?? undefined,
        severity: severityRaw ?? undefined,
      };
      if (originalProblemId) payload.originalProblemId = originalProblemId;
      if (operationalDataParsed !== undefined) payload.operationalData = operationalDataParsed;
      if (operationalDataParsed === undefined && rawOperationalData) payload.rawOperationalData = rawOperationalData;

      // 8) Собираем LogEvent
      const event: LogEvent = {
        created_at: createdAt,
        event_type: problemName ?? `RabbitMQ:${severityRaw ?? 'UNKNOWN'}`, 
        source: 'RabbitMQ Monitor',
        payload,
        status: severity === 'warning' ? 'warning' : severity === 'unknown' ? 'unknown' : 'error',
        host,
        service: 'RabbitMQ',
        application: 'rabbitmq',
        user_id: null,
        correlation_id: originalProblemId ?? null,
        business_process: null,
      };

      events.push(event);
    }

    return events;
  }

  private parseGenericLog(logContent: string): LogEvent[] {
    return logContent
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(line => {
        const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)?.[0];
        const createdAt = timestampMatch ?? new Date().toISOString();
        const levelMatch = line.match(/(INFO|ERROR|WARN|DEBUG|FATAL|TRACE|NOTICE)/i);
        const eventType = levelMatch ? levelMatch[0].toUpperCase() : 'UNKNOWN';
        return {
          event_type: eventType,
          source: null,
          user_id: null,
          payload: { message: line },
          status: 'success',
          correlation_id: null,
          created_at: createdAt,
          processed_at: null,
          host: null,
          service: null,
          business_process: null,
          application: null,
        } as LogEvent;
      });
  }
}
