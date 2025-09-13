import './globals.css';
import 'prism-themes/themes/prism-vsc-dark-plus.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/lib/theme-context';

export const metadata: Metadata = {
  title: 'GoAI - Инциденты',
  description: 'Events summarization and analysis',
  keywords: ['AI', 'chat', 'ChatGPT', 'OpenRouter', 'Mistral'],
  authors: [{ name: 'Charin' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}