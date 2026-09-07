import React, { useState } from "react";
import { Link } from "react-router-dom";

export function NewsletterAppBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Newsletter Subscription Box (7 Cols) */}
          <div className="lg:col-span-6 bg-[#f7faf8] rounded-2xl p-6 sm:p-8 flex flex-col justify-center border border-[#e2ece5] relative overflow-hidden">
            {/* Subtle leaf watermark */}
            <div className="relative z-10 max-w-md">
              <h3 className="text-xl sm:text-2xl font-black text-[#0f2b1d] tracking-tight">
                Get the Latest Updates
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-5">
                New arrivals, exclusive offers and more.
              </p>

              {subscribed ? (
                <div className="p-3 bg-[#EAF7F0] text-[#006B3C] font-bold text-xs rounded-xl border border-[#006B3C]/20 flex items-center gap-2">
                  ✓ Thank you for subscribing to Vanom updates!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B] text-gray-800 placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 sm:py-3 rounded-xl bg-[#003D2B] hover:bg-[#00281b] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Download Our App Card with Mockup (5 Cols) */}
          <div className="lg:col-span-6 bg-[#003D2B] rounded-2xl p-6 sm:p-8 flex items-center justify-between overflow-hidden relative shadow-sm">
            
            {/* Left side text & store buttons */}
            <div className="relative z-10 max-w-xs space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Download Our App
                </h3>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Shop anytime, anywhere.
                </p>
              </div>

              {/* App Store / Google Play Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {/* Google Play */}
                <a
                  href="#google-play"
                  className="flex items-center gap-2 bg-black hover:bg-neutral-900 border border-white/10 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <span className="text-base leading-none">▶</span>
                  <div className="text-left leading-none">
                    <span className="text-[8px] uppercase tracking-wider text-white/70 block">Get it on</span>
                    <span className="text-[11px] font-bold">Google Play</span>
                  </div>
                </a>

                {/* App Store */}
                <a
                  href="#app-store"
                  className="flex items-center gap-2 bg-black hover:bg-neutral-900 border border-white/10 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <span className="text-base leading-none"></span>
                  <div className="text-left leading-none">
                    <span className="text-[8px] uppercase tracking-wider text-white/70 block">Download on</span>
                    <span className="text-[11px] font-bold">App Store</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Smartphone Graphic preview on right */}
            <div className="hidden sm:block absolute -right-4 -bottom-6 w-44 lg:w-48 h-56 select-none pointer-events-none">
              <div className="w-full h-full rounded-2xl border-4 border-neutral-800 bg-neutral-900 p-2 shadow-2xl flex flex-col justify-center items-center text-center transform rotate-[-8deg] hover:rotate-0 transition-transform duration-300">
                <div className="w-12 h-1 rounded-full bg-neutral-700 mb-4" />
                <span className="text-[#A3E635] font-serif font-black text-lg">Vanom™</span>
                <span className="text-[9px] text-white/60 mt-1">Faster shopping on app</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default NewsletterAppBanner;

