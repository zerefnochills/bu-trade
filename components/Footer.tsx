import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#062a6e] text-[#b9c8f0] py-8 sm:py-9 border-t border-[#041b4d] mt-auto pb-24 lg:pb-9">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-5 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-[13px] sm:text-[14px]">
        {/* Brand Block */}
        <Link href="/" className="flex items-center gap-2.5 text-white group">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-white p-[2px] flex items-center justify-center overflow-hidden">
            <Image
              src="/Logo.png"
              alt="BU Trade Logo"
              width={36}
              height={36}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-white">
            BU <span className="text-[#c8102e]">Trade</span>
          </span>
        </Link>

        {/* Disclaimer */}
        <div className="text-center text-[#dbe4ff]/80 max-w-[480px]">
          Made by students, for students. Not an official Bennett University service.
        </div>

        {/* Safety link & Copyright */}
        <div className="flex items-center gap-4 text-[#dbe4ff]/90">
          <Link
            href="/rules"
            className="hover:text-white hover:underline underline-offset-4 transition-colors"
          >
            Campus safety guidelines
          </Link>
          <span className="opacity-40">·</span>
          <span>© 2026 BU Trade</span>
        </div>
      </div>
    </footer>
  );
}
