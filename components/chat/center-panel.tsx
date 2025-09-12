'use client';

import { useState, useEffect, useRef } from 'react';
import { useFileContext } from '@/lib/file-context';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
import { getFileType, filterLogErrors } from '@/lib/utils';
import { Button } from '@/components/catalyst-ui-kit/button';
import { Textarea } from '@/components/catalyst-ui-kit/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Copy, PlusCircle, X, FileText, Image, Music, Terminal, AppWindow, Apple, Smartphone, Code, Server, Database, User, Globe, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst-ui-kit/table';
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
} from '@/components/catalyst-ui-kit/dropdown';
import clsx from 'clsx';
import { MessageList } from './message-list';
import QueryPanel, { QueryPanelRef } from './query-panel';
import { ChatMessage } from '@/lib/types';
import { EventViewerModal } from './event-viewer-modal';
import { LogEvent } from '@/lib/log-parser';

interface CenterPanelProps {
  setPomlPrompt: (prompt: string) => void;
  messages: ChatMessage[];
  isTyping: boolean;
  onRepeatMessage: (messageId: string) => void;
  editMessage: (messageId: string) => string | undefined;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  initialPrompt: string;
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

export function CenterPanel({
  setPomlPrompt, 
  messages, 
  isTyping, 
  onRepeatMessage, 
  editMessage, 
  onSendMessage, 
  onClearChat,
  initialPrompt
}: CenterPanelProps) {
  const { files, selectedFile, addFile, removeFile, selectFile, updateFile } = useFileContext();
  const [isOptimized, setIsOptimized] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryPanelRef = useRef<QueryPanelRef>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventsToShow, setEventsToShow] = useState<LogEvent[]>([]);

