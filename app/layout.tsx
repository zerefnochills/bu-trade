import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSession } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BU Trade — Bennett University Campus Marketplace',
  description: 'Verified second-hand campus marketplace for Bennett University students.',
  icons: {
    icon: '/Logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#062a6e',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: { id: string; fullName?: string; email?: string } | null = null;
  try {
    const session = await getSession();
    if (session) {
      const db = getDatabaseService();
      const profile = await db.getProfile(session.userId);
      user = {
        id: session.userId,
        email: session.email,
        fullName: profile?.fullName,
      };
    }
  } catch {
    // Graceful fallback during static build or testing
    user = null;
  }

  return (
    <html lang="en" className={`${outfit.variable} ${plusJakartaSans.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-white text-[#14203b] min-h-screen flex flex-col antialiased w-full overflow-x-hidden">
        <Navbar user={user} />
        <main className="flex-1 flex flex-col w-full pb-20 lg:pb-0">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
