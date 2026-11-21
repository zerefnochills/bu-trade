'use client';

// ============================================================================
// BU Trade — First-Time Student Onboarding Form Component
// Captures Full Name, Course, Year (1-5), Residence, and optional WhatsApp
// ============================================================================

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  GraduationCap,
  Calendar,
  Home,
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { BENNETT_COURSES, RESIDENCES, VALID_YEARS } from '@/lib/auth/validation';
import { completeOnboardingAction } from '@/app/actions/auth';

interface OnboardingFormProps {
  userEmail: string;
  redirectTo?: string;
}

export default function OnboardingForm({ userEmail, redirectTo = '/' }: OnboardingFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState<number>(1);
  const [residence, setResidence] = useState<'Hostel' | 'Day scholar'>('Hostel');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await completeOnboardingAction(null, {
        fullName,
        course,
        year,
        residence,
        whatsapp: whatsapp.trim() || undefined,
      });

      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(result.error || 'Failed to complete profile onboarding.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <div className="max-w-[500px] w-full">
      <div className="bg-white border border-[#e1e6f0] rounded-2xl shadow-[0_12px_36px_rgba(6,42,110,0.08)] p-5 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-[46px] h-[46px] rounded-xl bg-white p-[3px] border border-[#e1e6f0] shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/Logo.png"
                alt="BU Trade Logo"
                width={46}
                height={46}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#062a6e]">
              BU <span className="text-[#c8102e]">Trade</span>
            </span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-[#062a6e] mt-2">
            Complete Your Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#5a6580] mt-1">
            Set up your campus identity to start buying and selling on BU Trade.
          </p>

          {/* Verified Email Badge */}
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 bg-[#f3f5fa] border border-[#e1e6f0] rounded-full text-xs font-semibold text-[#062a6e]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0a8a4a]" />
            <span>{userEmail}</span>
            <span className="text-[10px] text-[#0a8a4a] bg-[#e6f4ea] px-1.5 py-0.2 rounded-full font-bold ml-1">
              Verified
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-[#fff1f2] border border-[#ffccd3] rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-[#c8102e]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide">
              Full Name <span className="text-[#c8102e]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className={`w-full pl-10 pr-4 py-2 bg-white border ${
                  fieldErrors.fullName ? 'border-[#c8102e]' : 'border-[#e1e6f0]'
                } focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none transition-all`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-xs text-[#c8102e] mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* Course / Program */}
          <div>
            <label htmlFor="course" className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide">
              Course / Degree <span className="text-[#c8102e]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <input
                id="course"
                type="text"
                required
                list="bennett-courses"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech Computer Science (CSE)"
                className={`w-full pl-10 pr-4 py-2 bg-white border ${
                  fieldErrors.course ? 'border-[#c8102e]' : 'border-[#e1e6f0]'
                } focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none transition-all`}
              />
              <datalist id="bennett-courses">
                {BENNETT_COURSES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            {fieldErrors.course && (
              <p className="text-xs text-[#c8102e] mt-1">{fieldErrors.course}</p>
            )}
          </div>

          {/* 2-Column: Year of Study & Residence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide">
                Year of Study <span className="text-[#c8102e]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5a6580]">
                  <Calendar className="w-4 h-4" />
                </div>
                <select
                  id="year"
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={`w-full pl-9 pr-3 py-2 bg-white border ${
                    fieldErrors.year ? 'border-[#c8102e]' : 'border-[#e1e6f0]'
                  } focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-sm text-[#14203b] outline-none transition-all`}
                >
                  {VALID_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y === 1
                        ? '1st Year'
                        : y === 2
                        ? '2nd Year'
                        : y === 3
                        ? '3rd Year'
                        : `${y}th Year`}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.year && (
                <p className="text-xs text-[#c8102e] mt-1">{fieldErrors.year}</p>
              )}
            </div>

            {/* Residence */}
            <div>
              <label htmlFor="residence" className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide">
                Residence <span className="text-[#c8102e]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5a6580]">
                  <Home className="w-4 h-4" />
                </div>
                <select
                  id="residence"
                  required
                  value={residence}
                  onChange={(e) => setResidence(e.target.value as 'Hostel' | 'Day scholar')}
                  className={`w-full pl-9 pr-3 py-2 bg-white border ${
                    fieldErrors.residence ? 'border-[#c8102e]' : 'border-[#e1e6f0]'
                  } focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-sm text-[#14203b] outline-none transition-all`}
                >
                  {RESIDENCES.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.residence && (
                <p className="text-xs text-[#c8102e] mt-1">{fieldErrors.residence}</p>
              )}
            </div>
          </div>

          {/* WhatsApp Contact (Optional) */}
          <div>
            <label htmlFor="whatsapp" className="block text-xs font-semibold text-[#14203b] mb-1.5 uppercase tracking-wide">
              WhatsApp Contact <span className="text-[#5a6580] font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6580]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full pl-10 pr-4 py-2 bg-white border ${
                  fieldErrors.whatsapp ? 'border-[#c8102e]' : 'border-[#e1e6f0]'
                } focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-sm text-[#14203b] placeholder-[#5a6580]/50 outline-none transition-all`}
              />
            </div>
            <p className="text-[11px] text-[#5a6580] mt-1">
              Hidden from visitors. Only revealed to students who enquire about your listing.
            </p>
            {fieldErrors.whatsapp && (
              <p className="text-xs text-[#c8102e] mt-1">{fieldErrors.whatsapp}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold py-2.5 px-4 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 active:scale-[0.99] mt-3"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Profile & Start Trading</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
