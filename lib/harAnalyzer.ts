// lib/harAnalyzer.ts
export function extractHarErrorsSafe(text: string): any[] {
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) return [];
  
      const trimmed = text.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(trimmed);
  
      return extractHarErrors(parsed);
    } catch (e) {
      console.error('Ошибка при парсинге HAR:', e);
      return [];
    }
  }
  
  export function extractHarErrors(har: any): any[] {
    const entries = har?.log?.entries || [];
    const errors = [];
  
    for (const entry of entries) {
      const { request, response, _error } = entry;
  
      // 1. HTTP статус >= 400
      if (response?.status >= 400) {
        errors.push({
          url: request?.url,
          status: response.status,
          statusText: response.statusText,
          type: 'http',
        });
      }
  
      // 2. Встроенное поле _error
      if (_error) {
        errors.push({
          url: request?.url,
          error: _error,
          type: 'network',
        });
      }
  
      // 3. Иногда AdBlock пишет это в response._error
      if (response?._error) {
        errors.push({
          url: request?.url,
          error: response._error,
          type: 'network',
        });
      }
  
      // 4. Иногда ошибка есть в `timings.blocked == -1`
      if (entry?.timings?.blocked === -1) {
        errors.push({
          url: request?.url,
          error: 'Request blocked or failed (timing.blocked = -1)',
          type: 'timing',
        });
      }
    }
  
    return errors;
  }
  
  