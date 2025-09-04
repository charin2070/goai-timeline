'use client';

import { useState, useCallback } from 'react';

export interface AppFile {
  id: string;
  name: string;
  content: string;
  os: string;
  app: string;
  server: string;
}

export function useFiles() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);

  const addFile = useCallback((file: Omit<AppFile, 'os' | 'app' | 'server'>) => {
    const newFile = {
      ...file,
      os: 'Linux', // Default OS
      app: '.NET application', // Default App
      server: 'Backend' // Default Server
    };
    setFiles(prev => [...prev, newFile]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const selectFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId) || null;
    setSelectedFile(file);
  }, [files]);

  const updateFile = useCallback((fileId: string, updates: Partial<AppFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  }, []);

  return {
    files,
    selectedFile,
    addFile,
    removeFile,
    selectFile,
    updateFile,
  };
}
