import './globals.css';
import 'prism-themes/themes/prism-vsc-dark-plus.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'GoAI - Инциденты',
  description: 'Events summarization and analysis',
  keywords: ['AI', 'chat', 'ChatGPT', 'OpenRouter', 'Mistral'],
  authors: [{ name: 'Charin' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-gray-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}