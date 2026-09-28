import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "../../../components/common/SEO.jsx";
import { ROUTES } from "../../../constants/routes.js";
import {
  Leaf,
  ShieldCheck,
  Heart,
  Globe,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
  MapPin,
  Truck,
} from "lucide-react";

export function OurStoryPage() {
  const milestones = [
    {
      year: "2021",
      title: "The Genesis",
      desc: "Founded out of frustration with misleading 'natural' supermarket labels, hidden chemical pesticides, and heavy metal contamination in everyday staples.",
    },
    {
      year: "2022",
      title: "Direct-Farm Collectives",
      desc: "Partnered directly with certified organic growers and family collectives, cutting out predatory middlemen to ensure farm-gate fair wages.",
    },
    {
      year: "2024",
      title: "North America Expansion",
      desc: "Established logistics and fulfillment hubs in New York and Toronto, delivering verified organic goods across the continental United States and Canada.",
    },
    {
      year: "2026",
      title: "Omnichannel & B2B Excellence",
      desc: "Serving over 100,000 conscious households and hundreds of enterprise wholesale partners with strict batch testing and zero-compromise purity.",
    },
  ];

  const pillars = [
    {
      icon: Leaf,
      title: "100% Certified Organic",
      desc: "Every crop and ingredient is verified organic, non-GMO, and cultivated without synthetic pesticides, hormones, or chemical fertilizers.",
    },
    {
      icon: ShieldCheck,
      title: "Rigorous 3-Tier Lab Testing",
      desc: "Every harvest batch undergoes third-party purity testing for heavy metals, micro-toxins, and residue before it ever earns the Vanom seal.",
    },
    {
      icon: Globe,
      title: "Transparent Ethical Trade",
      desc: "We ensure our farmer partners receive above-market compensation, reinvesting into clean soil restoration and rural family community welfare.",
    },
    {
      icon: Heart,
      title: "Eco-Conscious Stewardship",
      desc: "From biodegradable pouch liners to recycled shipping cartons, we relentlessly minimize waste and lower carbon emissions per shipment.",
    },
  ];

  const leadershipCommitments = [
    {
      quote:
        "True wellness cannot be built on compromise. When we started Vanom, our promise was clear: if an ingredient isn't safe and nourishing enough for our own children and elders, it will never enter our catalog.",
      author: "The Vanom Founding Team",
      role: "Vanom Global Operations, New York & Toronto",
    },
  ];

  return (
    <>
      <SEO
        title="Our Story | The Vanom Organic Journey"
        description="Discover the story behind Vanom. Learn about our commitment to certified organic nutrition, fair farm-gate pricing, and transparent wellness across the United States and Canada."
        canonicalUrl="/about"
      />

      <div className="bg-[#FAFDFB] min-h-screen">
        {/* ── Breadcrumb ── */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 text-xs text-gray-500 flex items-center gap-2">
            <Link to={ROUTES.HOME} className="hover:text-[#006B3C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Our Story</span>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-[#003D2B] text-white py-16 sm:py-24">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#A3E635_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#006B3C]/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-[#F9BC15]" />
              The Vanom Story
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Purity in Every Grain. <br className="hidden sm:inline" />
              <span className="text-[#F9BC15]">Consciousness in Every Choice.</span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
              We started Vanom with a radical conviction: the food and wellness essentials we invite
              into our homes should be 100% pure, unadulterated, and respectfully grown.
            </p>

            {/* Quick Stats Pill Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
              {[
                { value: "100%", label: "Certified Organic" },
                { value: "0", label: "Artificial Additives" },
                { value: "50+", label: "Farmer Cooperatives" },
                { value: "100k+", label: "Happy North American Homes" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <div className="text-2xl font-black text-[#F9BC15] leading-none mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-emerald-100/70 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission & Vision Split ── */}
        <section className="py-16 sm:py-24 max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Mission Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006B3C] text-xs font-bold border border-emerald-100">
                <Compass className="w-3.5 h-3.5" />
                Our North Star
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-snug">
                Rebuilding Trust Between the Soil and Your Kitchen.
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                In an era of industrial shortcuts, chemical preservation, and convoluted supply
                chains, consumers have been forced to guess what truly goes into their bodies. We
                founded Vanom to eliminate that compromise.
              </p>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We work directly with certified smallholder organic farmers across fertile ancestral
                regions, supporting biodiversity and traditional crop rotation. We pay fair prices
                directly to growers, bypassing speculative brokers, and oversee cold-milling and
                packaging to preserve vital phytonutrients.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Traceability from seed to shelf with full transparency",
                  "USDA Organic, Canada Organic, and Non-GMO compliance",
                  "Never irradiated, never fumigated with synthetic chemicals",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Card Highlight */}
            <div className="lg:col-span-6 bg-[#003D2B] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg border border-emerald-800">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#F9BC15]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#F9BC15]">
                  <Award className="w-6 h-6" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  The Vanom Pure Standard™
                </h3>

                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  Before any batch of organic pantry staples, herbal wellness infusions, or pure
                  oils is packed into a Vanom carton, it undergoes analytical testing in accredited
                  laboratories.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-base font-black text-[#F9BC15] block">Heavy Metals</span>
                    <span className="text-[11px] text-emerald-200/70">Lead, Arsenic, Mercury 0% Tolerance</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-base font-black text-[#F9BC15] block">Pesticides</span>
                    <span className="text-[11px] text-emerald-200/70">500+ chemical screen cleared</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={ROUTES.PRODUCTS}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#F9BC15] hover:text-white transition-colors"
                  >
                    Browse Our Pure Catalog <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 4 Pillars of Excellence ── */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Our Four Core Commitments
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Every policy we draft, farmer we partner with, and product we launch is measured against these pillars.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-6 rounded-2xl bg-[#FAFDFB] border border-gray-200/80 hover:border-[#006B3C]/30 hover:shadow-md transition-all duration-200 space-y-3.5 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#EAF7F0] text-[#006B3C] group-hover:bg-[#003D2B] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{pillar.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Milestones Timeline ── */}
        <section className="py-16 sm:py-24 max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Our Journey So Far
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              From a small vision of clean food to an international supply network spanning North America.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {milestones.map((m, idx) => (
              <div
                key={m.year}
                className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-3 relative hover:shadow-md transition-all"
              >
                <div className="inline-block px-3 py-1 rounded-lg bg-[#003D2B] text-[#F9BC15] font-black text-sm">
                  {m.year}
                </div>
                <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Operational Footprint (US & Canada) ── */}
        <section className="py-14 bg-[#f0f7f3] border-t border-[#e2ece5]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Our North American Hubs
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Direct regional distribution ensuring fresh, temperature-controlled transit across the USA & Canada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* United States */}
              <div className="p-6 rounded-2xl bg-white border border-[#d6e5dc] shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">United States Operations</h3>
                    <p className="text-[11px] text-gray-500">Corporate HQ & Logistics Depot</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  450 Lexington Avenue, New York, NY & Automated Container Fulfillment in Dallas, TX.
                </p>
                <div className="text-[11px] font-semibold text-[#006B3C] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Fast 2-3 Day Nationwide Delivery
                </div>
              </div>

              {/* Canada */}
              <div className="p-6 rounded-2xl bg-white border border-[#d6e5dc] shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇨🇦</span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Canada Operations</h3>
                    <p className="text-[11px] text-gray-500">North America Commercial Hub</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  300 Yonge Street, Suite 1500, Toronto, Ontario M5B 2L7.
                </p>
                <div className="text-[11px] font-semibold text-[#006B3C] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Rapid Provincial Shipping Across Canada
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Founder's Note / Team Quote ── */}
        <section className="py-16 bg-white">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-8">
            {leadershipCommitments.map((note) => (
              <div
                key={note.author}
                className="bg-[#003D2B] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden shadow-md"
              >
                <div className="text-4xl text-[#F9BC15] leading-none select-none font-serif">
                  &ldquo;
                </div>
                <blockquote className="text-base sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto italic text-emerald-100">
                  {note.quote}
                </blockquote>
                <div className="space-y-1">
                  <div className="text-sm font-black text-white">{note.author}</div>
                  <div className="text-xs text-emerald-300/80">{note.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Call To Action ── */}
        <section className="py-12 bg-[#FAFDFB] border-t border-gray-100">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-emerald-50 border border-emerald-200/70 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl font-black text-[#003D2B] tracking-tight">
                  Experience the Vanom Purity Difference
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Explore our carefully curated organic pantry, wellness, and ethical living selection.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <Link
                  to={ROUTES.PRODUCTS}
                  className="px-6 py-3 rounded-xl bg-[#003D2B] hover:bg-[#00281b] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95"
                >
                  Shop Pure Catalog <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={ROUTES.CAREERS}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-[#003D2B] border border-gray-300 font-bold text-xs sm:text-sm transition-all shadow-xs"
                >
                  Join Our Team
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default OurStoryPage;
