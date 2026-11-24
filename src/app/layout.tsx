import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FORMA — บันทึกสรีระและสมดุล',
  description: 'Warm paper notebook & brass tape fitness tracker. Mobile-only, no auth, private in localStorage.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#F3F0EA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#F3F0EA] text-[#1C1B19] antialiased selection:bg-[#A6844A]/20">
        <div className="mobile-frame min-h-screen shadow-sm md:shadow-md border-x-0 md:border-x border-[#E4DDD2]">
          {children}
        </div>
      </body>
    </html>
  );
}
