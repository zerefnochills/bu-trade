'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  PlusCircle,
  UserCircle,
  Home,
  Repeat,
  Sparkles,
  Plus,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    fullName?: string;
    email?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Trade/Borrow', href: '/trade-borrow' },
    { label: 'Feed', href: '/feed' },
    { label: 'My listings', href: '/profile' },
    { label: 'Safety', href: '/rules' },
  ];

  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : 'U';

  const isCurrentActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/feed') return pathname === '/feed' || pathname === '/feedbacks';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white">
        {/* Top University Announcement Bar */}
        <div className="bg-[#062a6e] text-[#dbe4ff] text-[12px] sm:text-[13px] py-1.5 px-3 sm:px-4 font-normal border-b border-[#041b4d]">
          <div className="max-w-[1160px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-4 h-4 text-[#ff9aa9] shrink-0" />
              <span className="truncate">Bennett University Campus Marketplace</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-[11.5px] sm:text-[12.5px]">
              <Link
                href="/rules"
                className="text-[#dbe4ff] hover:text-white transition-colors underline-offset-2 hover:underline"
              >
                Safety rules
              </Link>
              <span className="text-[#5a6580] opacity-60 hidden sm:inline">·</span>
              <a
                href="https://www.bennett.edu.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#dbe4ff] hover:text-white transition-colors underline-offset-2 hover:underline hidden sm:inline"
              >
                bennett.edu.in
              </a>
            </div>
          </div>
        </div>

        {/* Main Sticky Navigation Bar */}
        <nav className="border-b border-[#e1e6f0] shadow-[0_2px_12px_rgba(6,42,110,0.06)] bg-white">
          <div className="max-w-[1160px] mx-auto px-3.5 sm:px-5 py-3 flex items-center justify-between gap-3">
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-[10px] bg-white p-[2px] border border-[#e1e6f0] shadow-sm flex items-center justify-center overflow-hidden">
                <Image
                  src="/Logo.png"
                  alt="BU Trade Logo"
                  width={46}
                  height={46}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <span className="text-[20px] sm:text-[23px] font-black tracking-tight text-[#062a6e]">
                BU <span className="text-[#c8102e]">Trade</span>
              </span>
            </Link>

            {/* Desktop Navigation Links (Visible on iPads in landscape & Desktop) */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = isCurrentActive(link.href);
                const displayLabel =
                  link.href === '/trade-borrow' ? 'T\u200Brade/Borrow' : link.label;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-label={link.label === 'Feed' ? 'Feedbacks' : link.label}
                    className={`px-3.5 py-2 rounded-xl text-[15px] sm:text-[16px] font-semibold transition-colors ${
                      isActive
                        ? 'text-[#c8102e] bg-[#f3f5fa] font-bold'
                        : 'text-[#14203b] hover:text-[#0066c0] hover:bg-[#eef4ff]'
                    }`}
                  >
                    {displayLabel}
                  </Link>
                );
              })}
            </div>

            {/* User Action CTA & Hamburger Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link
                href="/sell"
                aria-label="Sell an item"
                className="inline-flex items-center gap-1.5 bg-[#c8102e] hover:bg-[#a60d26] text-white text-[13.5px] sm:text-[14.5px] font-bold px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full shadow-xs hover:shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Sell</span>
              </Link>

              {user ? (
                <Link
                  href="/profile"
                  title="My profile & listings"
                  className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-[15px] shadow-sm hover:ring-2 hover:ring-[#062a6e] transition-all"
                >
                  {userInitial}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 bg-[#f3f5fa] hover:bg-[#e1e6f0] text-[#062a6e] text-[13px] sm:text-[14px] font-bold px-4 py-1.5 sm:py-2 rounded-full border border-[#e1e6f0] transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-[#062a6e]" />
                  <span>Sign in</span>
                </Link>
              )}

              {/* Hamburger Button (Mobile & Tablets) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
                className="lg:hidden p-2 rounded-xl text-[#14203b] hover:bg-[#f3f5fa] border border-[#e1e6f0] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#c8102e]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Slide-Down Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-[#e1e6f0] bg-white px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = isCurrentActive(link.href);
                  const displayLabel =
                    link.href === '/trade-borrow' ? 'Trade / Borrow' : link.label;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-colors ${
                        isActive
                          ? 'text-[#c8102e] bg-[#f3f5fa] font-semibold'
                          : 'text-[#14203b] hover:text-[#0066c0] hover:bg-[#eef4ff]'
                      }`}
                    >
                      <span>{displayLabel}</span>
                      <ChevronRight className="w-4 h-4 text-[#5a6580]/50" />
                    </Link>
                  );
                })}
              </div>

              {/* Student Campus Banner in Mobile Drawer */}
              <div className="mt-3 pt-3 border-t border-[#e1e6f0] flex items-center justify-between text-xs text-[#5a6580]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#062a6e]" />
                  <span>Verified Bennett Student Network</span>
                </div>
                <Link
                  href="/rules"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#062a6e] font-semibold hover:underline"
                >
                  Rules
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Modern App-Style Bottom Navigation Bar for Android, iPhone & iPad portrait */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e1e6f0] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(6,42,110,0.08)]"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 h-full transition-colors ${pathname === '/' ? 'text-[#c8102e] font-semibold' : 'text-[#5a6580] hover:text-[#062a6e]'
              }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10.5px]">Home</span>
          </Link>

          {/* 2. Trade/Borrow */}
          <Link
            href="/trade-borrow"
            className={`flex flex-col items-center justify-center gap-1 h-full transition-colors ${pathname.startsWith('/trade-borrow')
              ? 'text-[#c8102e] font-semibold'
              : 'text-[#5a6580] hover:text-[#062a6e]'
              }`}
          >
            <Repeat className="w-5 h-5" />
            <span className="text-[10.5px]">Borrow</span>
          </Link>

          {/* 3. Center Elevated + Sell Button */}
          <div className="flex items-center justify-center">
            <Link
              href="/sell"
              aria-label="Sell an item"
              className="w-12 h-12 rounded-full bg-[#c8102e] hover:bg-[#a60d26] active:scale-95 text-white flex items-center justify-center shadow-lg -translate-y-2 border-2 border-white transition-all"
            >
              <Plus className="w-6 h-6 text-white stroke-[2.5]" />
            </Link>
          </div>

          {/* 4. Feed */}
          <Link
            href="/feed"
            className={`flex flex-col items-center justify-center gap-1 h-full transition-colors ${pathname.startsWith('/feed')
              ? 'text-[#c8102e] font-semibold'
              : 'text-[#5a6580] hover:text-[#062a6e]'
              }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10.5px]">Feed</span>
          </Link>

          {/* 5. Profile */}
          <Link
            href={user ? '/profile' : '/login'}
            className={`flex flex-col items-center justify-center gap-1 h-full transition-colors ${pathname.startsWith('/profile') || pathname.startsWith('/login')
              ? 'text-[#c8102e] font-semibold'
              : 'text-[#5a6580] hover:text-[#062a6e]'
              }`}
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-[10.5px]">{user ? 'Profile' : 'Sign in'}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
