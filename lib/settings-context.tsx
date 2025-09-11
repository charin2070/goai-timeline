'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextProps {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [systemPrompt, setSystemPromptState] = useState<string>('');

  useEffect(() => {
    const storedPrompt = localStorage.getItem('systemPrompt');
    if (storedPrompt) {
      setSystemPromptState(storedPrompt);
    }
  }, []);

  const setSystemPrompt = (newPrompt: string) => {
    localStorage.setItem('systemPrompt', newPrompt);
    setSystemPromptState(newPrompt);
  };

  return (
    <SettingsContext.Provider value={{ systemPrompt, setSystemPrompt }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
