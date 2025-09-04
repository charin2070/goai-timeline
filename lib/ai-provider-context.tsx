'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAiProvider } from '@/hooks/use-ai-provider';

const AIProviderContext = createContext<ReturnType<typeof useAiProvider> | undefined>(
  undefined
);

export function AIProviderWrapper({ children }: { children: ReactNode }) {
  const aiProvider = useAiProvider();

  return (
    <AIProviderContext.Provider value={aiProvider}>
      {children}
    </AIProviderContext.Provider>
  );
}

export function useAIProviderContext() {
  const context = useContext(AIProviderContext);
  if (context === undefined) {
    throw new Error('useAIProviderContext must be used within an AIProviderWrapper');
  }
  return context;
}
