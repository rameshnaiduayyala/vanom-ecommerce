import React from "react";
import { cn } from "../../utils/cn.js";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "./Button.jsx";
import { Modal } from "./Modal.jsx";

export function Alert({ title, children, variant = "info", className, onClose }) {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
  };

  const variants = {
    info: "bg-blue-50/70 border-blue-200 text-blue-900",
    success: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
    warning: "bg-amber-50/70 border-amber-200 text-amber-900",
    danger: "bg-red-50/70 border-red-200 text-red-900",
  };

  return (
    <div className={cn("rounded-lg border p-3 flex gap-3 text-xs relative", variants[variant], className)}>
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-70 hover:opacity-100 p-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function Spinner({ size = "md", className }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  return <Loader2 className={cn("animate-spin text-brand-500", sizes[size], className)} />;
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse bg-surface-muted rounded-md", className)} />;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "No items found",
  description = "There are no records to display at this moment.",
  action,
  className,
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-text-muted mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-text-primary mb-1">{title}</h4>
      <p className="text-xs text-text-muted max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-text-secondary mb-5">{description}</p>
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
