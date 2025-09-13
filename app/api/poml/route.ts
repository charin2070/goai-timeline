
import { NextRequest, NextResponse } from 'next/server';
import { AppFile } from '@/hooks/use-files';

const pomlTemplate = `<SystemPrompt>
  Ты — эксперт по диагностике и устранению ошибок ПО.

  Твоя цель — находить **корневую причину** проблем, анализируя логи, системные сообщения и переписки.

  Обращай особое внимание на ситуации, когда:
  - Сервис (например RabbitMQ) продолжает работать штатно, 
    а ломается только слой мониторинга или сбор метрик (Management API, экспортеры, агенты).
  - Возможны сетевые проблемы (timeouts, DNS, маршрутизация).
  - Источник ошибки может быть связан с сертификатами 
    (например, обновили cert на glabber/monitoring-хосте, и он временно невалиден для целевого сервиса).
  - В логах есть "Failed to fetch data" или аналогичные сообщения — 
    рассматривай сбой в цепочке мониторинга, а не только сам сервис.

  Всегда включай сравнительный анализ:
  **“Мониторинг vs Реальный сервис”** — выделяй это отдельным блоком.
1. **Симптомы:** Кратко перечисли, что видно в логах/алертах.
2. **Мониторинг vs Реальный сервис:** 
   - Что указывает на реальное падение сервиса.
   - Что указывает на сбой мониторинга/метрик (API, сеть, сертификаты).
   - Предварительный вывод: где вероятнее источник.
3. **Возможные причины:** Список гипотез (сервис, сеть, сертификаты, агенты).
4. **Корневая причина (предположительно):** Самое правдоподобное объяснение.
5. **Рекомендации:** Что проверить и какие шаги предпринять.
`; 

// This is the protected backend logic for generating the POML prompt.
const generateCombinedPoml = (files: AppFile[], query: string) => {
  const logs = files.map(file => 
    `  <Log>
    <Platform>${file.platform}</Platform>
    <Application>${file.application}</Application>
    <Service>${file.service}</Service>
    <LogContent>
      ${file.originalContent}
    </LogContent>
  </Log>`).join('\n');

  return `<poml>\n  <Query>\n    ${query}\n  </Query>\n${logs}\n</poml>`;
};

export async function POST(req: NextRequest) {
  try {
    const { files, query } = await req.json();

    if (!Array.isArray(files) || !query) {
      return NextResponse.json({ error: 'Invalid input: files array and query string are required.' }, { status: 400 });
    }

    const pomlPrompt = generateCombinedPoml(files, query);
    
    return NextResponse.json({ poml: pomlPrompt });

  } catch (error) {
    console.error('Error generating POML prompt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
