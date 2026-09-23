import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow border border-transparent focus:ring-2 focus:ring-blue-500/30",
  secondary:
    "bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white shadow-sm border border-transparent focus:ring-2 focus:ring-slate-500/30",
  outline:
    "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-slate-400/20 shadow-sm",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm border border-transparent focus:ring-2 focus:ring-red-500/30",
  ghost:
    "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-md",
  md: "px-4 py-2.5 text-sm font-semibold rounded-lg",
  lg: "px-5 py-3 text-base font-semibold rounded-lg",
};

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = "",
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 ease-in-out cursor-pointer select-none focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2 -ml-0.5 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
