import React from "react";
import { cn } from "../../utils/cn.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-white">
      <table className={cn("w-full text-left text-sm text-text-primary", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return <thead className={cn("bg-surface-muted border-b border-border text-xs uppercase tracking-wider text-text-secondary", className)}>{children}</thead>;
}

export function TableBody({ children, className }) {
  return <tbody className={cn("divide-y divide-border", className)}>{children}</tbody>;
}

export function TableRow({ children, className, hover = true }) {
  return (
    <tr className={cn(hover && "hover:bg-surface-muted/50 transition-colors", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return <th className={cn("px-4 py-3 font-semibold text-text-secondary", className)}>{children}</th>;
}

export function TableCell({ children, className }) {
  return <td className={cn("px-4 py-3 text-sm text-text-primary", className)}>{children}</td>;
}

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn("border-b border-border flex gap-4", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "pb-3 text-sm font-medium border-b-2 transition-colors -mb-px px-1",
            activeTab === tab.id
              ? "border-brand-500 text-brand-600 font-semibold"
              : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
          )}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-surface-muted text-text-muted">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between py-3 px-2", className)}>
      <p className="text-xs text-text-muted">
        Page <span className="font-semibold text-text-primary">{currentPage}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Breadcrumb({ items = [], className }) {
  return (
    <nav className={cn("flex items-center gap-2 text-xs text-text-muted", className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-text-muted">/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-brand-600 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
