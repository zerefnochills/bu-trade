import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Ban,
  HelpCircle,
  PhoneCall,
  UtensilsCrossed,
  BookOpen,
  Building,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Campus Safety & Community Rules — BU Trade',
  description:
    'Designated safe exchange zones, daytime transaction hours, and campus trading rules for Bennett University students.',
};

export default function RulesPage() {
  return (
    <div className="flex-1 bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1000px] mx-auto">
        {/* Header Hero */}
        <div className="text-center mb-10 pb-8 border-b border-[#e1e6f0]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f3f5fa] border border-[#e1e6f0] rounded-full text-xs font-semibold text-[#062a6e] mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0a8a4a]" />
            <span>Bennett University Campus Standards</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#062a6e]">
            Campus Safety & Community Rules
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5a6580] max-w-2xl mx-auto">
            BU Trade connects verified students right here on campus. Keep your exchanges safe,
            respectful, and hassle-free by following these Bennett University guidelines.
          </p>
        </div>

        {/* Section 1: Designated Safe Exchange Zones */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#c8102e]" />
            <h2 className="text-xl font-bold text-[#062a6e]">
              3 Designated Campus Safe Exchange Zones
            </h2>
          </div>
          <p className="text-sm text-[#5a6580] mb-6">
            Only meet in populated, well-lit campus areas equipped with CCTV security and reliable
            Wi-Fi for payments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Safe Zone 1 */}
            <div className="p-5 rounded-2xl border border-[#e1e6f0] bg-[#fafbfd] hover:border-[#062a6e]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#e6edfa] text-[#062a6e] flex items-center justify-center mb-3">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#062a6e] text-base mb-1">
                Food Court & Cafeteria
              </h3>
              <p className="text-xs text-[#5a6580] mb-3">
                Central Mess building & Tuck Shop plaza
              </p>
              <div className="text-xs text-[#14203b] space-y-1.5">
                <p>
                  <strong>Peak Hours:</strong> 12:00 PM – 2:00 PM & 4:30 PM – 7:00 PM
                </p>
                <p>
                  <strong>Best for:</strong> General item handovers, clothes, lab gear, stationery.
                </p>
                <p className="text-[#0a8a4a] font-medium flex items-center gap-1 mt-2">
                  <CheckCircle className="w-3.5 h-3.5" /> High foot-traffic & strong Wi-Fi
                </p>
              </div>
            </div>

            {/* Safe Zone 2 */}
            <div className="p-5 rounded-2xl border border-[#e1e6f0] bg-[#fafbfd] hover:border-[#062a6e]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#e6edfa] text-[#062a6e] flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#062a6e] text-base mb-1">
                Central Library Ground Floor Lobby
              </h3>
              <p className="text-xs text-[#5a6580] mb-3">
                Academic Block A, Reading Lounge entrance
              </p>
              <div className="text-xs text-[#14203b] space-y-1.5">
                <p>
                  <strong>Active Hours:</strong> 10:00 AM – 6:00 PM
                </p>
                <p>
                  <strong>Best for:</strong> Textbooks, notes, electronics, laptops, calculators.
                </p>
                <p className="text-[#0a8a4a] font-medium flex items-center gap-1 mt-2">
                  <CheckCircle className="w-3.5 h-3.5" /> 24/7 CCTV & test power outlets
                </p>
              </div>
            </div>

            {/* Safe Zone 3 */}
            <div className="p-5 rounded-2xl border border-[#e1e6f0] bg-[#fafbfd] hover:border-[#062a6e]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#e6edfa] text-[#062a6e] flex items-center justify-center mb-3">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#062a6e] text-base mb-1">
                Main Gate Security Desk
              </h3>
              <p className="text-xs text-[#5a6580] mb-3">
                Main Entrance Security & Visitor Plaza
              </p>
              <div className="text-xs text-[#14203b] space-y-1.5">
                <p>
                  <strong>Active Hours:</strong> 9:00 AM – 7:00 PM
                </p>
                <p>
                  <strong>Best for:</strong> Bicycles, bulky hostel goods, trades with day scholars.
                </p>
                <p className="text-[#0a8a4a] font-medium flex items-center gap-1 mt-2">
                  <CheckCircle className="w-3.5 h-3.5" /> 24/7 Security guard presence
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Daytime Transaction Hours Alert */}
        <div className="mb-12 p-5 bg-[#fff8eb] border border-[#fde68a] rounded-2xl flex items-start gap-3.5">
          <Clock className="w-5 h-5 text-[#b45309] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#78350f]">
            <h3 className="font-bold text-base text-[#92400e] mb-1">
              Daytime Trade Hours: 9:00 AM – 7:00 PM Only
            </h3>
            <p>
              Always complete transactions between <strong>9:00 AM</strong> and <strong>7:00 PM</strong>.
              Do not arrange meetings late at night or in secluded locations such as basement
              parking lots, unlit sports fields, or private hostel rooms. Entering another hostel
              violates Bennett University residence regulations.
            </p>
          </div>
        </div>

        {/* Section 3: Inspection & Payment Etiquette */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-[#0a8a4a]" />
            <h2 className="text-xl font-bold text-[#062a6e]">
              Inspection & Payment Etiquette
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl border border-[#e1e6f0] bg-white">
              <h3 className="font-bold text-[#062a6e] text-sm mb-2">
                1. Inspect Before Handover
              </h3>
              <ul className="text-xs text-[#5a6580] space-y-2 list-disc pl-4">
                <li>
                  <strong>Electronics & Gadgets:</strong> Bring a charging cable or portable power bank. Power on laptops, calculators, and audio gear to test functionality before paying.
                </li>
                <li>
                  <strong>Cycles & Transport:</strong> Test brakes, gear transitions, tire inflation, and pedal stability on campus roads.
                </li>
                <li>
                  <strong>Books & Course Notes:</strong> Verify edition, course syllabus alignment, and check for missing pages.
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-[#e1e6f0] bg-white">
              <h3 className="font-bold text-[#062a6e] text-sm mb-2">
                2. UPI or Cash on Handover Only
              </h3>
              <ul className="text-xs text-[#5a6580] space-y-2 list-disc pl-4">
                <li>
                  <strong>Zero Advance Payments:</strong> Never send token money or deposits before meeting in person and holding the item.
                </li>
                <li>
                  <strong>No Payment QR Scanning:</strong> Never scan an incoming QR code to receive money. Scanning a QR code only debits your own account.
                </li>
                <li>
                  <strong>Pay via UPI or Cash:</strong> Use Google Pay, PhonePe, Paytm, or exact cash only after hands-on inspection.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: Zero-Tolerance Prohibited Items */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-[#c8102e]" />
            <h2 className="text-xl font-bold text-[#062a6e]">
              Zero-Tolerance Prohibited Items
            </h2>
          </div>
          <p className="text-sm text-[#5a6580] mb-5">
            Listing or trading any of the following items violates the Bennett University Student
            Code of Conduct and will result in permanent platform ban, disciplinary committee
            referral, and university action:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl border border-[#ffccd3] bg-[#fff5f6] text-xs">
              <div className="font-bold text-[#c8102e] mb-1 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>Alcohol, Tobacco & Vapes</span>
              </div>
              <p className="text-[#5a6580]">
                E-cigarettes, vapes, pods, cigarettes, tobacco products, and all alcoholic beverages.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#ffccd3] bg-[#fff5f6] text-xs">
              <div className="font-bold text-[#c8102e] mb-1 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>Drugs & Controlled Substances</span>
              </div>
              <p className="text-[#5a6580]">
                Illicit substances, narcotics, and unauthorized prescription medicines. Immediate police reporting.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#ffccd3] bg-[#fff5f6] text-xs">
              <div className="font-bold text-[#c8102e] mb-1 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>Weapons & Hazardous Items</span>
              </div>
              <p className="text-[#5a6580]">
                Knives, fireworks, explosive crackers, replica firearms, laser pointers, and dangerous chemicals.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#ffccd3] bg-[#fff5f6] text-xs">
              <div className="font-bold text-[#c8102e] mb-1 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>Exam Materials & Cheating</span>
              </div>
              <p className="text-[#5a6580]">
                Leaked question papers, midterm/endterm solutions, assignment proxies, and commercial cheating aids.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#ffccd3] bg-[#fff5f6] text-xs">
              <div className="font-bold text-[#c8102e] mb-1 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>University & Stolen Property</span>
              </div>
              <p className="text-[#5a6580]">
                Hostel beds, study chairs, lab equipment, library books, and items without rightful ownership.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#ffccd3] bg-[#fff5f6] text-xs">
              <div className="font-bold text-[#c8102e] mb-1 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>Counterfeit & Pirated Media</span>
              </div>
              <p className="text-[#5a6580]">
                Knockoff merchandise, pirated software licenses, unauthorized textbook PDFs, and fake tech.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Marketplace Rules & 10-Item Cap */}
        <div className="mb-12 p-6 rounded-2xl border border-[#e1e6f0] bg-[#fafbfd]">
          <h2 className="text-base sm:text-lg font-bold text-[#062a6e] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#062a6e]" />
            Marketplace Rules & Listing Limits
          </h2>
          <ul className="text-xs sm:text-sm text-[#5a6580] space-y-2 list-disc pl-5">
            <li>
              <strong>10 Active Listings Limit:</strong> Each Bennett student can maintain a maximum of 10 active listings at any given time to prevent commercial hoarding.
            </li>
            <li>
              <strong>P2P Campus Directory:</strong> BU Trade connects verified students. The platform does not hold escrow funds or provide shipping/delivery.
            </li>
            <li>
              <strong>Honest Descriptions:</strong> Disclose age, cosmetic condition, battery health, and reasons for selling accurately.
            </li>
            <li>
              <strong>Mark Sold Promptly:</strong> Once an exchange is completed, please mark your item as sold in "My listings" to keep the feed fresh.
            </li>
          </ul>
        </div>

        {/* Section 6: Moderation & Help Contacts */}
        <div className="p-6 rounded-2xl bg-[#062a6e] text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#ff9aa9]" />
                Notice Something Suspicious?
              </h2>
              <p className="text-xs text-[#dbe4ff] mt-1 max-w-xl">
                Click <strong>"Report listing"</strong> on any item card to flag prohibited items, spam, or safety concerns. Our student moderation team reviews reports daily.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-[#041b4d] px-4 py-2.5 rounded-xl border border-white/10">
              <PhoneCall className="w-4 h-4 text-[#ff9aa9]" />
              <div>
                <div className="font-semibold">Main Gate Security Desk</div>
                <div className="text-[#dbe4ff]">Campus Emergency Ext: 1000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
