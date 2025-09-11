'use client';

import { useRef, useEffect } from 'react';
import { MessageList } from './message-list';
import QueryPanel, { QueryPanelRef } from './query-panel';
import { ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
  );
}