  useEffect(() => {
    const storedPrompt = localStorage.getItem("systemPrompt");
    if (storedPrompt) {
        setSystemPrompt(storedPrompt);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'systemPrompt' && e.newValue) {
        setSystemPrompt(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (initialPrompt && queryPanelRef.current) {
      queryPanelRef.current.setInputValue(initialPrompt);
    }
  }, [initialPrompt]);

  const handleShowEvents = (events: LogEvent[]) => {
    setEventsToShow(events);
    setShowEventModal(true);
  };

  const handleSendPrompt = () => {
    if (initialPrompt) {
      onSendMessage(initialPrompt);
    }
  };

  const handleEditMessage = (messageId: string) => {
    const messageContent = editMessage(messageId);
    if (messageContent && queryPanelRef.current) {
      queryPanelRef.current.setInputValue(messageContent);
    }
  };

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          addFile({
            name: file.name,
            content,
          });
        };
        reader.readAsText(file);
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'log':
        return <FileText className="w-4 h-4" />;
      default:
        return 'xml';
    }
  };

  const getHostIcon = (service: string) => {
    switch (service) {
      case 'Frontend':
        return <Monitor className="w-4 h-4" />;
      case 'Middle':
        return <Server className="w-4 h-4" />;
      case 'Backend':
        return <Server className="w-4 h-4" />;
      case 'DB':
        return <Database className="w-4 h-4" />;
      case 'Client':
        return <User className="w-4 h-4" />;
      case 'External service':
        return <Globe className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

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
        ? filterLogErrors(selectedFile.originalContent) 
        : selectedFile.originalContent)
    : '';

  const generatePOMLPrompt = () => {
    let prompt = '<poml>\n';
    prompt += `  <SystemPrompt>\n${systemPrompt}\n  </SystemPrompt>\n`;
    
    files.forEach(file => {
      const logContent = isOptimized && getFileType(file.name) === 'log' 
        ? filterLogErrors(file.originalContent) 
        : file.originalContent;

      prompt += '  <Log>\n';
      prompt += `<OS>${file.platform}</OS>
`;
      prompt += `    <Application>${file.application}</Application>
`;
      prompt += `    <Server>${file.service}</Server>
`;
      prompt += `    <LogContent>\n${logContent}\n    </LogContent>\n`;
      prompt += '  </Log>\n';
    });

    prompt += '</poml>';
    return prompt;
  };

  useEffect(() => {
    const newPrompt = generatePOMLPrompt();
    setPomlPrompt(newPrompt);
  }, [files, isOptimized, systemPrompt]);

  const handleCopyPrompt = () => {
    const promptContent = generatePOMLPrompt();
    navigator.clipboard.writeText(promptContent);
    toast.success('Промпт скопирован в буфер обмена');
  };

  return (
    <div className="flex flex-col h-full p-4 bg-background">
      <Tabs defaultValue="logContent" className="flex flex-col flex-1">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="files">Файлы</TabsTrigger>
          <TabsTrigger value="logContent">Содержимое лога</TabsTrigger>
          <TabsTrigger value="pomlPrompt" className="flex items-center gap-1" onClick={handleCopyPrompt}>
            POML промпт
            <Copy className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="systemPrompt">Системный промпт</TabsTrigger>
          <TabsTrigger value="analysis">Анализ</TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="flex-1 overflow-y-auto bg-card rounded-lg">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-lg font-semibold">Файлы</h2>
              <Button plain onClick={handleAddFileClick}>
                <PlusCircle className="w-5 h-5" />
              </Button>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <Table dense>
                <TableHead>
                  <TableRow>
                    <TableHeader>Имя</TableHeader>
                    <TableHeader>Платформа</TableHeader>
                    <TableHeader>Приложение</TableHeader>
                    <TableHeader>Хост</TableHeader>
                    <TableHeader>Cобытия</TableHeader>
                    <TableHeader></TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map(file => (
                    <TableRow
                      key={file.id}
                      onClick={() => selectFile(file.id)}
                      className={clsx(
                        'cursor-pointer',
                        selectedFile?.id === file.id && 'bg-gray-100 dark:bg-gray-800'
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.name)}
                          <span>{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Dropdown>
                          <DropdownButton outline className="w-full">{file.platform}</DropdownButton>
                          <DropdownMenu>
                            <DropdownItem onClick={() => updateFile(file.id, { platform: 'Linux' })}><Terminal className="w-4 h-4 mr-2"/>Linux</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { platform: 'Windows' })}><AppWindow className="w-4 h-4 mr-2"/>Windows</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { platform: 'MacOS' })}><Apple className="w-4 h-4 mr-2"/>MacOS</DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => updateFile(file.id, { platform: 'Android' })}><Smartphone className="w-4 h-4 mr-2"/>Android</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { platform: 'iOS' })}><Smartphone className="w-4 h-4 mr-2"/>iOS</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Dropdown>
                          <DropdownButton outline className="w-full">{file.application}</DropdownButton>
                          <DropdownMenu>
                            <DropdownItem onClick={() => updateFile(file.id, { application: '.NET application' })}><Code className="w-4 h-4 mr-2"/>.NET application</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { application: 'JAVA application' })}><Code className="w-4 h-4 mr-2"/>JAVA application</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { application: 'C++ application' })}><Code className="w-4 h-4 mr-2"/>C++ application</DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => updateFile(file.id, { application: 'nGinx' })}><Server className="w-4 h-4 mr-2"/>nGinx</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { application: 'IIS' })}><Server className="w-4 h-4 mr-2"/>IIS</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Dropdown>
                          <DropdownButton outline className="w-full">
                            <div className="flex items-center gap-2">
                              {getHostIcon(file.service)}
                              <span>{file.service}</span>
                            </div>
                          </DropdownButton>
                          <DropdownMenu>
                            <DropdownItem onClick={() => updateFile(file.id, { service: 'Frontend' })}><Monitor className="w-4 h-4 mr-2"/>Frontend</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { service: 'Middle' })}><Server className="w-4 h-4 mr-2"/>Middle</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { service: 'Backend' })}><Server className="w-4 h-4 mr-2"/>Backend</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { service: 'DB' })}><Database className="w-4 h-4 mr-2"/>DB</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { service: 'Client' })}><User className="w-4 h-4 mr-2"/>Client</DropdownItem>
                            <DropdownItem onClick={() => updateFile(file.id, { service: 'External service' })}><Globe className="w-4 h-4 mr-2"/>External service</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                      <TableCell>
                        <div 
                          className="cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowEvents(file.events);
                          }}
                        >
                          {file.eventCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button plain onClick={(e: { stopPropagation: () => void; }) => { e.stopPropagation(); removeFile(file.id); }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="logContent" className="flex-1 overflow-y-auto bg-card rounded-lg">
          {/* Content moved to EventViewerModal */}
        </TabsContent>
        <TabsContent value="pomlPrompt" className="flex-1 overflow-y-auto bg-card rounded-lg">
          <SyntaxHighlighter 
            language="xml"
            style={prism}
            customStyle={{ background: 'transparent', width: '100%', height: '100%', textShadow: 'none' }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {generatePOMLPrompt()}
          </SyntaxHighlighter>
        </TabsContent>
        <TabsContent value="systemPrompt" className="flex-1 overflow-y-auto bg-card rounded-lg min-h-0">
          <Textarea
            className="w-full h-full bg-transparent text-foreground focus:outline-none resize-none overflow-y-auto"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </TabsContent>
        <TabsContent value="analysis" className="flex-1 overflow-y-auto bg-card rounded-lg">
          <div className="flex flex-col h-full bg-background">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Анализ</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <MessageList 
                messages={messages} 
                isTyping={isTyping} 
                onRepeatMessage={onRepeatMessage}
                onEditMessage={handleEditMessage}
              />
            </div>
            <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleSendPrompt} className="w-full mb-2">Анализировать</Button>
              </motion.div>
              <QueryPanel 
                ref={queryPanelRef}
                onSendMessage={onSendMessage} 
                onClearChat={onClearChat} 
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <EventViewerModal 
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        events={eventsToShow}
        selectedFile={selectedFile}
        getLanguage={getLanguage}
        getStyle={getStyle}
        displayedContent={displayedContent}
      />
    </div>
  );
}
