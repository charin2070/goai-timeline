'use client';

import { useRef, useEffect } from 'react';
import { MessageList } from './message-list';
import QueryPanel, { QueryPanelRef } from './query-panel';
import { ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface RightPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onRepeatMessage: (messageId: string) => void;
  editMessage: (messageId: string) => string | undefined;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  initialPrompt: string;
}

export function RightPanel({ 
  messages, 
  isTyping, 
  onRepeatMessage, 
  editMessage, 
  onSendMessage, 
  onClearChat,
  initialPrompt
}: RightPanelProps) {
  const queryPanelRef = useRef<QueryPanelRef>(null);

  useEffect(() => {
    if (initialPrompt && queryPanelRef.current) {
      queryPanelRef.current.setInputValue(initialPrompt);
    }
  }, [initialPrompt]);

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

  return (
    <div className="flex flex-col h-full p-4 bg-gray-800/50">
      <h2 className="text-lg font-semibold mb-4">Анализ</h2>
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
          onRepeatMessage={onRepeatMessage}
          onEditMessage={handleEditMessage}
        />
      </div>
      <div className="mt-4">
        <Button onClick={handleSendPrompt} className="w-full mb-2">Анализировать</Button>
        <QueryPanel 
          ref={queryPanelRef}
          onSendMessage={onSendMessage} 
          onClearChat={onClearChat} 
        />
      </div>
    </div>
  );
}