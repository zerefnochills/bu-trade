import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans bg-white text-[#14203b] min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
