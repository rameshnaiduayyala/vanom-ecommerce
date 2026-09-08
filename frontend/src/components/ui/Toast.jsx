import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore, toast } from "../../stores/ui.store.js";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../utils/cn.js";

function ToastItem({ toastItem, onDismiss }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toastItem.duration || toastItem.duration <= 0) return;
    const intervalTime = 20;
    const step = (intervalTime / toastItem.duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toastItem.duration]);

  const configs = {
    success: {
      icon: CheckCircle2,
      iconColor: "text-[#358B5B]",
      iconBg: "bg-[#EAF7F0] border-[#358B5B]/20",
      accentBar: "bg-[#358B5B]",
      borderColor: "border-[#358B5B]/20",
      glow: "shadow-[0_8px_30px_rgb(53,139,91,0.12)]",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50 border-rose-200/60",
      accentBar: "bg-rose-600",
      borderColor: "border-rose-200",
      glow: "shadow-[0_8px_30px_rgb(225,29,72,0.12)]",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border-amber-200/60",
      accentBar: "bg-amber-500",
      borderColor: "border-amber-200",
      glow: "shadow-[0_8px_30px_rgb(217,119,6,0.12)]",
    },
    info: {
      icon: Info,
      iconColor: "text-sky-600",
      iconBg: "bg-sky-50 border-sky-200/60",
      accentBar: "bg-sky-500",
      borderColor: "border-sky-200",
      glow: "shadow-[0_8px_30px_rgb(2,132,199,0.12)]",
    },
  };

  const config = configs[toastItem.type] || configs.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.94, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      role="alert"
      className={cn(
        "pointer-events-auto relative w-full max-w-[360px] overflow-hidden rounded-2xl border bg-white/95 backdrop-blur-xl p-3.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.14)] select-none",
        config.borderColor,
        config.glow
      )}
    >
      <div className="flex items-start gap-3">
        {/* Modern Circular Icon */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
            config.iconBg
          )}
        >
          <Icon className={cn("h-4 w-4", config.iconColor)} strokeWidth={2.2} />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-[13px] font-bold text-gray-900 tracking-tight leading-tight">
              {toastItem.title}
            </h5>
            <span className="text-[10px] font-medium text-gray-400 shrink-0">
              just now
            </span>
          </div>

          {toastItem.message && (
            <p className="mt-0.5 text-xs text-gray-600 leading-snug line-clamp-2">
              {toastItem.message}
            </p>
          )}

          {toastItem.action && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  toastItem.action.onClick?.();
                  onDismiss(toastItem.id);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#358B5B] hover:text-[#204B38] hover:underline"
              >
                <span>{toastItem.action.label}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Minimalist Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(toastItem.id)}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Slim Progress Bar */}
      {toastItem.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100">
          <div
            className={cn("h-full transition-all duration-100 ease-linear opacity-80", config.accentBar)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-[360px] w-[calc(100vw-32px)] sm:w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <ToastItem key={item.id} toastItem={item} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export { toast };
