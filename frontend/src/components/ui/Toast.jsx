import React, { useEffect, useState } from "react";
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
      border: "border-emerald-500/30",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      barBg: "bg-emerald-500",
      icon: CheckCircle2,
      shadow: "shadow-emerald-500/5",
    },
    error: {
      border: "border-red-500/30",
      accentBg: "bg-red-500/10 text-red-600 dark:text-red-400",
      barBg: "bg-red-500",
      icon: AlertCircle,
      shadow: "shadow-red-500/5",
    },
    warning: {
      border: "border-amber-500/30",
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      barBg: "bg-amber-500",
      icon: AlertTriangle,
      shadow: "shadow-amber-500/5",
    },
    info: {
      border: "border-brand-500/30",
      accentBg: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
      barBg: "bg-brand-500",
      icon: Info,
      shadow: "shadow-brand-500/5",
    },
  };

  const config = configs[toastItem.type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 shadow-[0_10px_35px_-4px_rgba(0,0,0,0.12)] transition-all duration-300 animate-in slide-in-from-top-3 sm:slide-in-from-bottom-3 fade-in",
        config.border,
        config.shadow
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Glowing Icon Capsule */}
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", config.accentBg)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-[13px] font-bold text-text-primary dark:text-white tracking-tight">
              {toastItem.title}
            </h5>
            <span className="text-[10px] font-medium text-text-muted dark:text-slate-400 shrink-0">
              just now
            </span>
          </div>

          {toastItem.message && (
            <p className="mt-0.5 text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
              {toastItem.message}
            </p>
          )}

          {toastItem.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  toastItem.action.onClick?.();
                  onDismiss(toastItem.id);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
              >
                <span>{toastItem.action.label}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(toastItem.id)}
          className="text-text-muted hover:text-text-primary dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-surface-muted dark:hover:bg-slate-800 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Auto-dismiss Animated Progress Bar */}
      {toastItem.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/40 dark:bg-slate-800">
          <div
            className={cn("h-full transition-all duration-100 ease-linear", config.barBg)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toastItem={item} onDismiss={removeToast} />
      ))}
    </div>
  );
}

export { toast };
