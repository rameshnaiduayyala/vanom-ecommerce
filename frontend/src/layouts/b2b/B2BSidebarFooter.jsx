import React from "react";
import { Building2 } from "lucide-react";

export function B2BSidebarFooter({ collapsed = false }) {
  return (
    <div className="p-3 bg-[#002D20] text-emerald-200">
      {!collapsed ? (
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Wholesale B2B</p>
            <p className="text-[10px] text-emerald-300/60">Commercial Tier</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-1">
          <Building2 className="w-4 h-4 text-amber-400" />
        </div>
      )}
    </div>
  );
}

export default B2BSidebarFooter;
