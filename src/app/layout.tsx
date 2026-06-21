import type { Metadata, Viewport } from 'next';
import { OfflineBanner } from '@/components/OfflineBanner';
import { PersonProvider } from '@/components/PersonProvider';
import { PhotosProvider } from '@/components/PhotosProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { WelcomeModal } from '@/components/WelcomeModal';
import './fonts.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seoul × Incheon · 8-Day Itinerary',
  description:
    'Eight days of palaces, hanboks, K-beauty, viral mochi, personal colour analysis and outlet hauls — a mother-and-daughters trip from Singapore.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Seoul Trip',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FFF6EC',
  viewportFit: 'cover', // extend under the notch / Dynamic Island on iPhone
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PersonProvider>
          <PhotosProvider>{children}</PhotosProvider>
          <WelcomeModal />
        </PersonProvider>
        <OfflineBanner />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
