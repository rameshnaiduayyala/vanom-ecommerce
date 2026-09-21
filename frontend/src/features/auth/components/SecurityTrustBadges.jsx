import React from "react";
import { LockKeyhole, CheckCircle2 } from "lucide-react";

export function SecurityTrustBadges({
  firstLabel = "256-Bit SSL Encrypted",
  secondLabel = "Buyer Protection",
}) {
  return (
    <div className="flex items-center justify-center gap-4 text-[11px] text-[#5E7D67] pt-2">
      <div className="flex items-center gap-1.5">
        <LockKeyhole className="w-3.5 h-3.5 text-[#00875A]" />
        <span>{firstLabel}</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
        <span>{secondLabel}</span>
      </div>
    </div>
  );
}

export default SecurityTrustBadges;
