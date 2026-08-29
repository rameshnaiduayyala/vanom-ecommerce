import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import { toast } from "../../../components/ui/Toast.jsx";
import { Clock, Copy, Check, ArrowRight, Tag } from "lucide-react";

export function FlashDealsAdBanner() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Coupon Copied!", `Code "${code}" applied to clipboard.`);
    setTimeout(() => setCopied(false), 3000);
  };

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-xl bg-[#003876] border border-[#00275a] p-6 sm:p-8 text-white">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,224,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,224,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className="text-center lg:text-left max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FFE000] text-[#003876] text-[10px] font-black uppercase tracking-widest">
              Limited-Time Commercial Offer
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Get Instant <span className="text-[#FFE000]">20% OFF</span> on Master Packaging &amp; FMCG Consignments
            </h3>
            <p className="text-xs text-white/60">
              Applicable on corrugated boxes, 25 KG rice sacks, and commercial kitchen appliances.
            </p>
          </div>

          {/* Center countdown */}
          <div className="flex items-center gap-3 bg-[#002a5e] px-5 py-3 rounded-xl border border-white/10">
            <Clock className="w-4 h-4 text-[#FFE000] shrink-0" />
            <div className="flex items-center gap-1.5 font-mono font-bold text-center">
              {[
                { val: pad(timeLeft.hours), label: "HRS" },
                { val: pad(timeLeft.minutes), label: "MIN" },
                { val: pad(timeLeft.seconds), label: "SEC" },
              ].map(({ val, label }, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="bg-white/10 px-2.5 py-1.5 rounded-lg">
                    <span className={`text-base ${i === 2 ? "text-[#FFE000]" : "text-white"}`}>{val}</span>
                    <span className="block text-[9px] font-sans text-white/40 uppercase">{label}</span>
                  </div>
                  {i < 2 && <span className="text-[#FFE000] font-black">:</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: coupon + CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => handleCopy("VANOM20")}
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-bold text-[#FFE000] hover:bg-white/15 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>VANOM20</span>
              </div>
              {copied ? (
                <span className="text-[11px] font-sans text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copied
                </span>
              ) : (
                <span className="text-[11px] font-sans text-white/50 flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </span>
              )}
            </button>

            <Link to={ROUTES.PRODUCTS} className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#FFE000] text-[#003876] text-sm font-black hover:bg-[#FFD100] transition-colors cursor-pointer">
                Claim Deal
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
