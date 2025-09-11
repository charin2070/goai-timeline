'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { SettingsProvider } from '@/lib/settings-context';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
    <SessionProvider>
      <AuthProvider>
        <SettingsProvider>
          {children}
          <Toaster position="top-center" richColors />
        </SettingsProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 