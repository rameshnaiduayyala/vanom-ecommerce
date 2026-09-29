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
            <div className="relative z-10 max-w-md space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#F9BC15] text-[#003D2B] mb-2 shadow-xs">
                  <span>🚀</span> Coming Soon
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Download Our App
                </h3>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Shop anytime, anywhere on iOS & Android.
                </p>
              </div>

              {/* App Store / Google Play Buttons Side by Side */}
              <div className="flex items-center gap-2 sm:gap-2.5 pt-1">
                {/* Google Play */}
                <div
                  className="flex items-center gap-2 bg-black/90 hover:bg-black border border-white/20 text-white px-3 py-2 rounded-xl transition-all shadow-sm select-none shrink-0"
                  title="Google Play App (Coming Soon)"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3.61 1.814L13.793 12L3.611 22.186a1 1 0 0 1-.61-.92V2.735a1 1 0 0 1 .609-.921" fill="#00D7FF" />
                    <path d="M14.5 12.707l2.302 2.302l-10.937 6.333z" fill="#FF3A44" />
                    <path d="M17.699 9.509l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.207 12z" fill="#FFC107" />
                    <path d="M5.865 2.658L16.803 8.99L14.5 11.293z" fill="#00E676" />
                  </svg>
                  <div className="text-left leading-tight">
                    <span className="text-[8px] uppercase tracking-wider text-white/60 block">GET IT ON</span>
                    <span className="text-[11px] sm:text-xs font-bold tracking-tight">Google Play</span>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#F9BC15] tracking-wide ml-0.5 shrink-0">
                    Soon
                  </span>
                </div>

                {/* App Store */}
                <div
                  className="flex items-center gap-2 bg-black/90 hover:bg-black border border-white/20 text-white px-3 py-2 rounded-xl transition-all shadow-sm select-none shrink-0"
                  title="App Store App (Coming Soon)"
                >
                  <svg className="w-5 h-5 shrink-0 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.34-.56.64-1.05 1.71-.92 2.73 1 .08 2-.47 2.61-1.22z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <span className="text-[8px] uppercase tracking-wider text-white/60 block">Download on</span>
                    <span className="text-[11px] sm:text-xs font-bold tracking-tight">App Store</span>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#F9BC15] tracking-wide ml-0.5 shrink-0">
                    Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Smartphone Graphic preview on right */}
            <div className="hidden sm:block absolute -right-4 -bottom-6 w-44 lg:w-48 h-56 select-none pointer-events-none">
              <div className="w-full h-full rounded-2xl border-4 border-neutral-800 bg-neutral-900 p-3 shadow-2xl flex flex-col justify-center items-center text-center transform rotate-[-8deg] hover:rotate-0 transition-transform duration-300">
                <div className="w-12 h-1 rounded-full bg-neutral-700 mb-3" />
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#F9BC15] text-[#003D2B] rounded-full mb-1.5">
                  Coming Soon
                </span>
                <span className="text-[#A3E635] font-serif font-black text-lg">Vanom™</span>
                <span className="text-[9px] text-white/60 mt-1">iOS & Android App</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default NewsletterAppBanner;

