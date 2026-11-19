'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, PlusCircle, UserCircle } from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    fullName?: string;
    email?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Feedbacks', href: '/feedbacks' },
    { label: 'Sell an item', href: '/sell' },
    { label: 'My listings', href: '/profile' },
    { label: 'Safety', href: '/rules' },
  ];

  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      {/* Top University Announcement Bar */}
      <div className="bg-[#062a6e] text-[#dbe4ff] text-[12.5px] py-1.5 px-4 font-normal border-b border-[#041b4d]">
        <div className="max-w-[1160px] mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#ff9aa9]" />
            <span>The campus marketplace for Bennett University students</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/rules"
              className="text-[#dbe4ff] hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              Safety rules
            </Link>
            <span className="text-[#5a6580] opacity-60">·</span>
            <a
              href="https://www.bennett.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#dbe4ff] hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              bennett.edu.in
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Bar */}
      <nav className="border-b border-[#e1e6f0] shadow-[0_2px_12px_rgba(6,42,110,0.06)] bg-white">
        <div className="max-w-[1160px] mx-auto px-5 py-2.5 flex items-center justify-between gap-3.5 flex-wrap">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-[46px] h-[46px] rounded-[10px] bg-white p-[3px] border border-[#e1e6f0] shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/Logo.png"
                alt="BU Trade Logo"
                width={46}
                height={46}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span className="text-[21px] font-bold tracking-tight text-[#062a6e]">
              BU <span className="text-[#c8102e]">Trade</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#c8102e] bg-[#f3f5fa] font-semibold'
                      : 'text-[#14203b] hover:text-[#c8102e] hover:bg-[#f3f5fa]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Action CTA */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/sell"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#062a6e] hover:bg-[#041b4d] text-white text-[13px] font-semibold px-4 py-2 rounded-full shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-[#ff9aa9]" />
              <span>+ Sell</span>
            </Link>

            {user ? (
              <Link
                href="/profile"
                title="My profile & listings"
                className="w-[38px] h-[38px] rounded-full bg-[#c8102e] text-white flex items-center justify-center font-bold text-[14px] shadow-sm hover:ring-2 hover:ring-[#062a6e] transition-all"
              >
                {userInitial}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 bg-[#f3f5fa] hover:bg-[#e1e6f0] text-[#062a6e] text-[13px] font-semibold px-4 py-2 rounded-full border border-[#e1e6f0] transition-colors"
              >
                <UserCircle className="w-4 h-4 text-[#062a6e]" />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
