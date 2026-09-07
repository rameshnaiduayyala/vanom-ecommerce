import React, { useState } from "react";
import { Mail, Smartphone, ArrowRight } from "lucide-react";

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
    <section className="py-8 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Newsletter */}
          <div className="bg-[#EAF7F0] rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#006B3C]" />
              <h3 className="text-base font-black text-[#003D2B]">Get the Latest Updates</h3>
            </div>
            <p className="text-xs text-gray-600">New arrivals, exclusive offers and more</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-[#006B3C] text-sm font-bold">
                ✓ Successfully subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-[#006B3C]/30 focus:outline-none focus:border-[#006B3C] bg-white"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#003D2B] hover:bg-[#006B3C] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* App Download */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-3"
            style={{ background: "linear-gradient(135deg, #003D2B, #006B3C)" }}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#D9A514]" />
              <h3 className="text-base font-black text-white">Download Our App</h3>
            </div>
            <p className="text-xs text-emerald-200">Shop anytime, anywhere</p>
            <div className="flex gap-2 mt-1">
              <a
                href="#"
                className="flex items-center gap-1.5 bg-black text-white text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                🍎 App Store
              </a>
              <a
                href="#"
                className="flex items-center gap-1.5 bg-black text-white text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                ▶ Google Play
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterAppBanner;
