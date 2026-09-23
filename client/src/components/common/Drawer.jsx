import React, { useEffect } from "react";
import { X } from "lucide-react";

const Drawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-xl",
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 z-10 pointer-events-none">
        <div
          className={`pointer-events-auto w-screen ${width} transform bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-y-auto p-6 bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
