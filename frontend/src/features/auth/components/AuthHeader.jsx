import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes.js";

export function AuthHeader({ title, subtitle, badgeText }) {
  return (
    <div className="text-center space-y-2">
      <Link to={ROUTES.HOME} className="inline-block hover:opacity-90 transition-opacity">
        <img
          src="/logo.png"
          alt="Vanom"
          className="h-10 sm:h-12 w-auto object-contain mx-auto mb-1"
        />
      </Link>
      {badgeText && (
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#E6F4EA] text-[#00875A] px-2.5 py-0.5 rounded-full border border-[#00875A]/20">
            {badgeText}
          </span>
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-[#5E7D67] max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default AuthHeader;
