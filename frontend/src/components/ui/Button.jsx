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
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary: "bg-[#008522] text-white hover:bg-[#006B1B] active:bg-[#005616] focus:ring-brand-500 font-bold shadow-xs hover:shadow-sm",
      secondary: "bg-white text-slate-900 border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 hover:text-brand-800 focus:ring-brand-500 font-semibold shadow-xs",
      gold: "bg-[#D9A000] text-slate-950 font-bold hover:bg-[#C89000] active:bg-[#9A6F00] focus:ring-gold-500 shadow-xs hover:shadow-sm",
      outline: "bg-transparent text-[#008522] border-2 border-[#008522] hover:bg-brand-50 font-bold focus:ring-brand-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 font-bold shadow-xs",
      ghost: "bg-transparent text-slate-700 hover:text-brand-700 hover:bg-brand-50/60 focus:ring-brand-500 font-semibold",
      link: "bg-transparent text-[#008522] hover:underline p-0 focus:ring-0 font-bold",
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
