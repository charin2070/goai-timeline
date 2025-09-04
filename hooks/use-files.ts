'use client';

import { useState, useCallback } from 'react';

export interface AppFile {
  id: string;
  name: string;
  content: string;
}

export function useFiles() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);

  const addFile = useCallback((file: AppFile) => {
    setFiles(prev => [...prev, file]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const selectFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId) || null;
    setSelectedFile(file);
  }, [files]);

  return {
    files,
    selectedFile,
    addFile,
    removeFile,
    selectFile,
  };
}
