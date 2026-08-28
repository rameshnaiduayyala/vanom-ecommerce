import React from "react";
import { cn } from "../../utils/cn.js";

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-border overflow-hidden transition-all duration-200",
        hover && "hover:shadow-md hover:border-brand-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn("p-5 border-b border-border flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn("text-base font-semibold text-text-primary", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn("text-xs text-text-muted mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn("p-4 bg-surface-muted border-t border-border flex items-center justify-end gap-3", className)} {...props}>
      {children}
    </div>
  );
}
