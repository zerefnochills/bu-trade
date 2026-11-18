import Link from 'next/link';
import { getDatabaseService } from '@/lib/db';
import { Search, Shield, Sparkles, Tag, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = getDatabaseService();
  const listings = await db.getListings();

  const categories = [
    { label: 'All', emoji: '🏷️' },
    { label: 'Books & notes', emoji: '📚' },
    { label: 'Electronics', emoji: '💻' },
    { label: 'Cycles & transport', emoji: '🚲' },
    { label: 'Hostel essentials', emoji: '🛏️' },
    { label: 'Furniture', emoji: '🪑' },
    { label: 'Clothing', emoji: '👕' },
    { label: 'Stationery & lab gear', emoji: '🧪' },
    { label: 'Other', emoji: '📦' },
  ];

  return (
    <div className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#041b4d] via-[#062a6e] to-[#0a3a94] text-white py-16 md:py-20 px-5">
        {/* Red accent glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#c8102e]/20 blur-3xl pointer-events-none" />

        <div className="max-w-[1160px] mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#ff9aa9] text-[12.5px] font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bennett University Verified Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.15] mb-5">
            Buy & sell with fellow <span className="text-[#ff9aa9]">Bennett</span> students.
          </h1>

          <p className="text-[#c9d6f7] text-base sm:text-lg max-w-2xl font-normal leading-relaxed mb-8">
            Verified BU students only. Books, cycles, electronics, hostel essentials and more
            traded safely on campus.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl bg-white rounded-full p-1.5 shadow-2xl flex items-center gap-2 border border-white/40">
            <div className="pl-4 text-[#5a6580]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search cycles, books, calculators, lamps..."
              className="flex-1 bg-transparent border-0 text-[#14203b] placeholder:text-[#5a6580] text-[15px] focus:outline-none px-2"
              readOnly
            />
            <Link
              href="/sell"
              className="bg-[#c8102e] hover:bg-[#a60d26] text-white text-[14px] font-semibold px-6 py-2.5 rounded-full transition-colors shrink-0 shadow"
            >
              + Sell item
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Trust & Stats Bar */}
      <div className="max-w-[1160px] mx-auto px-5 -mt-7 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(6,42,110,0.10)] border border-[#e1e6f0]">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-[#f3f5fa] text-[#062a6e] flex items-center justify-center font-bold">
              <Shield className="w-5 h-5 text-[#062a6e]" />
            </div>
            <div>
              <div className="text-[18px] font-bold text-[#062a6e] leading-tight">100%</div>
              <div className="text-[12.5px] text-[#5a6580]">Verified BU Emails</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-[#f3f5fa] text-[#062a6e] flex items-center justify-center font-bold">
              <Tag className="w-5 h-5 text-[#062a6e]" />
            </div>
            <div>
              <div className="text-[18px] font-bold text-[#062a6e] leading-tight">8 Categories</div>
              <div className="text-[12.5px] text-[#5a6580]">Campus Specific</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-[#f3f5fa] text-[#062a6e] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-[#062a6e]" />
            </div>
            <div>
              <div className="text-[18px] font-bold text-[#062a6e] leading-tight">Zero Fees</div>
              <div className="text-[12.5px] text-[#5a6580]">Student to Student</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-[#f3f5fa] text-[#062a6e] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-[#c8102e]" />
            </div>
            <div>
              <div className="text-[18px] font-bold text-[#062a6e] leading-tight">Max 10</div>
              <div className="text-[12.5px] text-[#5a6580]">Active Listing Cap</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Marketplace Section */}
      <section className="max-w-[1160px] mx-auto px-5 py-12">
        {/* Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {categories.map((cat, idx) => (
            <button
              key={cat.label}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border ${
                idx === 0
                  ? 'bg-[#062a6e] text-white border-[#062a6e] shadow-sm'
                  : 'bg-white text-[#14203b] border-[#e1e6f0] hover:bg-[#f3f5fa] hover:border-[#062a6e]/30'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#062a6e] tracking-tight relative pb-2 inline-block">
              Recent Campus Listings
              <span className="absolute left-0 bottom-0 w-11 h-[3px] bg-[#c8102e] rounded-full" />
            </h2>
            <p className="text-[14px] text-[#5a6580] mt-1">
              {listings.length} verified items available right now on campus
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-[#e1e6f0] overflow-hidden shadow-sm hover:shadow-[0_14px_30px_rgba(6,42,110,0.12)] hover:-translate-y-1 transition-all duration-200 flex flex-col"
            >
              {/* Image / Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-[#f3f5fa] to-[#e1e6f0] flex items-center justify-center text-4xl relative overflow-hidden border-b border-[#e1e6f0]">
                {item.category === 'Cycles & transport' && '🚲'}
                {item.category === 'Stationery & lab gear' && '🧪'}
                {item.category === 'Hostel essentials' && '🛏️'}
                {item.category === 'Electronics' && '💻'}
                {item.category === 'Furniture' && '🪑'}
                {item.category === 'Books & notes' && '📚'}
                {item.category === 'Clothing' && '👕'}
                {item.category === 'Other' && '📦'}

                <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#062a6e] border border-[#e1e6f0]">
                  {item.category}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[20px] font-bold text-[#c8102e] mb-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                  <h3 className="font-semibold text-[#14203b] text-[15px] group-hover:text-[#062a6e] transition-colors line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-[#5a6580] line-clamp-2 mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f3f5fa] flex items-center justify-between text-[12px] text-[#5a6580]">
                  <span>{item.sellerCourse || 'Bennett Student'}</span>
                  <span className="text-[#0a8a4a] font-medium bg-[#0a8a4a]/10 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
