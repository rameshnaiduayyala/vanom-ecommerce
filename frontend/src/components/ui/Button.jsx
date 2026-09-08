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
      primary: "bg-[rgb(60,170,130)] text-white hover:bg-[rgb(48,150,113)] active:bg-[rgb(38,130,96)] focus:ring-[rgb(60,170,130)] font-bold shadow-xs hover:shadow-md",
      emerald: "bg-[rgb(60,170,130)] text-white hover:bg-[rgb(48,150,113)] active:bg-[rgb(38,130,96)] focus:ring-[rgb(60,170,130)] font-bold shadow-xs hover:shadow-md",
      lime: "bg-[#84CC16] text-slate-950 hover:bg-[#74B626] active:bg-[#65A30D] focus:ring-lime-500 font-extrabold shadow-sm hover:shadow-md",
      secondary: "bg-white text-slate-900 border border-slate-200/80 hover:border-[rgb(60,170,130)] hover:bg-[rgb(60,170,130)]/10 hover:text-[rgb(38,130,96)] focus:ring-[rgb(60,170,130)] font-semibold shadow-xs",
      gold: "bg-[#D9A000] text-slate-950 font-bold hover:bg-[#C89000] active:bg-[#9A6F00] focus:ring-gold-500 shadow-xs hover:shadow-sm",
      outline: "bg-transparent text-[rgb(60,170,130)] border-2 border-[rgb(60,170,130)] hover:bg-[rgb(60,170,130)]/10 font-bold focus:ring-[rgb(60,170,130)]",
      frosted: "bg-white/10 text-white border border-white/25 hover:bg-white/20 backdrop-blur-sm font-bold focus:ring-white/50",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 font-bold shadow-xs",
      ghost: "bg-transparent text-slate-700 hover:text-[rgb(60,170,130)] hover:bg-[rgb(60,170,130)]/10 focus:ring-[rgb(60,170,130)] font-semibold",
      link: "bg-transparent text-[rgb(60,170,130)] hover:underline p-0 focus:ring-0 font-bold",
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
