// components/chat/event-viewer-modal.tsx
'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { LogEvent, AnomalyLevel } from '@/lib/log-parser';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, AlertTriangle, ListFilter, Zap } from 'lucide-react';
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
import clsx from 'clsx'; // Import clsx

interface EventViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: LogEvent[];
  selectedFile: AppFile | null;
  getLanguage: (fileName: string) => string | null;
  getStyle: (fileName: string) => any; // Use any for now, as SyntaxHighlighterProps['style'] might be complex
  displayedContent: string;
}

type FilterLevel = 'ALL' | 'ERROR' | 'WARN' | 'ANOMALOUS';

const levelDisplayNames: Record<FilterLevel, string> = {
  ALL: 'Все',
  ERROR: 'ERROR',
  WARN: 'WARN',
  ANOMALOUS: 'Аномальные',
};

export function EventViewerModal({
  isOpen,
  onClose,
  events,
  selectedFile,
  getLanguage,
  getStyle,
  displayedContent,
}: EventViewerModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<FilterLevel>('ALL');
  const [activeTab, setActiveTab] = useState('events');

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
    if (!level) return null;
    switch (level) {
      case AnomalyLevel.HIGH:
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
      case AnomalyLevel.MEDIUM:
        return <div className="w-3 h-3 rounded-full bg-yellow-500" />;
      case AnomalyLevel.NORMAL:
        return <div className="w-3 h-3 rounded-full bg-green-500" />;
      default:
        return null;
    }
  };

  const getSelectedLevelIcon = (level: FilterLevel) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'ALL':
        return <ListFilter className="w-4 h-4 text-blue-500" />;
      case 'ANOMALOUS':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getAnomalyHighlightClass = (level: AnomalyLevel | undefined) => {
    if (level === AnomalyLevel.HIGH || level === AnomalyLevel.MEDIUM) {
      return 'text-red-500 font-semibold';
    }
    return '';
  };

  const filteredEvents = events.filter((event) => {
    if (selectedLevel === 'ALL') return true;
    if (selectedLevel === 'ANOMALOUS') {
      // anomalous if not normal (use enum)
      return event.anomalyLevel !== AnomalyLevel.NORMAL;
    }
    return event.event_type?.toUpperCase() === selectedLevel;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} containerClassName="max-w-4xl">
      <Modal.Header>
        <Modal.Title>{selectedFile?.name || 'Event Timeline'}</Modal.Title>
        <div className="flex-grow flex justify-center">
          <Dropdown>
            <DropdownButton outline>
              <div className="flex items-center gap-2">
                {getSelectedLevelIcon(selectedLevel)}
                {levelDisplayNames[selectedLevel]}
              </div>
            </DropdownButton>
            <DropdownMenu className="z-[60] min-w-56">
              <DropdownItem onClick={() => setSelectedLevel('ERROR')}>
                <AlertCircle className="w-4 h-4 text-red-500 mr-3" />
                <DropdownLabel>ERROR</DropdownLabel>
                <DropdownDescription>События с явным указанием на ошибку</DropdownDescription>
              </DropdownItem>
              <DropdownItem onClick={() => setSelectedLevel('WARN')}>
                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-3" />
                <DropdownLabel>WARN</DropdownLabel>
                <DropdownDescription>События с уровнем логгирования "WARN"</DropdownDescription>
              </DropdownItem>
              <DropdownItem onClick={() => setSelectedLevel('ALL')}>
                <ListFilter className="w-4 h-4 text-blue-500 mr-3" />
                <DropdownLabel>Все</DropdownLabel>
                <DropdownDescription>Показать все события</DropdownDescription>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => setSelectedLevel('ANOMALOUS')}>
                <Zap className="w-4 h-4 text-purple-500 mr-3" />
                <DropdownLabel>Аномальные</DropdownLabel>
                <DropdownDescription>Не стандартные события</DropdownDescription>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
      </Modal.Header>

      <Modal.Body>
        <Tabs defaultValue="events" className="flex flex-col h-full">
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
                      {getAnomalyLevelIndicator(event.anomalyLevel)}
                      <time className="text-sm text-muted-foreground">
                        {new Date(event.created_at ?? Date.now()).toLocaleTimeString()}
                      </time>
                      <Badge variant={getEventTypeVariant(event.event_type ?? null)}>
                        {event.event_type ?? 'unknown'}
                      </Badge>
                      <span className="flex-1 text-left text-sm truncate ml-4">
                        {String(event.payload?.message ?? '')}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-2 p-4 text-sm">
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{new Date(event.created_at ?? Date.now()).toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Type:</span>
                        <Badge variant={getEventTypeVariant(event.event_type ?? null)}>
                          {event.event_type ?? 'unknown'}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <span>Anomaly Level:</span>
                        <span>{event.anomalyLevel ?? '—'}</span>
                      </div>

                      {event.source && (
                        <div className="flex justify-between">
                          <span>Source:</span>
                          <span>
                            {typeof event.source === 'string'
                              ? event.source
                              : event.source?.node ?? JSON.stringify(event.source)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span>{event.status ?? '—'}</span>
                      </div>

                      {event.host && (
                        <div className="flex justify-between">
                          <span>Host:</span>
                          <span>{event.host}</span>
                        </div>
                      )}

                      {event.service && (
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span>{event.service}</span>
                        </div>
                      )}

                      {event.application && (
                        <div className="flex justify-between">
                          <span>Application:</span>
                          <span>{event.application}</span>
                        </div>
                      )}

                      <div className="flex flex-col mt-2">
                        <span className="font-medium">Payload:</span>
                        <pre className="text-sm whitespace-pre-wrap break-all bg-muted p-4 rounded-lg mt-1">
                          {JSON.stringify(event.payload ?? event.data ?? {}, null, 2)}
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
                language={getLanguage(selectedFile.name) ?? "undefined"}
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
      </Modal.Body>
    </Modal>
  );
}
