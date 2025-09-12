'use client';

import { ChatMessage } from '@/lib/types';
import { MessageBubble } from './message-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { TypingDots } from '@/components/ui/typing-dots';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onRepeatMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string) => void;
}

export function MessageList({ messages, isTyping, onRepeatMessage, onEditMessage }: MessageListProps) {
  const { session } = useAuth();
  const userAvatar = session?.user?.image || null;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-y-auto h-full">
      <div>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-24">
            <p className="text-muted-foreground text-lg font-light">
              Добавьте лог-файлы
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                userAvatar={userAvatar} 
                onRepeatMessage={onRepeatMessage}
                onEditMessage={onEditMessage}
              />
            ))}
          </div>
        )}
        
        {isTyping && (
          <div className="flex justify-center py-6">
            <TypingDots />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
