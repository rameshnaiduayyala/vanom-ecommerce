import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import { toast } from "../../../components/ui/Toast.jsx";
import {
  Sparkles,
  Clock,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Tag,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";

export function FlashDealsAdBanner() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-brand-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-brand-500/30">
        {/* Glow Effects */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left info */}
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Limited-Time Commercial Flash Sale</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Get Instant <span className="text-gold-400">20% OFF</span> on Master Packaging & FMCG Consignments
            </h3>

            <p className="text-xs sm:text-sm text-slate-300">
              Applicable on all bulk corrugated boxes, 25KG rice sacks, and commercial kitchen appliances.
            </p>
          </div>

          {/* Center Countdown Clock */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
            <Clock className="w-5 h-5 text-gold-400 shrink-0" />
            <div className="flex items-center gap-1.5 text-center font-mono font-bold">
              <div className="bg-slate-950/70 px-2.5 py-1.5 rounded-lg">
                <span className="text-base text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="block text-[9px] font-sans text-slate-400 uppercase">Hrs</span>
              </div>
              <span className="text-gold-400 font-black text-lg">:</span>
              <div className="bg-slate-950/70 px-2.5 py-1.5 rounded-lg">
                <span className="text-base text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="block text-[9px] font-sans text-slate-400 uppercase">Min</span>
              </div>
              <span className="text-gold-400 font-black text-lg">:</span>
              <div className="bg-slate-950/70 px-2.5 py-1.5 rounded-lg">
                <span className="text-base text-gold-400">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="block text-[9px] font-sans text-slate-400 uppercase">Sec</span>
              </div>
            </div>
          </div>

          {/* Right Coupon & CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => handleCopy("VANOM20")}
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-950 border border-gold-500/50 text-xs font-mono font-bold text-gold-400 hover:bg-slate-900 transition-colors"
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
                <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </span>
              )}
            </button>

            <Link to={ROUTES.PRODUCTS} className="w-full sm:w-auto">
              <Button
                variant="gold"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto font-bold text-slate-950 shadow-md"
              >
                Claim Deal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
