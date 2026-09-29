import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

export function B2BNotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        title="Wholesale Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
          3
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Wholesale Alerts</span>
            <span className="text-[10px] text-emerald-700 font-bold">3 Unread</span>
          </div>
          <div className="p-2 space-y-1 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <p className="font-semibold text-slate-800">Volume Tier Active</p>
              <p className="text-[11px] text-slate-500">Tier 3 discount unlocked on Basmati Rice.</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <p className="font-semibold text-slate-800">Quote #RFQ-402 Approved</p>
              <p className="text-[11px] text-slate-500">Commercial pricing ready for checkout.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default B2BNotificationsDropdown;
