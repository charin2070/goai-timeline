'use client';

import { useState, useEffect } from 'react';
import { useFileContext } from '@/lib/file-context';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
import { getFileType, filterLogErrors } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface CenterPanelProps {
  setPamlPrompt: (prompt: string) => void;
}

const defaultSystemPrompt = `Ты — опытный .NET инженер, разбирающийся в микросервисах на Linux, Windows, MacOS, Android и iOS. 
Твоя задача — **найти корневую причину всех ошибок**, анализируя весь контекст, а не просто указать стэк исключений. 

Обрати внимание на:
- Все WARN и ERROR сообщения (и другие не стандартные сообщения).
- Кэширование объектов
- Последовательность событий: первая попытка запроса, повторная попытка, изменения кэша.

Выведи строго структурированно в формате Markdown:
1. **Краткое описание корневой проблемы:** включи симптом и реальную причину, почему ошибка проявляется.
2. **Техническая причина возникновения ошибки:** объясни связь между записью в логе и корневой проблемой.
3. **Конкретные рекомендации по исправлению:** пошаговые действия с кодом или настройками, чтобы устранить проблему и предотвратить повторное возникновение.
4. **Потенциальные риски и побочные эффекты:** что может пойти не так при внедрении исправлений и как этого избежать.

Обязательно:  
- Укажи, что 
- Укажи потенциальную причину возникновения ошибки.
- Укажи конкретные шаги по исправлению.
- Укажи возможные риски и как их избежать.
- Пиши максимально конкретно, избегай общих фраз.
- Пиши на русском языке.
`;

export function CenterPanel({ setPamlPrompt }: CenterPanelProps) {
  const { files, selectedFile } = useFileContext();
  const [isOptimized, setIsOptimized] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);

  useEffect(() => {
    const storedPrompt = localStorage.getItem('systemPrompt');
    if (storedPrompt) {
      setSystemPrompt(storedPrompt);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('systemPrompt', systemPrompt);
  }, [systemPrompt]);

  const getLanguage = (fileName: string) => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case 'log':
        return 'log';
      default:
        return 'xml';
    }
  };

  const getStyle = (fileName: string) => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case 'log':
        return oneLight;
      default:
        return prism;
    }
  };

  const displayedContent = selectedFile 
    ? (isOptimized && getFileType(selectedFile.name) === 'log' 
        ? filterLogErrors(selectedFile.content) 
        : selectedFile.content)
    : '';

  const generatePAMLPrompt = () => {
    let prompt = '<PAML>\n';
    prompt += `  <SystemPrompt>\n${systemPrompt}\n  </SystemPrompt>\n`;
    
    files.forEach(file => {
      const logContent = isOptimized && getFileType(file.name) === 'log' 
        ? filterLogErrors(file.content) 
        : file.content;

      prompt += '  <Log>\n';
      prompt += `    <OS>${file.os}</OS>\n`;
      prompt += `    <Application>${file.app}</Application>\n`;
      prompt += `    <Server>${file.server}</Server>\n`;
      prompt += `    <LogContent>\n${logContent}\n    </LogContent>\n`;
      prompt += '  </Log>\n';
    });

    prompt += '</PAML>';
    return prompt;
  };

  useEffect(() => {
    const newPrompt = generatePAMLPrompt();
    setPamlPrompt(newPrompt);
  }, [files, isOptimized, systemPrompt]);

  const handleCopyPrompt = () => {
    const promptContent = generatePAMLPrompt();
    navigator.clipboard.writeText(promptContent);
    toast.success('Промпт скопирован в буфер обмена');
  };

  return (
    <div className="flex flex-col h-full p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Оптимизация</h2>
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setIsOptimized(!isOptimized)}>{isOptimized ? 'Показать все' : 'Оптимизировать'}</Button>
          </motion.div>
        </div>
      </div>
      <Tabs defaultValue="logContent" className="flex flex-col flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logContent">Содержимое лога</TabsTrigger>
          <TabsTrigger value="pamlPrompt" className="flex items-center gap-1">
            PAML промпт
            <Button variant="ghost" size="icon" onClick={handleCopyPrompt} className="h-6 w-6">
              <Copy className="h-4 w-4" />
            </Button>
          </TabsTrigger>
          <TabsTrigger value="systemPrompt">Системный промпт</TabsTrigger>
        </TabsList>
        <TabsContent value="logContent" className="flex-1 overflow-y-auto bg-card rounded-lg">
          {selectedFile ? (
            <SyntaxHighlighter 
              language={getLanguage(selectedFile.name)} 
              style={getStyle(selectedFile.name)} 
              customStyle={{ background: 'transparent', width: '100%', textShadow: 'none' }}
              wrapLines={true}
              wrapLongLines={true}
              className="overflow-y-auto"
            >
              {displayedContent}
            </SyntaxHighlighter>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Выберите файл для просмотра</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="pamlPrompt" className="flex-1 overflow-y-auto bg-card rounded-lg p-4 min-h-0">
          <textarea
            className="w-full h-full bg-transparent text-foreground focus:outline-none resize-none overflow-y-auto"
            readOnly
            value={generatePAMLPrompt()}
          />
        </TabsContent>
        <TabsContent value="systemPrompt" className="flex-1 overflow-y-auto bg-card rounded-lg p-4 min-h-0">
          <textarea
            className="w-full h-full bg-transparent text-foreground focus:outline-none resize-none overflow-y-auto"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}