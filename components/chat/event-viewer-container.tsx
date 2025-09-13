'use client';

import { useState } from 'react';
import { LogEvent, AnomalyLevel } from '@/lib/log-parser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
export type FilterLevel = "all" | "info" | "warning" | "error" | "critical" | "anomalous";
import { X, AlertCircle, AlertTriangle, ListFilter, Zap, ClipboardCopy } from 'lucide-react';
import { BoltIcon } from '@heroicons/react/24/outline';
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
  DropdownDescription,
} from '@/components/catalyst-ui-kit/dropdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AppFile } from '@/hooks/use-files';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import clsx from 'clsx';

interface EventViewerContainerProps {
  events: LogEvent[];
  selectedFile: AppFile | null;
  getLanguage: (fileName: string) => string;
  getStyle: (fileName: string) => any;
  displayedContent: string;
  selectedLevel: FilterLevel; // Added
  setSelectedLevel: (level: FilterLevel) => void; // Added
}





export function EventViewerContainer({ events, selectedFile, getLanguage, getStyle, displayedContent, selectedLevel, setSelectedLevel }: EventViewerContainerProps) {
  // const [selectedLevel, setSelectedLevel] = useState<FilterLevel>('ALL'); // Removed
  const [activeTab, setActiveTab] = useState('events');

  const translationMap: { [key: string]: string } = {
    "Time": "Время",
    "Type": "Тип",
    "Anomaly Level": "Уровень аномалии",
    "Source": "Источник",
    "Status": "Статус",
    "Host": "Хост",
    "Service": "Сервис",
    "Application": "Приложение",
    "Payload": "Содержимое",
    "parse.error": "Ошибка при разборе лога",
    "log.message": "Сообщение лога",
    "http.request": "HTTP Запрос",
    "http.response": "HTTP Ответ",
    "db.query": "Запрос к БД",
    "system.info": "Системная информация",
    "user.action": "Действие пользователя",
    "file.access": "Доступ к файлу",
    "network.activity": "Сетевая активность",
    "security.alert": "Предупреждение безопасности",
    "custom.event": "Пользовательское событие",
    "process.start": "Запуск процесса",
    "process.end": "Завершение процесса",
    "error": "Ошибка",
    "warn": "Предупреждение",
    "info": "Информация",
    "debug": "Отладка",
    "critical": "Критическая",
    "none": "Нет",
    "high": "Высокий",
    "warning": "Предупреждение",
  };

  const translate = (key: string) => translationMap[key] || key;

  const handleCopyEvent = (event: LogEvent) => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2))
      .then(() => {
        // Optionally, add a toast notification here
        console.log('LogEvent copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy LogEvent: ', err);
      });
  };

  const getEventTypeVariant = (eventType: string | null) => {
    switch (eventType?.toUpperCase()) {
      case 'ERROR':
        return 'destructive';
      case 'WARN':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getAnomalyLevelIndicator = (level: AnomalyLevel | undefined) => {
    if (level === undefined) {
      return null;
    }
    switch (level) {
      case AnomalyLevel.HIGH:
        return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
      case AnomalyLevel.WARNING:
        return <div className="w-3 h-3 rounded-full bg-yellow-500"></div>;
      case AnomalyLevel.NONE:
        return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
      default:
        return null;
    } 
  };

  const getSelectedLevelIcon = (level: FilterLevel) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'all':
        return <ListFilter className="w-4 h-4 text-blue-500" />;
      case 'anomalous':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getAnomalyHighlightClass = (level: AnomalyLevel | undefined) => {
    if (level === AnomalyLevel.HIGH || level === AnomalyLevel.WARNING) {
      return 'text-red-500 font-semibold';
    }
    return '';
  };

  const filteredEvents = events.filter(event => {
    if (selectedLevel === 'all') {
      return true;
    }
    if (selectedLevel === 'anomalous') {
      return event.anomalyLevel !== AnomalyLevel.NONE;
    }
    return event.event_type?.toLowerCase() === selectedLevel;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Removed the dropdown div */}
      <Tabs defaultValue="events" className="flex flex-col h-full flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="logContent">Содержимое лога</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="flex-1 overflow-y-auto">
          <Accordion type="single" collapsible className="w-full">
            {filteredEvents.map((event, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>
                  <div className={clsx("flex items-center gap-4 w-full", getAnomalyHighlightClass(event.anomalyLevel))}>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild // Add asChild prop
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyEvent(event);
                      }}
                      className="flex-shrink-0"
                      title="Copy event JSON to clipboard"
                    >
                      <span className="flex items-center justify-center">
                        <ClipboardCopy className="w-4 h-4" />
                      </span>
                    </Button>
                    {getAnomalyLevelIndicator(event.anomalyLevel)}
                    <time className="text-sm text-muted-foreground">
                      {new Date(event.created_at || '').toLocaleTimeString()}
                    </time>
                    {event.anomalyLevel && event.anomalyLevel !== AnomalyLevel.NONE && (
                      <Badge variant="destructive" className="ml-2">
                        <BoltIcon className="w-4 h-4 mr-1" />
                        ПРОБЛЕМА
                      </Badge>
                    )}
                    <Badge variant={getEventTypeVariant(event.event_type || null)}>
                      {translate(event.event_type?.trim() || '')}
                    </Badge>
                    <span className="flex-1 text-left text-sm truncate ml-4 text-foreground">
                      {event.source && <strong>{JSON.stringify(event.source)}:</strong>}{' '}
                      {typeof event.payload?.message === 'object'
                        ? JSON.stringify(event.payload.message)
                        : event.payload?.message || ''}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-4 text-sm">
                    <div className="flex justify-between"><span>{translate("Time")}:</span><span>{new Date(event.created_at || '').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>{translate("Type")}:</span><Badge variant={getEventTypeVariant(event.event_type || null)}>{translate(event.event_type?.trim() || '')}</Badge></div>
                    <div className="flex justify-between"><span>{translate("Anomaly Level")}:</span><span>{translate(event.anomalyLevel?.toString() || '')}</span></div>
                    {event.source && <div className="flex justify-between"><span>{translate("Source")}:</span><span>{JSON.stringify(event.source)}</span></div>}
                    <div className="flex justify-between"><span>{translate("Status")}:</span><span>{translate(event.status?.trim() || '')}</span></div>
                    {event.host && <div className="flex justify-between"><span>{translate("Host")}:</span><span>{event.host}</span></div>}
                    {event.service && <div className="flex justify-between"><span>{translate("Service")}:</span><span>{event.service}</span></div>}
                    {event.application && <div className="flex justify-between"><span>{translate("Application")}:</span><span>{event.application}</span></div>}
                    <div className="flex flex-col mt-2">
                      <span className="font-medium">{translate("Payload")}:</span>
                      <pre className="text-sm whitespace-pre-wrap break-all bg-muted p-4 rounded-lg mt-1">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="logContent" className="flex-1 overflow-y-auto">
          {selectedFile ? (
            <SyntaxHighlighter
              language={getLanguage(selectedFile.name) || undefined}
              style={getStyle(selectedFile.name)}
              customStyle={{ background: 'transparent', width: '100%', height: '100%', textShadow: 'none' }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {displayedContent}
            </SyntaxHighlighter>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Выберите файл для просмотра</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}