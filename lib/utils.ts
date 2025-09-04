import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension) return 'text';

  if (['log'].includes(extension)) {
    return 'log';
  }

  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'image';
  }

  if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'audio';
  }

  return 'text';
}

export function filterLogErrors(logContent: string): string {
  const errorPatterns = [
    /error/i,
    /exception/i,
    /fail/i,
    /critical/i,
    /fatal/i,
    /denied/i,
    /unauthorized/i,
    /timeout/i,
    /refused/i,
    /cannot/i,
    /could not/i,
    /invalid/i,
    /corrupt/i,
    /stack trace/i,
    /at /i, // Common in stack traces
  ];

  const lines = logContent.split('\n');
  const errorLines = lines.filter(line => {
    return errorPatterns.some(pattern => pattern.test(line));
  });

  return errorLines.join('\n');
}
