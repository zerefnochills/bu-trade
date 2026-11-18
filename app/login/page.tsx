'use client';

// ============================================================================
// BU Trade — Bennett University Student Login Page
// 2-Step OTP Verification restricted to @bennett.edu.in
// ============================================================================

import React, { Suspense, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { isBennettEmail } from '@/lib/auth/validation';
import { requestOtpAction, verifyOtpAction } from '@/app/actions/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your Bennett University email.');
      return;
    }

    if (!isBennettEmail(trimmedEmail)) {
      setError(
        'Only @bennett.edu.in email addresses are permitted. External email domains (e.g. gmail.com) are not allowed.'
      );
      return;
    }

    startTransition(async () => {
      const result = await requestOtpAction(null, { email: trimmedEmail });
      if (result.success) {
        setStep('otp');
        setInfoMessage('Verification code sent! (Demo OTP: 123456)');
      } else {
        setError(result.error || 'Failed to send verification code.');
      }
    });
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmedCode = otpCode.trim();
    if (!trimmedCode) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    startTransition(async () => {
      const result = await verifyOtpAction(null, {
        email: email.trim(),
        code: trimmedCode,
      });

      if (result.success && result.data) {
        if (result.data.onboardingNeeded) {
          const target = `/onboarding${
            redirectTo && redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''
          }`;
          router.push(target);
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      } else {
        setError(result.error || 'Invalid verification code. Please try again.');
      }
    });
  };

  const handleResendOtp = () => {
    setError(null);
    setInfoMessage(null);
    startTransition(async () => {
      const result = await requestOtpAction(null, { email: email.trim() });
      if (result.success) {
        setInfoMessage('A new verification code has been sent. (Mock: 123456)');
      } else {
        setError(result.error || 'Failed to resend verification code.');
      }
    });
  };

  return (
    <div className="flex-1 bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white border border-[#e1e6f0] rounded-2xl shadow-[0_12px_36px_rgba(6,42,110,0.08)] p-7 sm:p-9">
          {/* Logo & Header */}
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-[50px] h-[50px] rounded-xl bg-white p-[3px] border border-[#e1e6f0] shadow-sm flex items-center justify-center overflow-hidden">
                <Image
                  src="/Logo.png"
                  alt="BU Trade Logo"
                  width={50}
                  height={50}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#062a6e]">
                BU <span className="text-[#c8102e]">Trade</span>
              </span>
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold text-[#062a6e] mt-1">
              {step === 'email' ? 'Student Sign In' : 'Enter Verification Code'}
            </h1>
            <p className="text-sm text-[#5a6580] mt-1.5">
              {step === 'email'
                ? 'Sign in with your verified Bennett University email'
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-[#fff1f2] border border-[#ffccd3] rounded-xl flex items-start gap-2.5 text-sm text-[#c8102e]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div className="mb-5 p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-start gap-2.5 text-sm text-[#166534]">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#16a34a]" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide">
                  University Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@bennett.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e1e6f0] focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-[#5a6580] mt-1.5">
                  Must end in <span className="font-semibold text-[#062a6e]">@bennett.edu.in</span>
                </p>
              </div>

              {/* Dev / Mock Notice */}
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-start gap-2 text-xs text-[#475569]">
                <Info className="w-4 h-4 flex-shrink-0 text-[#062a6e] mt-0.5" />
                <div>
                  <span className="font-semibold text-[#062a6e]">Campus Demo Mode:</span> Enter any valid{' '}
                  <code className="bg-white px-1 py-0.5 rounded border border-[#cbd5e1] font-mono text-[11px]">
                    @bennett.edu.in
                  </code>{' '}
                  email. The test verification code is <strong className="text-[#062a6e]">123456</strong>.
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold py-2.5 px-4 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 active:scale-[0.99] mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with University Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Form */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="otp" className="block text-xs font-semibold text-[#14203b] uppercase tracking-wide">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className="text-xs text-[#062a6e] hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Edit email</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e1e6f0] focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-center text-lg font-mono tracking-widest text-[#14203b] placeholder-[#5a6580]/40 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-[#5a6580]">Mock code: <span className="font-mono font-bold text-[#062a6e]">123456</span></p>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleResendOtp}
                    className="text-xs font-medium text-[#c8102e] hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || otpCode.length < 6}
                className="w-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold py-2.5 px-4 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 active:scale-[0.99] mt-3"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Safety Trust Note */}
          <div className="mt-6 pt-5 border-t border-[#e1e6f0] text-center">
            <p className="text-xs text-[#5a6580] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0a8a4a]" />
              <span>Campus verified marketplace for Bennett University</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#002147]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
