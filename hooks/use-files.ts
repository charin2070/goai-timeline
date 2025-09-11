'use client';

import { useState, useCallback } from 'react';

export interface AppFile {
  id: string;
  name: string;
  content: string;
  originalContent: string;
  os: string;
  app: string;
  server: string;
}

const generatePamlContent = (file: Omit<AppFile, 'id' | 'content'>) => {
  return `<poml>
  <context>
    <document src="${file.name}" os="${file.os}" app="${file.app}" server="${file.server}">
      ${file.originalContent}
    </document>
  </context>
</poml>`;
};

export function useFiles() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);

  const addFile = useCallback((file: Omit<AppFile, 'os' | 'app' | 'server' | 'content' | 'originalContent'> & { content: string }) => {
    const newFile: AppFile = {
      ...file,
      id: Date.now().toString(),
      originalContent: file.content,
      content: '',
      os: 'Linux',
      app: '.NET application',
      server: 'Backend'
    };
    newFile.content = generatePamlContent(newFile);
    setFiles(prev => [...prev, newFile]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const selectFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId) || null;
    setSelectedFile(file);
  }, [files]);

  const updateFile = useCallback((fileId: string, updates: Partial<Omit<AppFile, 'originalContent' | 'content'>>) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        const updatedFile = { ...file, ...updates };
        updatedFile.content = generatePamlContent(updatedFile);
        return updatedFile;
      }
      return file;
    }));
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