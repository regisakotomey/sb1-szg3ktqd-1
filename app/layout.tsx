import './globals.css';
import type { Metadata } from 'next';
import { WelcomeProvider } from '@/components/providers/WelcomeProvider';
import { theme } from '@/lib/theme';

export const metadata: Metadata = {
  title: `${theme.name} - Votre réseau social commercial`,
  description: `Découvrez ${theme.name}, votre réseau social commercial.`,
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="text-[15px] sm:text-[16px]">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
      </head>
      <body suppressHydrationWarning={true} className="antialiased touch-manipulation">
        <WelcomeProvider>
          {children}
        </WelcomeProvider>
      </body>
    </html>
  );
}