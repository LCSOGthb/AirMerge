import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirMerge',
  description: 'Real-time Air Quality Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
