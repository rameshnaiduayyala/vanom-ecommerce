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
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variants = {
      primary: "bg-[#074428] text-white hover:bg-[#0a5634] active:bg-[#05331e] focus:ring-[#074428] font-bold shadow-xs hover:shadow-md",
      emerald: "bg-[#059669] text-white hover:bg-[#047857] active:bg-[#065f46] focus:ring-emerald-500 font-bold shadow-xs hover:shadow-md",
      lime: "bg-[#84CC16] text-slate-950 hover:bg-[#74B626] active:bg-[#65A30D] focus:ring-lime-500 font-extrabold shadow-sm hover:shadow-md",
      secondary: "bg-white text-slate-900 border border-slate-200/80 hover:border-emerald-600 hover:bg-emerald-50/40 hover:text-emerald-900 focus:ring-emerald-500 font-semibold shadow-xs",
      gold: "bg-[#D9A000] text-slate-950 font-bold hover:bg-[#C89000] active:bg-[#9A6F00] focus:ring-gold-500 shadow-xs hover:shadow-sm",
      outline: "bg-transparent text-[#074428] border-2 border-[#074428] hover:bg-[#074428]/5 font-bold focus:ring-[#074428]",
      frosted: "bg-white/10 text-white border border-white/25 hover:bg-white/20 backdrop-blur-sm font-bold focus:ring-white/50",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 font-bold shadow-xs",
      ghost: "bg-transparent text-slate-700 hover:text-[#074428] hover:bg-emerald-50/60 focus:ring-emerald-500 font-semibold",
      link: "bg-transparent text-[#074428] hover:underline p-0 focus:ring-0 font-bold",
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
