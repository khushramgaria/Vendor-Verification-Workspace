import React from "react";

/**
 * Standardized input component integrated with react-hook-form or standard inputs.
 */
const Input = React.forwardRef(
  (
    {
      label,
      name,
      type = "text",
      error,
      placeholder,
      required = false,
      className = "",
      helperText,
      icon: Icon,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={name}
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-red-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative rounded-lg group">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-600 transition-colors">
              <Icon className="h-4 w-4 shrink-0" />
            </div>
          )}
          <input
            id={name}
            name={name}
            type={type}
            ref={ref}
            placeholder={placeholder}
            className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm font-semibold border rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
              error
                ? "border-red-500 bg-red-50/30 focus:ring-red-500/20 focus:border-red-600"
                : "border-slate-300 hover:border-slate-400"
            } ${Icon ? "pl-10" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 font-bold mt-1">
            {error.message || error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
