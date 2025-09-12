'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@/lib/types';
import { useAIProviderContext } from '@/lib/ai-provider-context';
import { useSettings } from '@/lib/settings-context';
import { toast } from 'sonner';
import { AppFile } from './use-files'; // Import AppFile type

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { systemPrompt } = useSettings();
  
  const {
    selectedProvider,
    changeProvider,
    getCurrentProvider,
    isLoading: isProviderLoading
  } = useAIProviderContext();

  // sendMessage now accepts files
  const sendMessage = useCallback(async (query: string, files: AppFile[]) => {
    const send = async (currentQuery: string, retryCount = 0) => {
      if (isLoading || isProviderLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString() + '-user',
        role: 'user',
        content: currentQuery,
        timestamp: new Date(),
        status: 'sending',
      };

      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      try {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: 'sent' as const }
              : msg
          )
        );

        abortControllerRef.current = new AbortController();

        // 1. Securely generate POML prompt on the backend
        const pomlResponse = await fetch('/api/poml', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files, query: currentQuery }),
          signal: abortControllerRef.current.signal,
        });

        if (!pomlResponse.ok) {
          const errorData = await pomlResponse.json();
          throw new Error(errorData.error || 'Failed to generate POML prompt.');
        }

        const { poml: pomlPrompt } = await pomlResponse.json();

        // 2. Use the generated POML prompt to call the chat API
        const apiMessages = [{ role: 'user', content: pomlPrompt }];

        if (systemPrompt) {
          apiMessages.unshift({ role: 'system', content: systemPrompt });
        }

        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, provider: selectedProvider }),
          signal: abortControllerRef.current.signal,
        });

        if (!chatResponse.ok) {
          const errorData = await chatResponse.json();
          throw new Error(errorData.error?.message || 'Failed to send message');
        }

        if (!chatResponse.body) {
          throw new Error('No response body received');
        }

        const reader = chatResponse.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    accumulatedContent += data.content;
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  continue;
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        if (!accumulatedContent.trim()) {
          throw new Error('No response content received');
        }

      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

        if (errorMessage.toLowerCase().includes('fetch failed') && retryCount === 0) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: 'Request failed. Retrying...', status: 'error' as const }
                : msg
            )
          );
          setTimeout(() => {
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== assistantMessage.id));
            send(currentQuery, 1);
          }, 1200);
          return;
        }

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: errorMessage, status: 'error' as const }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    };

    send(query);
  }, [isLoading, selectedProvider, isProviderLoading, systemPrompt]);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setIsLoading(false);
    toast.success('Chat cleared');
  }, []);

  // Update retryLastMessage to pass files
  const retryLastMessage = useCallback(() => {
    // This function needs access to the files state, which is not available here.
    // It should be updated in the component where `useChat` and `useFiles` are used together.
    console.warn('retryLastMessage needs to be adapted to handle files.');
  }, []);

  const repeatMessage = useCallback((messageId: string) => {
    // This also needs access to files state.
    console.warn('repeatMessage needs to be adapted to handle files.');
  }, []);

  const editMessage = useCallback((messageId: string) => {
    const messageToEdit = messages.find(msg => msg.id === messageId && msg.role === 'user');
    return messageToEdit?.content || '';
  }, [messages]);

  return {
    messages,
    isLoading: isLoading || isProviderLoading,
    selectedProvider,
    setSelectedProvider: changeProvider,
    getCurrentProvider,
    sendMessage,
    clearChat,
    retryLastMessage,
    repeatMessage,
    editMessage,
  };
}
