'use client';

import { useState, useCallback } from 'react';
import { getFileType } from '@/lib/utils';
import { LogParser, LogEvent } from '@/lib/log-parser';
import { getAnomalyLevel } from '@/lib/anomaly';

export interface AppFile {
  id: string; // Internal ID
  type: string;
  name: string;
  description: string;
  originalContent: string;
  platform: string;
  application: string;
  service: string;
  location: string;
  eventCount: number;
  events: LogEvent[];
}

export function useFiles() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);

  const addFile = useCallback((file: { name: string; content: string; }) => {
    const parser = new LogParser();
    const events = parser.parse(file.content, 'auto');
    const eventsWithAnomaly = events.map(event => ({
      ...event,
      anomalyLevel: getAnomalyLevel(event),
    }));
    const eventCount = eventsWithAnomaly.length;

    const newFile: AppFile = {
      id: Date.now().toString(),
      name: file.name,
      originalContent: file.content,
      type: getFileType(file.name),
      description: 'User uploaded file',
      platform: 'Linux',
      application: '.NET application',
      service: 'Backend',
      location: 'Unknown',
      eventCount: eventCount,
      events: eventsWithAnomaly,
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

  const updateFile = useCallback((fileId: string, updates: Partial<Omit<AppFile, 'originalContent' | 'id'>>) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return { ...file, ...updates };
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
