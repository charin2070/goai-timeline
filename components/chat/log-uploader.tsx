'use client';

import { useState } from 'react';
import { extractHarErrorsSafe } from '@/lib/harAnalyzer';

export function LogUploader() {
  const [errors, setErrors] = useState<any[]>([]);
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log('[HAR] handleFileChange вызван');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('[HAR] Файл не выбран');
      return;
    }

    console.log('[HAR] Файл выбран:', file.name, 'размер:', file.size);
    setIsLoading(true);
    setErrors([]);

    const reader = new FileReader();
    
    reader.onload = () => {
      console.log('[HAR] Файл прочитан');
      const text = reader.result as string;
      console.log('[HAR] Файл загружен, размер:', text.length);
      setRawText(text);
    
      try {
        const result = extractHarErrorsSafe(text);
        console.log('[HAR] Обнаружено ошибок:', result.length);
        setErrors(result);
      } catch (error) {
        console.error('[HAR] Ошибка при обработке файла:', error);
        setErrors([]);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      console.error('[HAR] Ошибка при чтении файла');
      setIsLoading(false);
    };

    reader.readAsText(file);
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={isLoading} accept=".har" />
      {isLoading && <p>Analyzing HAR file...</p>}
      {errors.length > 0 && (
        <div>
          <h2>Detected Errors:</h2>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
