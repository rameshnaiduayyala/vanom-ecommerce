import React from "react";
import { cn } from "../../utils/cn.js";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      type = "button",
      icon: Icon,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary: "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 shadow-sm",
      secondary: "bg-white text-text-primary border border-border hover:bg-surface-muted focus:ring-brand-500 shadow-sm",
      gold: "bg-gold-500 text-text-primary font-semibold hover:bg-gold-600 focus:ring-gold-500 shadow-sm",
      outline: "bg-transparent text-brand-600 border border-brand-500 hover:bg-brand-50 focus:ring-brand-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
      ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted focus:ring-brand-500",
      link: "bg-transparent text-brand-600 hover:underline p-0 focus:ring-0",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "p-2 aspect-square",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
            {children}
            {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
