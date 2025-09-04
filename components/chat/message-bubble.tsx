'use client';

import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck, AlertCircle, User, RotateCcw, Edit, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: ChatMessage;
  userAvatar: string | null;
  onRepeatMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string) => void;
}

export function MessageBubble({ message, userAvatar, onRepeatMessage, onEditMessage }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Check className="w-4 h-4 text-muted-foreground" />;
      case 'sent':
        return <CheckCheck className="w-4 h-4 text-primary" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const avatar = (
    <Avatar className={cn('flex-shrink-0 w-10 h-10 rounded-full', isError && !isUser && 'border-2 border-destructive')}>
      <AvatarImage src={isUser ? userAvatar || '' : ''} alt={isUser ? 'Пользователь' : 'AI'} />
      <AvatarFallback className={cn(
        'text-primary-foreground font-bold',
        isUser ? 'bg-primary' : 'bg-secondary',
        isError && !isUser && 'bg-destructive'
      )}>
        {isUser ? <User size={20} /> : 'AI'}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn('flex items-start gap-4 w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && avatar}
      <div className={cn(
        'relative max-w-xl min-w-[120px] rounded-xl p-4 shadow-md',
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-card-foreground',
        isError && !isUser && 'bg-destructive text-destructive-foreground'
      )}>
        {/* Increased bottom padding to pb-8 to prevent text overlap */}
        

        <div className={cn(
          'text-sm leading-relaxed',
          isUser ? 'text-primary-foreground' : 'text-card-foreground',
          isError && !isUser && 'text-destructive-foreground'
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypePrism]}
            components={{
              pre: ({ children, ...props }) => {
                const preRef = useRef<HTMLPreElement | null>(null);
                const [copied, setCopied] = useState(false);

                const onCopy = async () => {
                  try {
                    const text = preRef.current?.textContent || '';
                    if (text) {
                      await navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }
                  } catch (e) {
                    // no-op
                  }
                };

                return (
                  <div className="relative">
                    <pre ref={preRef} {...props}>
                      {children}
                    </pre>
                    <button
                      onClick={onCopy}
                      className="absolute top-2 right-2 p-1 rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      title="Копировать код"
                      aria-label="Копировать код"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              },
              a: ({ href, children }) => (
                <a
                  href={href || ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted hover:decoration-solid text-primary-foreground"
                >
                  {children}
                </a>
              ),
            }}
            className={cn(
              'space-y-3',
              '[&_*]:break-words',
              '[&>p]:whitespace-pre-wrap',
              '[&>ul]:list-disc [&>ul]:pl-5',
              '[&>ol]:list-decimal [&>ol]:pl-5',
              '[&>h1]:text-lg [&>h1]:font-semibold',
              '[&>h2]:text-base [&>h2]:font-semibold',
              '[&>code]:bg-accent [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded',
              '[&>pre]:bg-accent [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-auto'
            )}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Action buttons for user messages */}
        {isUser && (onRepeatMessage || onEditMessage) && (
          <div className="absolute -bottom-6 left-2 flex gap-1">
            {onRepeatMessage && (
              <button
                onClick={() => onRepeatMessage(message.id)}
                className="p-1 rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                title="Повторить сообщение"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            {onEditMessage && (
              <button
                onClick={() => onEditMessage(message.id)}
                className="p-1 rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                title="Редактировать сообщение"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {isError && !isUser && (
          <div className="mt-2 text-xs text-destructive-foreground">
            Произошла ошибка при получении ответа.
          </div>
        )}
      </div>
    </motion.div>
  );
}