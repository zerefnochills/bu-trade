'use client';

// ============================================================================
// BU Trade — Bennett University Student Authentication
// Supports:
// 1. Instant Email + Password Sign In
// 2. Comprehensive Verified Account Creation (prevents impersonation)
// 3. Fallback Email OTP Verification
// ============================================================================

import React, { Suspense, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  Calendar,
  Home,
  Phone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Info,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';
import {
  BENNETT_COURSES,
  RESIDENCES,
  VALID_YEARS,
  isBennettEmail,
} from '@/lib/auth/validation';
import {
  signInWithPasswordAction,
  signUpWithPasswordAction,
  requestOtpAction,
  verifyOtpAction,
  demoLoginAction,
} from '@/app/actions/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  // Auth Modes: 'signin' | 'signup' | 'otp'
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [course, setCourse] = useState<string>(BENNETT_COURSES[0]);
  const [section, setSection] = useState('');
  const [year, setYear] = useState<number>(1);
  const [residence, setResidence] = useState<'Hostel' | 'Day scholar'>('Hostel');
  const [whatsapp, setWhatsapp] = useState('');

  // OTP State (Fallback / Test compatibility)
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Status & UI State
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isMock =
    process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');

  // Auto-populate enrollment number when email changes in signup
  const handleSignUpEmailChange = (val: string) => {
    setSignUpEmail(val);
    if (!enrollmentNo && val.includes('@')) {
      const prefix = val.split('@')[0].trim().toUpperCase();
      if (prefix.length >= 4) {
        setEnrollmentNo(prefix);
      }
    }
  };

  // --------------------------------------------------------------------------
  // 1. Handle Sign In (Email + Password)
  // --------------------------------------------------------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setInfoMessage(null);

    const trimmed = signInEmail.trim();
    if (!trimmed) {
      setError('Please enter your Bennett University email.');
      return;
    }

    if (!isBennettEmail(trimmed)) {
      setError('Only @bennett.edu.in email addresses are permitted.');
      return;
    }

    if (!signInPassword) {
      setError('Please enter your password.');
      return;
    }

    startTransition(async () => {
      const result = await signInWithPasswordAction(null, {
        email: trimmed,
        password: signInPassword,
        redirectTo,
      });

      if (result.success) {
        window.location.href = result.redirectTo || redirectTo || '/';
      } else {
        setError(result.error || 'Failed to sign in. Please verify your credentials.');
      }
    });
  };

  // --------------------------------------------------------------------------
  // 2. Handle Create Account (Full Identity Registration)
  // --------------------------------------------------------------------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setInfoMessage(null);

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      setFieldErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    startTransition(async () => {
      const result = await signUpWithPasswordAction(null, {
        email: signUpEmail.trim(),
        password: signUpPassword,
        confirmPassword: signUpConfirmPassword,
        fullName: fullName.trim(),
        enrollmentNo: enrollmentNo.trim().toUpperCase(),
        course,
        section: section.trim().toUpperCase(),
        year,
        residence,
        whatsapp: whatsapp.trim(),
      });

      if (result.success) {
        window.location.href = result.redirectTo || redirectTo || '/';
      } else {
        setError(result.error || 'Failed to create student account.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  // --------------------------------------------------------------------------
  // 3. Fallback OTP Flow (for test suites and users who prefer OTP)
  // --------------------------------------------------------------------------
  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmed = (otpEmail || signInEmail).trim();
    if (!trimmed || !isBennettEmail(trimmed)) {
      setError('Please enter a valid @bennett.edu.in email address.');
      return;
    }

    startTransition(async () => {
      const result = await requestOtpAction(null, { email: trimmed });
      if (result.success) {
        setOtpStep('code');
        setInfoMessage(result.message || 'Verification code sent to your Bennett email inbox.');
      } else {
        setError(result.error || 'Failed to send verification code.');
      }
    });
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const code = otpCode.trim();
    if (!code) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    startTransition(async () => {
      const result = await verifyOtpAction(null, {
        email: (otpEmail || signInEmail).trim(),
        code,
      });

      if (result.success && result.data) {
        const target = result.data.onboardingNeeded
          ? `/onboarding${redirectTo && redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`
          : redirectTo || '/';
        window.location.href = target;
      } else {
        setError(result.error || 'Invalid verification code. Please try again.');
      }
    });
  };

  // --------------------------------------------------------------------------
  // 4. Quick Demo Student Sign In (Mock Mode Only)
  // --------------------------------------------------------------------------
  const handleDemoLogin = () => {
    setError(null);
    startTransition(async () => {
      const result = await demoLoginAction(redirectTo);
      if (result.success) {
        window.location.href = result.redirectTo || '/';
      } else {
        setError(result.error || 'Failed to sign in with demo student account.');
      }
    });
  };

  return (
    <div className="flex-1 bg-white py-6 sm:py-12 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Card Container */}
        <div className="bg-white border border-[#e1e6f0] rounded-2xl shadow-[0_12px_36px_rgba(6,42,110,0.08)] p-5 sm:p-8">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
              <div className="w-[44px] h-[44px] rounded-xl bg-white p-[2px] border border-[#e1e6f0] shadow-sm flex items-center justify-center overflow-hidden">
                <Image
                  src="/Logo.png"
                  alt="BU Trade Logo"
                  width={44}
                  height={44}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#062a6e]">
                BU <span className="text-[#c8102e]">Trade</span>
              </span>
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold text-[#062a6e] tracking-tight">
              {mode === 'signup'
                ? 'Create Student Account'
                : mode === 'otp'
                ? 'Email Verification'
                : 'Student Sign In'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5a6580] mt-1">
              {mode === 'signup'
                ? 'Join Bennett University campus marketplace with your student identity.'
                : 'Exclusively for verified Bennett University students.'}
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Create Account */}
          {mode !== 'otp' && (
            <div className="flex p-1 bg-[#f3f5fa] rounded-xl border border-[#e1e6f0] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setFieldErrors({});
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#062a6e] shadow-xs'
                    : 'text-[#5a6580] hover:text-[#062a6e]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setFieldErrors({});
                  if (signInEmail && !signUpEmail) setSignUpEmail(signInEmail);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#062a6e] shadow-xs'
                    : 'text-[#5a6580] hover:text-[#062a6e]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-[#fff1f2] border border-[#ffccd3] rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-[#c8102e] animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div className="mb-4 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-[#166534] animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#16a34a]" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 1: SIGN IN (Email + Password) */}
          {/* ================================================================ */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Bennett Email */}
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide"
                >
                  University Email <span className="text-[#c8102e]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="your.roll@bennett.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e1e6f0] focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#5a6580] mt-1">
                  Must end in <span className="font-semibold text-[#062a6e]">@bennett.edu.in</span>
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide"
                >
                  Password <span className="text-[#c8102e]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signin-password"
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#e1e6f0] focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5a6580] hover:text-[#062a6e]"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold py-2.5 px-4 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 active:scale-[0.99] mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to BU Trade</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Secondary Options */}
              <div className="pt-2 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-xs text-[#062a6e] hover:underline font-medium block mx-auto"
                >
                  First time here? <span className="font-bold">Create student account →</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('otp');
                    setOtpStep('email');
                    setOtpEmail(signInEmail);
                    setError(null);
                  }}
                  className="text-[11.5px] text-[#5a6580] hover:text-[#062a6e] hover:underline block mx-auto"
                >
                  Forgot password? Use one-time email code
                </button>
              </div>

              {/* Offline Demo Login Button */}
              {isMock && (
                <div className="pt-3 border-t border-[#e1e6f0] mt-4">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleDemoLogin}
                    className="w-full bg-[#f3f5fa] hover:bg-[#e1e6f0] text-[#062a6e] font-semibold py-2 px-4 rounded-full border border-[#e1e6f0] text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#062a6e]" />
                    <span>1-Click Mock Student Login</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 2: CREATE ACCOUNT (Full Identity Verification) */}
          {/* ================================================================ */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Trust Badge */}
              <div className="p-3 bg-[#f0f4fc] border border-[#d6e2f7] rounded-xl flex items-start gap-2 text-xs text-[#1e3a8a]">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#062a6e] mt-0.5" />
                <div>
                  <span className="font-semibold text-[#062a6e]">Anti-Impersonation Protection:</span> All
                  student profiles require verified campus credentials to prevent fraud and maintain trust.
                </div>
              </div>

              {/* Bennett Email */}
              <div>
                <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                  University Email <span className="text-[#c8102e]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5a6580]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => handleSignUpEmailChange(e.target.value)}
                    placeholder="e.g. a26bcaaiu0005@bennett.edu.in"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none"
                  />
                </div>
                {fieldErrors.email && <p className="text-[11px] text-[#c8102e] mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Full Name & Enrollment No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                    Full Name <span className="text-[#c8102e]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5a6580]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none"
                    />
                  </div>
                  {fieldErrors.fullName && <p className="text-[11px] text-[#c8102e] mt-1">{fieldErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                    Enrollment / Roll No <span className="text-[#c8102e]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value.toUpperCase())}
                    placeholder="e.g. A26BCAAIU0005"
                    className="w-full px-3 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] font-mono uppercase placeholder-[#5a6580]/50 outline-none"
                  />
                </div>
              </div>

              {/* Course / Program */}
              <div>
                <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                  Course / Program <span className="text-[#c8102e]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5a6580]">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] outline-none cursor-pointer"
                  >
                    {BENNETT_COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section, Year & Residence */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                    Section
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-center text-[#14203b] font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                    Year <span className="text-[#c8102e]">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] outline-none cursor-pointer"
                  >
                    {VALID_YEARS.map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                    Residence <span className="text-[#c8102e]">*</span>
                  </label>
                  <select
                    value={residence}
                    onChange={(e) => setResidence(e.target.value as 'Hostel' | 'Day scholar')}
                    className="w-full px-2.5 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] outline-none cursor-pointer"
                  >
                    {RESIDENCES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                  WhatsApp Contact <span className="text-[#c8102e]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5a6580]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 9876543210 (for buyer/seller coordination)"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none"
                  />
                </div>
                {fieldErrors.whatsapp && (
                  <p className="text-[11px] text-[#c8102e] mt-1">{fieldErrors.whatsapp}</p>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                    Create Password <span className="text-[#c8102e]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5a6580]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-9 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#5a6580] hover:text-[#062a6e]"
                    >
                      {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#14203b] mb-1 uppercase tracking-wide">
                    Confirm Password <span className="text-[#c8102e]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none"
                  />
                </div>
              </div>

              {/* Submit Account Creation */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold py-2.5 px-4 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 active:scale-[0.99] mt-3"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Verified Account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Create Verified Account & Sign In</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-xs text-[#062a6e] hover:underline font-medium"
                >
                  Already have an account? <span className="font-bold">Sign in here →</span>
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 3: OTP VERIFICATION (Fallback / Test compatibility) */}
          {/* ================================================================ */}
          {mode === 'otp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-xs text-[#062a6e] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Password Sign In</span>
                </button>
              </div>

              {otpStep === 'email' ? (
                <form onSubmit={handleOtpRequest} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide">
                      Enter Bennett University Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="your.roll@bennett.edu.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-sm outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold py-2.5 px-4 rounded-full text-sm flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Request 6-Digit Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#14203b] uppercase tracking-wide">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpStep('email')}
                        className="text-xs text-[#062a6e] hover:underline"
                      >
                        Edit email
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder={isMock ? '123456' : '••••••'}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e1e6f0] focus:border-[#062a6e] rounded-xl text-center text-lg font-mono tracking-widest outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || otpCode.length < 6}
                    className="w-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold py-2.5 px-4 rounded-full text-sm flex items-center justify-center gap-2"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Sign In</span>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer Safety Trust Note */}
          <div className="mt-5 pt-4 border-t border-[#e1e6f0] text-center">
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
          <Loader2 className="w-8 h-8 animate-spin text-[#062a6e]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
