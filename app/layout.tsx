import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Uncensored AI Chat',
  description: 'Chat with uncensored OpenRouter models with persistent memory.',
  metadataBase: new URL(process.env.APP_BASE_URL || 'http://localhost:3000')
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
