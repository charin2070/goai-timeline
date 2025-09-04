'use client';

import { createContext, useContext, ReactNode } from 'react';

interface ChatFunctionsContextType {
  sendMessage: (message: string) => void;
  clearChat: () => void;
}

const ChatFunctionsContext = createContext<ChatFunctionsContextType | undefined>(
  undefined
);

export function ChatFunctionsProvider({ children, sendMessage, clearChat }: { children: ReactNode; sendMessage: (message: string) => void; clearChat: () => void }) {
  return (
    <ChatFunctionsContext.Provider value={{ sendMessage, clearChat }}>
      {children}
    </ChatFunctionsContext.Provider>
  );
}

export function useChatFunctions() {
  const context = useContext(ChatFunctionsContext);
  if (context === undefined) {
    throw new Error('useChatFunctions must be used within a ChatFunctionsProvider');
  }
  return context;
}
