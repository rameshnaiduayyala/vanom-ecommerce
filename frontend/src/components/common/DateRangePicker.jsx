import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronDown, X, Check } from "lucide-react";

/**
 * Quick date helper: returns "YYYY-MM-DD" string for local timezone
 */
export function toISODateString(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DATE_PRESETS = [
  { label: "Today", value: "today", days: 0 },
  { label: "1 Week", value: "7d", days: 7 },
  { label: "1 Month", value: "30d", days: 30 },
  { label: "All Time", value: "all", days: null },
];

/**
 * Reusable Date Range Picker with Quick Presets (Today, 1 Week, 1 Month, All Time)
 * and Custom Start/End Date Range Selection.
 *
 * @param {Object} props
 * @param {string} [props.startDate=""] - Initial start date ("YYYY-MM-DD")
 * @param {string} [props.endDate=""] - Initial end date ("YYYY-MM-DD")
 * @param {string} [props.preset="all"] - Initial preset ("today" | "7d" | "30d" | "all" | "custom")
 * @param {Function} props.onChange - ({ startDate, endDate, preset, label }) => void
 * @param {boolean} [props.showInlinePills=true] - Whether to show quick preset pills (Today, 1 Week, 1 Month) inline
 * @param {string} [props.className=""] - Wrapper classes
 * @param {string} [props.align="right"] - "left" | "right" alignment for the popover
 */
export function DateRangePicker({
  startDate = "",
  endDate = "",
  preset = "all",
  onChange,
  showInlinePills = true,
  className = "",
  align = "right",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(preset || "all");
  const [customStart, setCustomStart] = useState(startDate ? toISODateString(startDate) : "");
  const [customEnd, setCustomEnd] = useState(endDate ? toISODateString(endDate) : "");

  const popoverRef = useRef(null);

  // Sync state if props change from outside
  useEffect(() => {
    setActivePreset(preset || "all");
    setCustomStart(startDate ? toISODateString(startDate) : "");
    setCustomEnd(endDate ? toISODateString(endDate) : "");
  }, [preset, startDate, endDate]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dates based on preset
  const applyPreset = (presetVal) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const endStr = toISODateString(today);

    let startStr = "";
    let label = "All Time";

    if (presetVal === "today") {
      startStr = toISODateString(new Date());
      label = "Today";
    } else if (presetVal === "7d") {
      const past7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      startStr = toISODateString(past7);
      label = "Last 7 Days (1 Week)";
    } else if (presetVal === "30d") {
      const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      startStr = toISODateString(past30);
      label = "Last 30 Days (1 Month)";
    } else if (presetVal === "all") {
      startStr = "";
      label = "All Time";
    }

    setActivePreset(presetVal);
    setCustomStart(startStr);
    setCustomEnd(presetVal === "all" ? "" : endStr);
    setIsOpen(false);

    if (onChange) {
      onChange({
        preset: presetVal,
        startDate: startStr,
        endDate: presetVal === "all" ? "" : endStr,
        label,
      });
    }
  };

  // Apply custom date range
  const handleApplyCustom = () => {
    if (!customStart && !customEnd) {
      applyPreset("all");
      return;
    }

    const start = customStart || customEnd;
    const end = customEnd || customStart;

    setActivePreset("custom");
    setIsOpen(false);

    if (onChange) {
      onChange({
        preset: "custom",
        startDate: start,
        endDate: end,
        label: `${start} to ${end}`,
      });
    }
  };

  // Reset/Clear to All Time
  const handleClear = (e) => {
    e?.stopPropagation();
    applyPreset("all");
  };

  // Display label on the trigger button
  const triggerLabel = useMemo(() => {
    if (activePreset === "today") return "Today";
    if (activePreset === "7d") return "1 Week";
    if (activePreset === "30d") return "1 Month";
    if (activePreset === "all") return "All Time";
    if (customStart && customEnd) {
      if (customStart === customEnd) return customStart;
      return `${customStart} - ${customEnd}`;
    }
    return "Date Range";
  }, [activePreset, customStart, customEnd]);

  const hasActiveFilter = activePreset !== "all" || Boolean(customStart || customEnd);

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`} ref={popoverRef}>
      {/* ── Quick Preset Pills (Today, 1 Week, 1 Month) ── */}
      {showInlinePills && (
        <div className="hidden sm:inline-flex items-center p-0.5 rounded-lg border border-slate-200 bg-slate-100/80 text-[11px] font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => applyPreset("today")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activePreset === "today"
                ? "bg-white text-emerald-800 shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => applyPreset("7d")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activePreset === "7d"
                ? "bg-white text-emerald-800 shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            1 Week
          </button>
          <button
            type="button"
            onClick={() => applyPreset("30d")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activePreset === "30d"
                ? "bg-white text-emerald-800 shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            1 Month
          </button>
        </div>
      )}

      {/* ── Main Dropdown Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
          hasActiveFilter
            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        <Calendar className={`w-3.5 h-3.5 ${hasActiveFilter ? "text-[#00875A]" : "text-slate-400"}`} />
        <span className="font-mono">{triggerLabel}</span>
        {hasActiveFilter ? (
          <span
            onClick={handleClear}
            className="p-0.5 hover:bg-emerald-200/60 rounded-full transition-colors text-emerald-700 ml-0.5"
            title="Clear date filter"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-400" />
        )}
      </button>

      {/* ── Popover Panel ── */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-3.5 z-50 space-y-3 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00875A]" />
              <span>Filter by Date Range</span>
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Quick Preset Buttons Inside Popover */}
          <div className="grid grid-cols-2 gap-1.5">
            {DATE_PRESETS.map((p) => {
              const isActive = activePreset === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => applyPreset(p.value)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{p.label}</span>
                  {isActive && <Check className="w-3 h-3 text-[#00875A]" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Inputs */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Custom Range
            </span>

            <div className="space-y-1.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setCustomStart(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#00875A] font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => {
                    setCustomEnd(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#00875A] font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Popover Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="px-3 py-1 bg-[#00875A] hover:bg-[#007048] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
