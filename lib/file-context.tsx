'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFiles } from '@/hooks/use-files';

const FileContext = createContext<ReturnType<typeof useFiles> | undefined>(
  undefined
);

export function FileWrapper({ children }: { children: ReactNode }) {
  const files = useFiles();

  return (
    <FileContext.Provider value={files}>
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileWrapper');
  }
  return context;
}
