import React from "react";
import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { Button } from "../ui/Button.jsx";

/**
 * Reusable EmptyState component
 */
export function EmptyState({
  icon: Icon = PackageOpen,
  title = "No items found",
  description = "There are no records matching your criteria at this moment.",
  actionText,
  actionLink,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-surface-subtle ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-white border border-border flex items-center justify-center text-brand-600 shadow-xs mb-4">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-md mb-6">{description}</p>

      {actionText && (
        actionLink ? (
          <Link to={actionLink}>
            <Button variant="primary">{actionText}</Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        )
      )}
    </div>
  );
}

export default EmptyState;
